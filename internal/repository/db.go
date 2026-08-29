package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"ratex/internal/config"
)

func NewPool(ctx context.Context, cfg config.Config) (*pgxpool.Pool, error) {
	poolConfig, err := pgxpool.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}
	poolConfig.MaxConns = 8
	poolConfig.MinConns = 1
	poolConfig.MaxConnLifetime = 30 * time.Minute
	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, err
	}
	return pool, pool.Ping(ctx)
}
