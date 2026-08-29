package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func DemoProducts(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": []gin.H{
			{"id": "prod_001", "name": "Starter API", "price": 19},
			{"id": "prod_002", "name": "Scale API", "price": 99},
		},
		"served_at": time.Now().UTC(),
	})
}
