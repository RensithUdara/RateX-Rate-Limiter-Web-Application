package model

import "time"

const (
	AlgorithmTokenBucket   = "token_bucket"
	AlgorithmFixedWindow   = "fixed_window"
	AlgorithmSlidingWindow = "sliding_window"
)

type Policy struct {
	ID            string    `json:"id" db:"id"`
	Name          string    `json:"name" db:"name"`
	Algorithm     string    `json:"algorithm" db:"algorithm"`
	RequestLimit  int       `json:"request_limit" db:"request_limit"`
	WindowSeconds int       `json:"window_seconds" db:"window_seconds"`
	BurstCapacity int       `json:"burst_capacity" db:"burst_capacity"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`
}
