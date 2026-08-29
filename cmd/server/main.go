package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"ratex/internal/config"
	"ratex/internal/handler"
	"ratex/internal/limiter"
	"ratex/internal/metrics"
	"ratex/internal/middleware"
	ratexredis "ratex/internal/redis"
	"ratex/internal/repository"
	"ratex/internal/service"
)

func main() {
	cfg := config.Load()
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	metrics.Register()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	db, err := repository.NewPool(ctx, cfg)
	if err != nil {
		logger.Error("database connection failed", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	redisClient := ratexredis.NewClient(cfg)
	if err := ratexredis.Ping(ctx, redisClient); err != nil {
		logger.Error("redis connection failed", "error", err)
		os.Exit(1)
	}
	defer redisClient.Close()

	policyRepo := repository.NewPolicyRepository(db)
	apiKeyRepo := repository.NewAPIKeyRepository(db)
	userRepo := repository.NewUserRepository(db)
	policyService := service.NewPolicyService(policyRepo)
	apiKeyService := service.NewAPIKeyService(apiKeyRepo, userRepo)

	defaultLimiter := limiter.NewTokenBucket(redisClient, cfg.DefaultBurstCapacity, cfg.DefaultWindow)
	factory := middleware.NewLimiterFactory(redisClient, cfg)

	router := gin.New()
	router.Use(middleware.Recovery(logger), gin.Logger())
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendOrigin, "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type", "X-API-Key", "X-Admin-Token"},
		ExposeHeaders:    []string{"X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "Retry-After"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	health := handler.NewHealthHandler(db, redisClient)
	policies := handler.NewPolicyHandler(policyService)
	apiKeys := handler.NewAPIKeyHandler(apiKeyService)
	stats := handler.NewStatsHandler()

	router.GET("/healthz", health.Health)
	router.GET("/readyz", health.Ready)
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	api := router.Group("/api")
	api.GET("/stats", stats.Overview)

	admin := api.Group("")
	admin.Use(middleware.AdminAuth(cfg))
	admin.GET("/policies", policies.List)
	admin.POST("/policies", policies.Create)
	admin.PUT("/policies/:id", policies.Update)
	admin.DELETE("/policies/:id", policies.Delete)
	admin.GET("/keys", apiKeys.List)
	admin.POST("/keys", apiKeys.Create)
	admin.DELETE("/keys/:id", apiKeys.Delete)

	protected := router.Group("/v1")
	protected.Use(middleware.RateLimit(cfg, defaultLimiter, apiKeyRepo, factory))
	protected.GET("/products", handler.DemoProducts)

	addr := ":" + cfg.HTTPPort
	go func() {
		logger.Info("RateX API listening", "addr", addr)
		if err := router.Run(addr); err != nil {
			logger.Error("server stopped", "error", err)
			stop()
		}
	}()

	<-ctx.Done()
	fmt.Println("shutting down RateX")
}
