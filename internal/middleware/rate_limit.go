package middleware

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	goredis "github.com/redis/go-redis/v9"
	"ratex/internal/config"
	"ratex/internal/limiter"
	"ratex/internal/metrics"
	"ratex/internal/model"
	"ratex/internal/repository"
	"ratex/internal/service"
)

type LimiterFactory struct {
	redis   *goredis.Client
	cfg     config.Config
	mu      sync.Mutex
	limiter map[string]limiter.RateLimiter
}

func NewLimiterFactory(redis *goredis.Client, cfg config.Config) *LimiterFactory {
	return &LimiterFactory{redis: redis, cfg: cfg, limiter: make(map[string]limiter.RateLimiter)}
}

func (f *LimiterFactory) FromPolicy(policy model.Policy) limiter.RateLimiter {
	cacheKey := fmt.Sprintf("%s:%d:%d:%d:%s", policy.Algorithm, policy.RequestLimit, policy.WindowSeconds, policy.BurstCapacity, f.cfg.RateLimitBackend)
	f.mu.Lock()
	if lim, ok := f.limiter[cacheKey]; ok {
		f.mu.Unlock()
		return lim
	}
	f.mu.Unlock()

	window := time.Duration(policy.WindowSeconds) * time.Second
	if f.cfg.RateLimitBackend == "memory" || f.redis == nil {
		capacity := policy.BurstCapacity
		if capacity <= 0 {
			capacity = policy.RequestLimit
		}
		lim := limiter.NewMemoryTokenBucket(capacity, window)
		f.mu.Lock()
		f.limiter[cacheKey] = lim
		f.mu.Unlock()
		return lim
	}

	var lim limiter.RateLimiter
	switch policy.Algorithm {
	case model.AlgorithmFixedWindow:
		lim = limiter.NewFixedWindow(f.redis, policy.RequestLimit, window)
	case model.AlgorithmSlidingWindow:
		lim = limiter.NewSlidingWindow(f.redis, policy.RequestLimit, window)
	default:
		capacity := policy.BurstCapacity
		if capacity <= 0 {
			capacity = policy.RequestLimit
		}
		lim = limiter.NewTokenBucket(f.redis, capacity, window)
	}
	f.mu.Lock()
	f.limiter[cacheKey] = lim
	f.mu.Unlock()
	return lim
}

func (f *LimiterFactory) Default() limiter.RateLimiter {
	policy := model.Policy{
		Algorithm:     f.cfg.DefaultAlgorithm,
		RequestLimit:  f.cfg.DefaultLimit,
		WindowSeconds: int(f.cfg.DefaultWindow.Seconds()),
		BurstCapacity: f.cfg.DefaultBurstCapacity,
	}
	return f.FromPolicy(policy)
}

func RateLimit(cfg config.Config, defaultLimiter limiter.RateLimiter, apiKeys *repository.APIKeyRepository, factory *LimiterFactory) gin.HandlerFunc {
	return RateLimitWithTelemetry(cfg, defaultLimiter, apiKeys, factory, nil, nil)
}

func RateLimitWithTelemetry(cfg config.Config, defaultLimiter limiter.RateLimiter, apiKeys *repository.APIKeyRepository, factory *LimiterFactory, events *repository.RequestEventRepository, routePolicies *repository.RoutePolicyRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		route := c.FullPath()
		if route == "" {
			route = c.Request.URL.Path
		}
		metrics.RequestsTotal.WithLabelValues(route, c.Request.Method).Inc()
		started := time.Now()
		defer metrics.RateLimitLatency.Observe(time.Since(started).Seconds())

		identity, identityType, identityValue, policy, found, err := identify(c, apiKeys)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid_api_key"})
			return
		}

		lim := defaultLimiter
		policyName := "default"
		if routePolicies != nil {
			routePolicy, routeFound, err := routePolicies.FindPolicy(c.Request.Context(), c.Request.Method, route)
			if err == nil && routeFound {
				policy = routePolicy
				found = true
			}
		}
		if found {
			lim = factory.FromPolicy(policy)
			policyName = policy.Name
		}
		result, err := lim.Allow(c.Request.Context(), fmt.Sprintf("%s:%s", identity, route))
		if err != nil {
			metrics.RedisErrorsTotal.Inc()
			if cfg.RateLimitFailureMode == "open" {
				c.Header("X-RateLimit-Policy", "fail-open")
				c.Next()
				return
			}
			c.AbortWithStatusJSON(http.StatusServiceUnavailable, gin.H{"error": "rate_limiter_unavailable"})
			return
		}

		setHeaders(c, result)
		if !result.Allowed {
			metrics.RejectedRequestsTotal.WithLabelValues(route).Inc()
			recordEvent(events, model.RequestEvent{
				Method:        c.Request.Method,
				Route:         route,
				IdentityType:  identityType,
				IdentityValue: identityValue,
				PolicyName:    policyName,
				Allowed:       false,
				StatusCode:    http.StatusTooManyRequests,
				RequestLimit:  result.Limit,
				Remaining:     result.Remaining,
				RetryAfter:    result.RetryAfter,
				DurationMS:    int(time.Since(started).Milliseconds()),
			})
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":       "rate_limit_exceeded",
				"message":     "Too many requests",
				"retry_after": result.RetryAfter,
			})
			return
		}
		metrics.AllowedRequestsTotal.WithLabelValues(route).Inc()
		c.Next()
		recordEvent(events, model.RequestEvent{
			Method:        c.Request.Method,
			Route:         route,
			IdentityType:  identityType,
			IdentityValue: identityValue,
			PolicyName:    policyName,
			Allowed:       true,
			StatusCode:    c.Writer.Status(),
			RequestLimit:  result.Limit,
			Remaining:     result.Remaining,
			RetryAfter:    result.RetryAfter,
			DurationMS:    int(time.Since(started).Milliseconds()),
		})
	}
}

func identify(c *gin.Context, apiKeys *repository.APIKeyRepository) (string, string, string, model.Policy, bool, error) {
	rawKey := ExtractAPIKey(c)
	if rawKey != "" {
		key, policy, err := apiKeys.FindByHash(c.Request.Context(), service.HashAPIKey(rawKey))
		if err != nil {
			return "", "", "", model.Policy{}, false, err
		}
		return "key:" + key.ID, "api_key", key.KeyPrefix, policy, true, nil
	}
	ip := c.ClientIP()
	if forwarded := strings.TrimSpace(c.GetHeader("X-Forwarded-For")); forwarded != "" {
		ip = strings.TrimSpace(strings.Split(forwarded, ",")[0])
	}
	if ip == "" {
		return "", "", "", model.Policy{}, false, errors.New("missing client identity")
	}
	return "ip:" + ip, "ip", ip, model.Policy{}, false, nil
}

func setHeaders(c *gin.Context, result limiter.Result) {
	c.Header("X-RateLimit-Limit", strconv.Itoa(result.Limit))
	c.Header("X-RateLimit-Remaining", strconv.Itoa(result.Remaining))
	c.Header("X-RateLimit-Reset", strconv.Itoa(result.ResetAfter))
	if !result.Allowed {
		c.Header("Retry-After", strconv.Itoa(result.RetryAfter))
	}
}

func recordEvent(events *repository.RequestEventRepository, event model.RequestEvent) {
	if events == nil {
		return
	}
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		_ = events.Insert(ctx, event)
	}()
}
