package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
	"ratex/internal/model"
)

var ErrPolicyInUse = errors.New("policy is used by api keys or route policies")

type PolicyRepository struct {
	db *pgxpool.Pool
}

func NewPolicyRepository(db *pgxpool.Pool) *PolicyRepository {
	return &PolicyRepository{db: db}
}

func (r *PolicyRepository) List(ctx context.Context) ([]model.Policy, error) {
	rows, err := r.db.Query(ctx, `select id, name, algorithm, request_limit, window_seconds, burst_capacity, created_at, updated_at from rate_limit_policies order by created_at desc`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	policies := []model.Policy{}
	for rows.Next() {
		var policy model.Policy
		if err := rows.Scan(&policy.ID, &policy.Name, &policy.Algorithm, &policy.RequestLimit, &policy.WindowSeconds, &policy.BurstCapacity, &policy.CreatedAt, &policy.UpdatedAt); err != nil {
			return nil, err
		}
		policies = append(policies, policy)
	}
	return policies, rows.Err()
}

func (r *PolicyRepository) Get(ctx context.Context, id string) (model.Policy, error) {
	var policy model.Policy
	err := r.db.QueryRow(ctx, `select id, name, algorithm, request_limit, window_seconds, burst_capacity, created_at, updated_at from rate_limit_policies where id=$1`, id).
		Scan(&policy.ID, &policy.Name, &policy.Algorithm, &policy.RequestLimit, &policy.WindowSeconds, &policy.BurstCapacity, &policy.CreatedAt, &policy.UpdatedAt)
	return policy, err
}

func (r *PolicyRepository) Create(ctx context.Context, policy model.Policy) (model.Policy, error) {
	err := r.db.QueryRow(ctx, `
		insert into rate_limit_policies (name, algorithm, request_limit, window_seconds, burst_capacity)
		values ($1, $2, $3, $4, $5)
		returning id, name, algorithm, request_limit, window_seconds, burst_capacity, created_at, updated_at`,
		policy.Name, policy.Algorithm, policy.RequestLimit, policy.WindowSeconds, policy.BurstCapacity).
		Scan(&policy.ID, &policy.Name, &policy.Algorithm, &policy.RequestLimit, &policy.WindowSeconds, &policy.BurstCapacity, &policy.CreatedAt, &policy.UpdatedAt)
	return policy, err
}

func (r *PolicyRepository) Update(ctx context.Context, id string, policy model.Policy) (model.Policy, error) {
	err := r.db.QueryRow(ctx, `
		update rate_limit_policies
		set name=$2, algorithm=$3, request_limit=$4, window_seconds=$5, burst_capacity=$6, updated_at=now()
		where id=$1
		returning id, name, algorithm, request_limit, window_seconds, burst_capacity, created_at, updated_at`,
		id, policy.Name, policy.Algorithm, policy.RequestLimit, policy.WindowSeconds, policy.BurstCapacity).
		Scan(&policy.ID, &policy.Name, &policy.Algorithm, &policy.RequestLimit, &policy.WindowSeconds, &policy.BurstCapacity, &policy.CreatedAt, &policy.UpdatedAt)
	return policy, err
}

func (r *PolicyRepository) Delete(ctx context.Context, id string) error {
	var usageCount int
	err := r.db.QueryRow(ctx, `
		select
			(select count(*) from api_keys where policy_id=$1) +
			(select count(*) from route_policies where policy_id=$1)`,
		id).Scan(&usageCount)
	if err != nil {
		return err
	}
	if usageCount > 0 {
		return ErrPolicyInUse
	}
	_, err = r.db.Exec(ctx, `delete from rate_limit_policies where id=$1`, id)
	return err
}
