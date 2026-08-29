package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"ratex/internal/model"
)

type APIKeyRepository struct {
	db *pgxpool.Pool
}

func NewAPIKeyRepository(db *pgxpool.Pool) *APIKeyRepository {
	return &APIKeyRepository{db: db}
}

func (r *APIKeyRepository) List(ctx context.Context) ([]model.APIKey, error) {
	rows, err := r.db.Query(ctx, `
		select k.id, k.user_id, k.name, k.key_prefix, k.key_hash, k.policy_id, p.name, k.created_at, k.expires_at, k.revoked_at
		from api_keys k
		join rate_limit_policies p on p.id = k.policy_id
		order by k.created_at desc`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	keys := []model.APIKey{}
	for rows.Next() {
		var key model.APIKey
		if err := rows.Scan(&key.ID, &key.UserID, &key.Name, &key.KeyPrefix, &key.KeyHash, &key.PolicyID, &key.PolicyName, &key.CreatedAt, &key.ExpiresAt, &key.RevokedAt); err != nil {
			return nil, err
		}
		keys = append(keys, key)
	}
	return keys, rows.Err()
}

func (r *APIKeyRepository) Create(ctx context.Context, key model.APIKey) (model.APIKey, error) {
	err := r.db.QueryRow(ctx, `
		insert into api_keys (user_id, name, key_prefix, key_hash, policy_id, expires_at)
		values ($1, $2, $3, $4, $5, $6)
		returning id, user_id, name, key_prefix, key_hash, policy_id, created_at, expires_at, revoked_at`,
		key.UserID, key.Name, key.KeyPrefix, key.KeyHash, key.PolicyID, key.ExpiresAt).
		Scan(&key.ID, &key.UserID, &key.Name, &key.KeyPrefix, &key.KeyHash, &key.PolicyID, &key.CreatedAt, &key.ExpiresAt, &key.RevokedAt)
	return key, err
}

func (r *APIKeyRepository) FindByHash(ctx context.Context, hash string) (model.APIKey, model.Policy, error) {
	var key model.APIKey
	var policy model.Policy
	err := r.db.QueryRow(ctx, `
		select k.id, k.user_id, k.name, k.key_prefix, k.key_hash, k.policy_id, p.name,
		       k.created_at, k.expires_at, k.revoked_at,
		       p.id, p.name, p.algorithm, p.request_limit, p.window_seconds, p.burst_capacity, p.created_at, p.updated_at
		from api_keys k
		join rate_limit_policies p on p.id = k.policy_id
		where k.key_hash=$1 and k.revoked_at is null and (k.expires_at is null or k.expires_at > now())`, hash).
		Scan(&key.ID, &key.UserID, &key.Name, &key.KeyPrefix, &key.KeyHash, &key.PolicyID, &key.PolicyName,
			&key.CreatedAt, &key.ExpiresAt, &key.RevokedAt,
			&policy.ID, &policy.Name, &policy.Algorithm, &policy.RequestLimit, &policy.WindowSeconds, &policy.BurstCapacity, &policy.CreatedAt, &policy.UpdatedAt)
	if err == pgx.ErrNoRows {
		return model.APIKey{}, model.Policy{}, err
	}
	return key, policy, err
}

func (r *APIKeyRepository) Revoke(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `update api_keys set revoked_at=now() where id=$1`, id)
	return err
}
