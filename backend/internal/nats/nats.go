package nats

import (
	"fmt"
	"github.com/nats-io/nats.go"
	"natser/internal/entity"
)

type Nats struct {
	Conn *nats.Conn
}

func NewNatsConn(connection *entity.Connection) (*Nats, error) {
	nc, err := nats.Connect(fmt.Sprintf("%s:%s", connection.URL, connection.Port), nats.UserInfo(connection.Login, connection.Password))
	if err != nil {
		return nil, err
	}

	return &Nats{Conn: nc}, nil
}
