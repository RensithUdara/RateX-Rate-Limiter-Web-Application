package model

import "time"

type RequestEvent struct {
	ID            int64     `json:"id" db:"id"`
	Method        string    `json:"method" db:"method"`
	Route         string    `json:"route" db:"route"`
	IdentityType  string    `json:"identity_type" db:"identity_type"`
	IdentityValue string    `json:"identity_value" db:"identity_value"`
	PolicyName    string    `json:"policy_name" db:"policy_name"`
	Allowed       bool      `json:"allowed" db:"allowed"`
	StatusCode    int       `json:"status_code" db:"status_code"`
	RequestLimit  int       `json:"request_limit" db:"request_limit"`
	Remaining     int       `json:"remaining" db:"remaining"`
	RetryAfter    int       `json:"retry_after" db:"retry_after"`
	DurationMS    int       `json:"duration_ms" db:"duration_ms"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}

type RouteSummary struct {
	Route    string `json:"route"`
	Allowed  int64  `json:"allowed"`
	Rejected int64  `json:"rejected"`
	Total    int64  `json:"total"`
}

type TimeBucket struct {
	Bucket   time.Time `json:"bucket"`
	Allowed  int64     `json:"allowed"`
	Rejected int64     `json:"rejected"`
	Total    int64     `json:"total"`
}
