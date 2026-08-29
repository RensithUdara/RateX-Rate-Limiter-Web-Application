package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"ratex/internal/model"
	"ratex/internal/service"
)

type RoutePolicyHandler struct {
	service *service.RoutePolicyService
}

func NewRoutePolicyHandler(service *service.RoutePolicyService) RoutePolicyHandler {
	return RoutePolicyHandler{service: service}
}

func (h RoutePolicyHandler) List(c *gin.Context) {
	routes, err := h.service.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, routes)
}

func (h RoutePolicyHandler) Create(c *gin.Context) {
	var input model.RoutePolicy
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	route, err := h.service.Create(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, route)
}

func (h RoutePolicyHandler) Update(c *gin.Context) {
	var input model.RoutePolicy
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	route, err := h.service.Update(c.Request.Context(), c.Param("id"), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, route)
}

func (h RoutePolicyHandler) Delete(c *gin.Context) {
	if err := h.service.Delete(c.Request.Context(), c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
