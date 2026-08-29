package service

import (
	"context"
	"fmt"
	"strings"

	"ratex/internal/model"
	"ratex/internal/repository"
)

type RoutePolicyService struct {
	repo *repository.RoutePolicyRepository
}

func NewRoutePolicyService(repo *repository.RoutePolicyRepository) *RoutePolicyService {
	return &RoutePolicyService{repo: repo}
}

func (s *RoutePolicyService) List(ctx context.Context) ([]model.RoutePolicy, error) {
	return s.repo.List(ctx)
}

func (s *RoutePolicyService) Create(ctx context.Context, route model.RoutePolicy) (model.RoutePolicy, error) {
	if err := validateRoutePolicy(&route); err != nil {
		return model.RoutePolicy{}, err
	}
	return s.repo.Create(ctx, route)
}

func (s *RoutePolicyService) Update(ctx context.Context, id string, route model.RoutePolicy) (model.RoutePolicy, error) {
	if err := validateRoutePolicy(&route); err != nil {
		return model.RoutePolicy{}, err
	}
	return s.repo.Update(ctx, id, route)
}

func (s *RoutePolicyService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func validateRoutePolicy(route *model.RoutePolicy) error {
	route.Method = strings.ToUpper(strings.TrimSpace(route.Method))
	route.RoutePattern = strings.TrimSpace(route.RoutePattern)
	if route.Method == "" || route.RoutePattern == "" || route.PolicyID == "" {
		return fmt.Errorf("method, route_pattern, and policy_id are required")
	}
	if !route.Enabled {
		route.Enabled = true
	}
	return nil
}
