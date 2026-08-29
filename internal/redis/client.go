package redis

import (
	"context"
	"time"

	goredis "github.com/redis/go-redis/v9"
	"ratex/internal/config"
)

func NewClient(cfg config.Config) *goredis.Client {
	return goredis.NewClient(&goredis.Options{
		Addr:         cfg.RedisAddr,
		Password:     cfg.RedisPassword,
		DB:           cfg.RedisDB,
		DialTimeout:  2 * time.Second,
		ReadTimeout:  2 * time.Second,
		WriteTimeout: 2 * time.Second,
	})
}

func Ping(ctx context.Context, client *goredis.Client) error {
	return client.Ping(ctx).Err()
}
