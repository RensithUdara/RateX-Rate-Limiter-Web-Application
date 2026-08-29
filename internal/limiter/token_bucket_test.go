package limiter

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	goredis "github.com/redis/go-redis/v9"
)

func TestTokenBucketConcurrentLimit(t *testing.T) {
	server := miniredis.RunT(t)
	client := goredis.NewClient(&goredis.Options{Addr: server.Addr()})
	t.Cleanup(func() { _ = client.Close() })

	lim := NewTokenBucket(client, 25, time.Minute)
	var wg sync.WaitGroup
	var mu sync.Mutex
	allowed := 0

	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			result, err := lim.Allow(context.Background(), "concurrent-user")
			if err != nil {
				t.Errorf("allow failed: %v", err)
				return
			}
			if result.Allowed {
				mu.Lock()
				allowed++
				mu.Unlock()
			}
		}()
	}
	wg.Wait()

	if allowed != 25 {
		t.Fatalf("allowed = %d, want 25", allowed)
	}
}

func TestFixedWindowRejectsAfterLimit(t *testing.T) {
	server := miniredis.RunT(t)
	client := goredis.NewClient(&goredis.Options{Addr: server.Addr()})
	t.Cleanup(func() { _ = client.Close() })

	lim := NewFixedWindow(client, 2, time.Minute)
	for i := 0; i < 2; i++ {
		result, err := lim.Allow(context.Background(), "fixed-user")
		if err != nil {
			t.Fatal(err)
		}
		if !result.Allowed {
			t.Fatalf("request %d should be allowed", i+1)
		}
	}
	result, err := lim.Allow(context.Background(), "fixed-user")
	if err != nil {
		t.Fatal(err)
	}
	if result.Allowed {
		t.Fatal("third request should be rejected")
	}
}

func TestSlidingWindowRejectsAfterLimit(t *testing.T) {
	server := miniredis.RunT(t)
	client := goredis.NewClient(&goredis.Options{Addr: server.Addr()})
	t.Cleanup(func() { _ = client.Close() })

	lim := NewSlidingWindow(client, 1, time.Minute)
	first, err := lim.Allow(context.Background(), "sliding-user")
	if err != nil {
		t.Fatal(err)
	}
	if !first.Allowed {
		t.Fatal("first request should be allowed")
	}
	second, err := lim.Allow(context.Background(), "sliding-user")
	if err != nil {
		t.Fatal(err)
	}
	if second.Allowed {
		t.Fatal("second request should be rejected")
	}
}
