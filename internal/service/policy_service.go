package service

import (
	"context"
	"fmt"
	"strings"

	"ratex/internal/model"
	"ratex/internal/repository"
)

type PolicyService struct {
	repo *repository.PolicyRepository
}

func NewPolicyService(repo *repository.PolicyRepository) *PolicyService {
	return &PolicyService{repo: repo}
}

func (s *PolicyService) List(ctx context.Context) ([]model.Policy, error) {
	return s.repo.List(ctx)
}

func (s *PolicyService) Create(ctx context.Context, policy model.Policy) (model.Policy, error) {
	if err := validatePolicy(&policy); err != nil {
		return model.Policy{}, err
	}
	return s.repo.Create(ctx, policy)
}

func (s *PolicyService) Update(ctx context.Context, id string, policy model.Policy) (model.Policy, error) {
	if err := validatePolicy(&policy); err != nil {
		return model.Policy{}, err
	}
	return s.repo.Update(ctx, id, policy)
}

func (s *PolicyService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func validatePolicy(policy *model.Policy) error {
	policy.Algorithm = strings.ToLower(strings.TrimSpace(policy.Algorithm))
	if policy.Algorithm == "" {
		policy.Algorithm = model.AlgorithmTokenBucket
	}
	if policy.Algorithm != model.AlgorithmTokenBucket && policy.Algorithm != model.AlgorithmFixedWindow && policy.Algorithm != model.AlgorithmSlidingWindow {
		return fmt.Errorf("unsupported algorithm")
	}
	if policy.RequestLimit <= 0 || policy.WindowSeconds <= 0 {
		return fmt.Errorf("request_limit and window_seconds must be positive")
	}
	if policy.BurstCapacity <= 0 {
		policy.BurstCapacity = policy.RequestLimit
	}
	return nil
}
