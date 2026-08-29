package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"ratex/internal/repository"
)

type EventHandler struct {
	events *repository.RequestEventRepository
}

func NewEventHandler(events *repository.RequestEventRepository) EventHandler {
	return EventHandler{events: events}
}

func (h EventHandler) Recent(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	events, err := h.events.Recent(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, events)
}

func (h EventHandler) TopRoutes(c *gin.Context) {
	routes, err := h.events.TopRoutes(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, routes)
}

func (h EventHandler) Timeline(c *gin.Context) {
	timeline, err := h.events.Timeline(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, timeline)
}
