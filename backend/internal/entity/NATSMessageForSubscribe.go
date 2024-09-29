package entity

import "github.com/nats-io/nats.go"

type NATSMessageForSubscribe struct {
	Subject string      `json:"subject"`
	Header  nats.Header `json:"headers"`
	Message string      `json:"data"`
}
