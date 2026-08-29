package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"ratex/internal/model"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) EnsureDemoUser(ctx context.Context) (model.User, error) {
	var user model.User
	err := r.db.QueryRow(ctx, `
		insert into users (email, password_hash)
		values ('demo@ratex.local', 'demo')
		on conflict (email) do update set email=excluded.email
		returning id, email, password_hash, created_at`).
		Scan(&user.ID, &user.Email, &user.PasswordHash, &user.CreatedAt)
	return user, err
}
