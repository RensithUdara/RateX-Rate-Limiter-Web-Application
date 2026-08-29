package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	dto "github.com/prometheus/client_model/go"
)

type StatsHandler struct{}

func NewStatsHandler() StatsHandler {
	return StatsHandler{}
}

func (h StatsHandler) Overview(c *gin.Context) {
	total := metricCounter("ratex_requests_total")
	rejected := metricCounter("ratex_rejected_requests_total")
	allowed := metricCounter("ratex_allowed_requests_total")
	c.JSON(http.StatusOK, gin.H{
		"requests": total,
		"allowed":  allowed,
		"rejected": rejected,
	})
}

func metricCounter(name string) float64 {
	families, err := prometheus.DefaultGatherer.Gather()
	if err != nil {
		return 0
	}
	for _, family := range families {
		if family.GetName() != name {
			continue
		}
		var total float64
		for _, metric := range family.GetMetric() {
			total += readCounter(metric)
		}
		return total
	}
	return 0
}

func readCounter(metric *dto.Metric) float64 {
	if metric.GetCounter() == nil {
		return 0
	}
	return metric.GetCounter().GetValue()
}
