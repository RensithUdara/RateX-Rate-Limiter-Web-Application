package limiter

import (
	"context"
	"fmt"
	"time"

	goredis "github.com/redis/go-redis/v9"
)

type FixedWindow struct {
	client *goredis.Client
	limit  int
	window time.Duration
	prefix string
}

func NewFixedWindow(client *goredis.Client, limit int, window time.Duration) *FixedWindow {
	return &FixedWindow{client: client, limit: limit, window: window, prefix: "rl:fixed"}
}

func (l *FixedWindow) Allow(ctx context.Context, key string) (Result, error) {
	now := time.Now()
	windowID := now.Unix() / int64(l.window.Seconds())
	redisKey := fmt.Sprintf("%s:%s:%d", l.prefix, key, windowID)

	count, err := l.client.Incr(ctx, redisKey).Result()
	if err != nil {
		return Result{}, err
	}
	if count == 1 {
		if err := l.client.Expire(ctx, redisKey, l.window).Err(); err != nil {
			return Result{}, err
		}
	}

	ttl := l.client.TTL(ctx, redisKey).Val()
	resetAfter := int(ttl.Seconds())
	if resetAfter < 0 {
		resetAfter = int(l.window.Seconds())
	}
	remaining := l.limit - int(count)
	if remaining < 0 {
		remaining = 0
	}
	return Result{
		Allowed:    int(count) <= l.limit,
		Remaining:  remaining,
		RetryAfter: resetAfter,
		Limit:      l.limit,
		ResetAfter: resetAfter,
	}, nil
}
