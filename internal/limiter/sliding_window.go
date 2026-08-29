package limiter

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	goredis "github.com/redis/go-redis/v9"
	ratexredis "ratex/internal/redis"
)

type SlidingWindow struct {
	client *goredis.Client
	limit  int
	window time.Duration
	prefix string
}

func NewSlidingWindow(client *goredis.Client, limit int, window time.Duration) *SlidingWindow {
	return &SlidingWindow{client: client, limit: limit, window: window, prefix: "rl:sliding"}
}

func (l *SlidingWindow) Allow(ctx context.Context, key string) (Result, error) {
	now := time.Now().UnixMilli()
	ttl := int64((l.window * 2).Milliseconds())
	values, err := l.client.Eval(ctx, ratexredis.SlidingWindowScript, []string{fmt.Sprintf("%s:%s", l.prefix, key)}, l.limit, l.window.Milliseconds(), now, uuid.NewString(), ttl).Slice()
	if err != nil {
		return Result{}, err
	}
	return parseScriptResult(values, int(l.window.Seconds()))
}
