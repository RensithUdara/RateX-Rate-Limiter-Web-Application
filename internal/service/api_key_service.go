package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"

	"ratex/internal/model"
	"ratex/internal/repository"
)

type APIKeyService struct {
	keys  *repository.APIKeyRepository
	users *repository.UserRepository
}

func NewAPIKeyService(keys *repository.APIKeyRepository, users *repository.UserRepository) *APIKeyService {
	return &APIKeyService{keys: keys, users: users}
}

func (s *APIKeyService) List(ctx context.Context) ([]model.APIKey, error) {
	return s.keys.List(ctx)
}

func (s *APIKeyService) Create(ctx context.Context, name, policyID string) (model.CreatedAPIKey, error) {
	user, err := s.users.EnsureDemoUser(ctx)
	if err != nil {
		return model.CreatedAPIKey{}, err
	}
	secret, err := randomAPIKey()
	if err != nil {
		return model.CreatedAPIKey{}, err
	}
	key := model.APIKey{
		UserID:    user.ID,
		Name:      name,
		KeyPrefix: prefix(secret),
		KeyHash:   HashAPIKey(secret),
		PolicyID:  policyID,
	}
	created, err := s.keys.Create(ctx, key)
	if err != nil {
		return model.CreatedAPIKey{}, err
	}
	return model.CreatedAPIKey{APIKey: created, Key: secret}, nil
}

func (s *APIKeyService) Revoke(ctx context.Context, id string) error {
	return s.keys.Revoke(ctx, id)
}

func randomAPIKey() (string, error) {
	bytes := make([]byte, 24)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return "rx_live_" + hex.EncodeToString(bytes), nil
}

func HashAPIKey(key string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(key)))
	return hex.EncodeToString(sum[:])
}

func prefix(key string) string {
	if len(key) <= 14 {
		return key
	}
	return fmt.Sprintf("%s...", key[:14])
}
