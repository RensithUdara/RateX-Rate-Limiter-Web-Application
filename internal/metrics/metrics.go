package metrics

import "github.com/prometheus/client_golang/prometheus"

var (
	RequestsTotal = prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "ratex_requests_total",
		Help: "Total requests processed by RateX.",
	}, []string{"route", "method"})
	AllowedRequestsTotal = prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "ratex_allowed_requests_total",
		Help: "Total requests allowed by the limiter.",
	}, []string{"route"})
	RejectedRequestsTotal = prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "ratex_rejected_requests_total",
		Help: "Total requests rejected by the limiter.",
	}, []string{"route"})
	RedisErrorsTotal = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "ratex_redis_errors_total",
		Help: "Total Redis errors encountered by the limiter.",
	})
	RateLimitLatency = prometheus.NewHistogram(prometheus.HistogramOpts{
		Name:    "ratex_rate_limit_latency_seconds",
		Help:    "Latency of rate-limit checks.",
		Buckets: prometheus.DefBuckets,
	})
)

func Register() {
	prometheus.MustRegister(RequestsTotal, AllowedRequestsTotal, RejectedRequestsTotal, RedisErrorsTotal, RateLimitLatency)
}
