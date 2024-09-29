package service

import (
	"context"
	"github.com/google/uuid"
	"natser/internal/entity"
)

type Storage interface {
	CreateConnection(ctx context.Context, connection *entity.CreateConnection) error
	GetConnectionsList(ctx context.Context) (*entity.ConnectionList, error)
	GetConnection(ctx context.Context, guid string) (*entity.Connection, error)
	DeleteConnection(ctx context.Context, guid string) error
}

type Service struct {
	Storage Storage
}

func (s *Service) GetConnectionsList(ctx context.Context) (*entity.ConnectionList, error) {
	return s.Storage.GetConnectionsList(ctx)
}

func NewService(storage Storage) *Service {
	return &Service{Storage: storage}
}

func (s *Service) CreateConnection(ctx context.Context, connection *entity.CreateConnection) error {
	connection.GUID = uuid.New().String()
	return s.Storage.CreateConnection(ctx, connection)
}

func (s *Service) GetConnection(ctx context.Context, guid string) (*entity.Connection, error) {
	return s.Storage.GetConnection(ctx, guid)
}

func (s *Service) DeleteConnection(ctx context.Context, guid string) error {
	return s.Storage.DeleteConnection(ctx, guid)
}
