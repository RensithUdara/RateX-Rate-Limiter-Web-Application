package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"ratex/internal/model"
	"ratex/internal/repository"
	"ratex/internal/service"
)

type PolicyHandler struct {
	service *service.PolicyService
}

func NewPolicyHandler(service *service.PolicyService) PolicyHandler {
	return PolicyHandler{service: service}
}

func (h PolicyHandler) List(c *gin.Context) {
	policies, err := h.service.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, policies)
}

func (h PolicyHandler) Create(c *gin.Context) {
	var input model.Policy
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	policy, err := h.service.Create(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, policy)
}

func (h PolicyHandler) Update(c *gin.Context) {
	var input model.Policy
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	policy, err := h.service.Update(c.Request.Context(), c.Param("id"), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, policy)
}

func (h PolicyHandler) Delete(c *gin.Context) {
	if err := h.service.Delete(c.Request.Context(), c.Param("id")); err != nil {
		if errors.Is(err, repository.ErrPolicyInUse) {
			c.JSON(http.StatusConflict, gin.H{
				"error":   "policy_in_use",
				"message": "This policy is used by API keys or route policies. Reassign or delete those records before deleting the policy.",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
