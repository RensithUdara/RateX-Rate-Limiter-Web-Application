package model

import "time"

type APIKey struct {
	ID         string     `json:"id" db:"id"`
	UserID     string     `json:"user_id" db:"user_id"`
	Name       string     `json:"name" db:"name"`
	KeyPrefix  string     `json:"key_prefix" db:"key_prefix"`
	KeyHash    string     `json:"-" db:"key_hash"`
	PolicyID   string     `json:"policy_id" db:"policy_id"`
	PolicyName string     `json:"policy_name,omitempty" db:"policy_name"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	ExpiresAt  *time.Time `json:"expires_at,omitempty" db:"expires_at"`
	RevokedAt  *time.Time `json:"revoked_at,omitempty" db:"revoked_at"`
}

type CreatedAPIKey struct {
	APIKey
	Key string `json:"key"`
}
