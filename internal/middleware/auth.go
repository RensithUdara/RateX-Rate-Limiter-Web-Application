package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"ratex/internal/config"
)

func AdminAuth(cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := strings.TrimSpace(c.GetHeader("X-Admin-Token"))
		if token == "" {
			token = bearerToken(c.GetHeader("Authorization"))
		}
		if token != cfg.AdminToken {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		c.Next()
	}
}

func bearerToken(header string) string {
	const prefix = "Bearer "
	if strings.HasPrefix(header, prefix) {
		return strings.TrimSpace(strings.TrimPrefix(header, prefix))
	}
	return ""
}

func ExtractAPIKey(c *gin.Context) string {
	if key := strings.TrimSpace(c.GetHeader("X-API-Key")); key != "" {
		return key
	}
	return bearerToken(c.GetHeader("Authorization"))
}
