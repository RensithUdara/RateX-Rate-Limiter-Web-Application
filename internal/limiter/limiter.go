package limiter

import (
	"context"
	"time"
)

type Result struct {
	Allowed    bool `json:"allowed"`
	Remaining  int  `json:"remaining"`
	RetryAfter int  `json:"retry_after"`
	Limit      int  `json:"limit"`
	ResetAfter int  `json:"reset_after"`
}

type RateLimiter interface {
	Allow(ctx context.Context, key string) (Result, error)
}

type PolicyConfig struct {
	Algorithm     string
	RequestLimit  int
	Window        time.Duration
	BurstCapacity int
}
