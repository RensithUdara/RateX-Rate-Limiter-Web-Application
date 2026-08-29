package middleware

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Recovery(logger *slog.Logger) gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		logger.Error("panic recovered", "path", c.Request.URL.Path, "panic", recovered)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
	})
}
