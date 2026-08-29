package limiter

import (
	"context"
	"fmt"
	"time"

	goredis "github.com/redis/go-redis/v9"
	ratexredis "ratex/internal/redis"
)

type TokenBucket struct {
	client   *goredis.Client
	capacity int
	window   time.Duration
	prefix   string
}

func NewTokenBucket(client *goredis.Client, capacity int, window time.Duration) *TokenBucket {
	return &TokenBucket{client: client, capacity: capacity, window: window, prefix: "rl:token"}
}

func (l *TokenBucket) Allow(ctx context.Context, key string) (Result, error) {
	if l.capacity <= 0 {
		return Result{Allowed: false, Limit: l.capacity, RetryAfter: 1}, nil
	}
	windowSeconds := l.window.Seconds()
	if windowSeconds <= 0 {
		windowSeconds = 60
	}
	refillRate := float64(l.capacity) / windowSeconds
	ttl := int64((l.window * 2).Milliseconds())
	now := time.Now().UnixMilli()

	values, err := l.client.Eval(ctx, ratexredis.TokenBucketScript, []string{fmt.Sprintf("%s:%s", l.prefix, key)}, l.capacity, refillRate, now, 1, ttl).Slice()
	if err != nil {
		return Result{}, err
	}
	return parseScriptResult(values, int(l.window.Seconds()))
}

func parseScriptResult(values []interface{}, resetAfter int) (Result, error) {
	if len(values) < 4 {
		return Result{}, fmt.Errorf("unexpected redis script result: %v", values)
	}
	allowed, err := toInt(values[0])
	if err != nil {
		return Result{}, err
	}
	remaining, err := toInt(values[1])
	if err != nil {
		return Result{}, err
	}
	retryAfter, err := toInt(values[2])
	if err != nil {
		return Result{}, err
	}
	limit, err := toInt(values[3])
	if err != nil {
		return Result{}, err
	}
	return Result{Allowed: allowed == 1, Remaining: remaining, RetryAfter: retryAfter, Limit: limit, ResetAfter: resetAfter}, nil
}

func toInt(value interface{}) (int, error) {
	switch typed := value.(type) {
	case int64:
		return int(typed), nil
	case string:
		var parsed int
		_, err := fmt.Sscanf(typed, "%d", &parsed)
		return parsed, err
	default:
		return 0, fmt.Errorf("unexpected numeric type %T", value)
	}
}
