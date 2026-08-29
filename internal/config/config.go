package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	AppEnv               string
	HTTPPort             string
	DatabaseURL          string
	RedisAddr            string
	RedisPassword        string
	RedisDB              int
	DefaultAlgorithm     string
	DefaultLimit         int
	DefaultWindow        time.Duration
	DefaultBurstCapacity int
	RateLimitFailureMode string
	AdminToken           string
	FrontendOrigin       string
}

func Load() Config {
	limit := intEnv("RATE_LIMIT_DEFAULT_LIMIT", 100)
	windowSeconds := intEnv("RATE_LIMIT_WINDOW_SECONDS", 60)
	burst := intEnv("RATE_LIMIT_BURST_CAPACITY", limit)

	return Config{
		AppEnv:               stringEnv("APP_ENV", "development"),
		HTTPPort:             stringEnv("HTTP_PORT", "8080"),
		DatabaseURL:          stringEnv("DATABASE_URL", "postgres://ratex:ratex@localhost:5432/ratex?sslmode=disable"),
		RedisAddr:            stringEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:        os.Getenv("REDIS_PASSWORD"),
		RedisDB:              intEnv("REDIS_DB", 0),
		DefaultAlgorithm:     strings.ToLower(stringEnv("RATE_LIMIT_ALGORITHM", "token_bucket")),
		DefaultLimit:         limit,
		DefaultWindow:        time.Duration(windowSeconds) * time.Second,
		DefaultBurstCapacity: burst,
		RateLimitFailureMode: strings.ToLower(stringEnv("RATE_LIMIT_FAILURE_MODE", "closed")),
		AdminToken:           stringEnv("ADMIN_TOKEN", "dev-admin-token"),
		FrontendOrigin:       stringEnv("FRONTEND_ORIGIN", "http://localhost:5173"),
	}
}

func stringEnv(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func intEnv(key string, fallback int) int {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}
