package storage

import (
	"context"
	"database/sql"
	"fmt"
	_ "modernc.org/sqlite"
	"natser/internal/entity"
)

type Storage struct {
	db *sql.DB
}

func NewStorage(path string) (*Storage, error) {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, fmt.Errorf("failed to open storage: %w", err)
	}

	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping storage: %w", err)
	}

	if db == nil {
		return nil, fmt.Errorf("failed to ping storage: db is nil")
	}

	return &Storage{db: db}, nil
}

func (s *Storage) CreateConnection(ctx context.Context, connection *entity.CreateConnection) error {
	q := `INSERT INTO connections (guid, name, host, port, login, password) VALUES (?, ?, ?, ?, ?, ?)`

	_, err := s.db.ExecContext(ctx, q, connection.GUID, connection.Name, connection.Host, connection.Port, connection.Login, connection.Password)
	if err != nil {
		return fmt.Errorf("Ошибка при записи connection: %w", err)
	}
	return nil
}

func (s *Storage) GetConnectionsList(ctx context.Context) (*entity.ConnectionList, error) {
	q := `select guid, name, host, port, login, password from connections`

	rows, err := s.db.QueryContext(ctx, q)
	defer rows.Close()

	if err != nil {
		return nil, err
	}

	connectionList := make(entity.ConnectionList, 0)

	for rows.Next() {
		connection := entity.Connection{}
		if err := rows.Scan(
			&connection.GUID,
			&connection.Name,
			&connection.URL,
			&connection.Port,
			&connection.Login,
			&connection.Password); err != nil {
			return nil, err
		}
		connectionList = append(connectionList, connection)
	}

	return &connectionList, nil
}

func (s *Storage) GetConnection(ctx context.Context, guid string) (*entity.Connection, error) {
	q := `select guid, name, host, port, login, password from connections where guid = ?`

	rows, err := s.db.QueryContext(ctx, q, guid)
	defer rows.Close()

	if err != nil {
		return nil, err
	}

	connection := entity.Connection{}

	for rows.Next() {
		if err := rows.Scan(
			&connection.GUID,
			&connection.Name,
			&connection.URL,
			&connection.Port,
			&connection.Login,
			&connection.Password); err != nil {
			return nil, err
		}
	}

	return &connection, nil
}

func (s *Storage) DeleteConnection(ctx context.Context, guid string) error {
	q := `delete from connections where guid = ?`

	_, err := s.db.ExecContext(ctx, q, guid)
	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) ApplyMigration(ctx context.Context) error {
	q := `create table if not exists connections
(
    id       integer not null
        constraint connections_pk
            primary key autoincrement,
    guid     TEXT 	 not null,
    name     TEXT    not null,
    host     TEXT    not null,
    port     INT     not null,
    login    TEXT    not null,
    password TEXT    not null
);`

	_, err := s.db.ExecContext(ctx, q)
	if err != nil {
		return err
	}

	return nil
}
