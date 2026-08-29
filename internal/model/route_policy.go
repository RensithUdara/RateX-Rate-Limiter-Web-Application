package model

import "time"

type RoutePolicy struct {
	ID           string    `json:"id" db:"id"`
	Method       string    `json:"method" db:"method"`
	RoutePattern string    `json:"route_pattern" db:"route_pattern"`
	PolicyID     string    `json:"policy_id" db:"policy_id"`
	PolicyName   string    `json:"policy_name,omitempty" db:"policy_name"`
	Enabled      bool      `json:"enabled" db:"enabled"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}
