package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"ratex/internal/model"
)

type RequestEventRepository struct {
	db *pgxpool.Pool
}

func NewRequestEventRepository(db *pgxpool.Pool) *RequestEventRepository {
	return &RequestEventRepository{db: db}
}

func (r *RequestEventRepository) Insert(ctx context.Context, event model.RequestEvent) error {
	_, err := r.db.Exec(ctx, `
		insert into request_events (
			method, route, identity_type, identity_value, policy_name, allowed,
			status_code, request_limit, remaining, retry_after, duration_ms
		)
		values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
		event.Method, event.Route, event.IdentityType, event.IdentityValue, event.PolicyName, event.Allowed,
		event.StatusCode, event.RequestLimit, event.Remaining, event.RetryAfter, event.DurationMS)
	return err
}

func (r *RequestEventRepository) Recent(ctx context.Context, limit int) ([]model.RequestEvent, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	rows, err := r.db.Query(ctx, `
		select id, method, route, identity_type, identity_value, policy_name, allowed,
		       status_code, request_limit, remaining, retry_after, duration_ms, created_at
		from request_events
		order by created_at desc
		limit $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	events := []model.RequestEvent{}
	for rows.Next() {
		var event model.RequestEvent
		if err := rows.Scan(&event.ID, &event.Method, &event.Route, &event.IdentityType, &event.IdentityValue, &event.PolicyName, &event.Allowed, &event.StatusCode, &event.RequestLimit, &event.Remaining, &event.RetryAfter, &event.DurationMS, &event.CreatedAt); err != nil {
			return nil, err
		}
		events = append(events, event)
	}
	return events, rows.Err()
}

func (r *RequestEventRepository) TopRoutes(ctx context.Context) ([]model.RouteSummary, error) {
	rows, err := r.db.Query(ctx, `
		select route,
		       count(*) filter (where allowed) as allowed,
		       count(*) filter (where not allowed) as rejected,
		       count(*) as total
		from request_events
		where created_at > now() - interval '1 hour'
		group by route
		order by total desc
		limit 10`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	summaries := []model.RouteSummary{}
	for rows.Next() {
		var summary model.RouteSummary
		if err := rows.Scan(&summary.Route, &summary.Allowed, &summary.Rejected, &summary.Total); err != nil {
			return nil, err
		}
		summaries = append(summaries, summary)
	}
	return summaries, rows.Err()
}

func (r *RequestEventRepository) Timeline(ctx context.Context) ([]model.TimeBucket, error) {
	rows, err := r.db.Query(ctx, `
		select date_trunc('minute', created_at) as bucket,
		       count(*) filter (where allowed) as allowed,
		       count(*) filter (where not allowed) as rejected,
		       count(*) as total
		from request_events
		where created_at > now() - interval '30 minutes'
		group by bucket
		order by bucket asc`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	buckets := []model.TimeBucket{}
	for rows.Next() {
		var bucket model.TimeBucket
		if err := rows.Scan(&bucket.Bucket, &bucket.Allowed, &bucket.Rejected, &bucket.Total); err != nil {
			return nil, err
		}
		buckets = append(buckets, bucket)
	}
	return buckets, rows.Err()
}
