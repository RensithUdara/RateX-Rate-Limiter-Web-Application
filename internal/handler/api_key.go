package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"ratex/internal/service"
)

type APIKeyHandler struct {
	service *service.APIKeyService
}

func NewAPIKeyHandler(service *service.APIKeyService) APIKeyHandler {
	return APIKeyHandler{service: service}
}

type createKeyRequest struct {
	Name     string `json:"name" binding:"required"`
	PolicyID string `json:"policy_id" binding:"required"`
}

func (h APIKeyHandler) List(c *gin.Context) {
	keys, err := h.service.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, keys)
}

func (h APIKeyHandler) Create(c *gin.Context) {
	var input createKeyRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	key, err := h.service.Create(c.Request.Context(), input.Name, input.PolicyID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, key)
}

func (h APIKeyHandler) Delete(c *gin.Context) {
	if err := h.service.Revoke(c.Request.Context(), c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
