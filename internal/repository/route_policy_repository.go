package repository

import (
	"context"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"ratex/internal/model"
)

type RoutePolicyRepository struct {
	db *pgxpool.Pool
}

func NewRoutePolicyRepository(db *pgxpool.Pool) *RoutePolicyRepository {
	return &RoutePolicyRepository{db: db}
}

func (r *RoutePolicyRepository) List(ctx context.Context) ([]model.RoutePolicy, error) {
	rows, err := r.db.Query(ctx, `
		select rp.id, rp.method, rp.route_pattern, rp.policy_id, p.name, rp.enabled, rp.created_at, rp.updated_at
		from route_policies rp
		join rate_limit_policies p on p.id = rp.policy_id
		order by rp.created_at desc`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	routes := []model.RoutePolicy{}
	for rows.Next() {
		var route model.RoutePolicy
		if err := rows.Scan(&route.ID, &route.Method, &route.RoutePattern, &route.PolicyID, &route.PolicyName, &route.Enabled, &route.CreatedAt, &route.UpdatedAt); err != nil {
			return nil, err
		}
		routes = append(routes, route)
	}
	return routes, rows.Err()
}

func (r *RoutePolicyRepository) Create(ctx context.Context, route model.RoutePolicy) (model.RoutePolicy, error) {
	route.Method = strings.ToUpper(route.Method)
	err := r.db.QueryRow(ctx, `
		insert into route_policies (method, route_pattern, policy_id, enabled)
		values ($1, $2, $3, $4)
		returning id, method, route_pattern, policy_id, enabled, created_at, updated_at`,
		route.Method, route.RoutePattern, route.PolicyID, route.Enabled).
		Scan(&route.ID, &route.Method, &route.RoutePattern, &route.PolicyID, &route.Enabled, &route.CreatedAt, &route.UpdatedAt)
	return route, err
}

func (r *RoutePolicyRepository) Update(ctx context.Context, id string, route model.RoutePolicy) (model.RoutePolicy, error) {
	route.Method = strings.ToUpper(route.Method)
	err := r.db.QueryRow(ctx, `
		update route_policies
		set method=$2, route_pattern=$3, policy_id=$4, enabled=$5, updated_at=now()
		where id=$1
		returning id, method, route_pattern, policy_id, enabled, created_at, updated_at`,
		id, route.Method, route.RoutePattern, route.PolicyID, route.Enabled).
		Scan(&route.ID, &route.Method, &route.RoutePattern, &route.PolicyID, &route.Enabled, &route.CreatedAt, &route.UpdatedAt)
	return route, err
}

func (r *RoutePolicyRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `delete from route_policies where id=$1`, id)
	return err
}

func (r *RoutePolicyRepository) FindPolicy(ctx context.Context, method, routePattern string) (model.Policy, bool, error) {
	var policy model.Policy
	err := r.db.QueryRow(ctx, `
		select p.id, p.name, p.algorithm, p.request_limit, p.window_seconds, p.burst_capacity, p.created_at, p.updated_at
		from route_policies rp
		join rate_limit_policies p on p.id = rp.policy_id
		where rp.enabled = true and rp.method = $1 and rp.route_pattern = $2
		limit 1`, strings.ToUpper(method), routePattern).
		Scan(&policy.ID, &policy.Name, &policy.Algorithm, &policy.RequestLimit, &policy.WindowSeconds, &policy.BurstCapacity, &policy.CreatedAt, &policy.UpdatedAt)
	if err == pgx.ErrNoRows {
		return model.Policy{}, false, nil
	}
	return policy, err == nil, err
}
