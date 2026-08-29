package limiter

import (
	"context"
	"sync"
	"time"
)

type MemoryTokenBucket struct {
	mu       sync.Mutex
	buckets  map[string]memoryBucket
	capacity int
	window   time.Duration
}

type memoryBucket struct {
	tokens     float64
	lastRefill time.Time
}

func NewMemoryTokenBucket(capacity int, window time.Duration) *MemoryTokenBucket {
	return &MemoryTokenBucket{
		buckets:  make(map[string]memoryBucket),
		capacity: capacity,
		window:   window,
	}
}

func (l *MemoryTokenBucket) Allow(_ context.Context, key string) (Result, error) {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	bucket, ok := l.buckets[key]
	if !ok {
		bucket = memoryBucket{tokens: float64(l.capacity), lastRefill: now}
	}

	refillRate := float64(l.capacity) / l.window.Seconds()
	elapsed := now.Sub(bucket.lastRefill).Seconds()
	bucket.tokens = min(float64(l.capacity), bucket.tokens+(elapsed*refillRate))
	bucket.lastRefill = now

	allowed := bucket.tokens >= 1
	retryAfter := 0
	if allowed {
		bucket.tokens--
	} else {
		retryAfter = int((1 - bucket.tokens) / refillRate)
		if retryAfter < 1 {
			retryAfter = 1
		}
	}
	l.buckets[key] = bucket

	return Result{
		Allowed:    allowed,
		Remaining:  int(bucket.tokens),
		RetryAfter: retryAfter,
		Limit:      l.capacity,
		ResetAfter: int(l.window.Seconds()),
	}, nil
}
