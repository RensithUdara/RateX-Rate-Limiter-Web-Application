package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	goredis "github.com/redis/go-redis/v9"
)

type HealthHandler struct {
	db    *pgxpool.Pool
	redis *goredis.Client
}

func NewHealthHandler(db *pgxpool.Pool, redis *goredis.Client) HealthHandler {
	return HealthHandler{db: db, redis: redis}
}

func (h HealthHandler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "ratex"})
}

func (h HealthHandler) Ready(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 1500*time.Millisecond)
	defer cancel()
	if err := h.db.Ping(ctx); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"status": "not_ready", "database": err.Error()})
		return
	}
	if h.redis != nil {
		if err := h.redis.Ping(ctx).Err(); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "not_ready", "redis": err.Error()})
			return
		}
	} else {
		c.Header("X-RateLimit-Backend", "memory")
	}
	c.JSON(http.StatusOK, gin.H{"status": "ready"})
}
