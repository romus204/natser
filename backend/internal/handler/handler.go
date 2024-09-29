package handler

import (
	"context"
	"encoding/json"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/nats-io/nats.go"
	"github.com/rs/zerolog/log"
	"natser/internal/entity"
	myNATS "natser/internal/nats"
	"time"
)

type Servive interface {
	CreateConnection(ctx context.Context, connection *entity.CreateConnection) error
	GetConnectionsList(ctx context.Context) (*entity.ConnectionList, error)
	GetConnection(ctx context.Context, name string) (*entity.Connection, error)
	DeleteConnection(ctx context.Context, name string) error
}

type Handler struct {
	srv Servive
}

func NewHandler(srv Servive) *Handler {
	return &Handler{srv: srv}
}

func (h *Handler) CreateConnection() fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Response().Header.Set("Access-Control-Allow-Origin", "*")
		ent := new(entity.CreateConnection)

		err := json.Unmarshal(c.Body(), ent)
		if err != nil {
			log.Error().Err(err).Send()
			return fiber.ErrBadRequest
		}

		err = h.srv.CreateConnection(context.Background(), ent)
		if err != nil {
			return fiber.ErrInternalServerError
		}
		c.JSON("Connection created successfully")
		return nil
	}
}

func (h *Handler) GetConnectionsList() fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Response().Header.Set("Access-Control-Allow-Origin", "*")
		ctx := c.Context()

		res, err := h.srv.GetConnectionsList(ctx)
		if err != nil {
			log.Error().Err(err).Send()
			return fiber.ErrInternalServerError
		}
		err = c.JSON(res)
		if err != nil {
			log.Error().Err(err).Send()
			return fiber.ErrInternalServerError
		}

		return nil
	}
}

func (h *Handler) SendMessage() fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Response().Header.Set("Access-Control-Allow-Origin", "*")
		var sm entity.SendMessage

		err := json.Unmarshal(c.Body(), &sm)
		if err != nil {
			log.Error().Err(err).Send()
			return fiber.ErrBadRequest
		}

		cred, err := h.srv.GetConnection(c.Context(), sm.ConnGUID)
		if err != nil {
			log.Error().Err(err).Send()
			return fiber.ErrInternalServerError
		}

		nc, err := myNATS.NewNatsConn(cred)
		if err != nil {
			log.Error().Err(err).Send()
			return fiber.ErrInternalServerError
		}

		err = nc.Conn.Publish(sm.Channel, []byte(sm.Message))
		if err != nil {
			log.Error().Err(err).Send()
			return fiber.ErrInternalServerError
		}
		c.SendStatus(200)
		return nil

	}
}

func (h *Handler) DeleteConnection() fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Response().Header.Set("Access-Control-Allow-Origin", "*")
		ent := new(entity.DeleteConnection)

		body := c.Body()
		err := json.Unmarshal(body, ent)
		if err != nil {
			log.Error().Err(err).Send()
			return fiber.ErrBadRequest
		}

		err = h.srv.DeleteConnection(context.Background(), ent.GUID)
		if err != nil {
			return fiber.ErrInternalServerError
		}
		c.JSON("Connection delete successfully")
		return nil
	}
}

func (h *Handler) CheckConnection() fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Response().Header.Set("Access-Control-Allow-Origin", "*")

		cred, err := h.srv.GetConnection(c.Context(), c.Params("guid"))
		if err != nil {
			log.Error().Err(err).Send()
			c.JSON(entity.Connected{Connected: false})
			return nil
		}

		nc, err := myNATS.NewNatsConn(cred)
		if err != nil {
			log.Error().Err(err).Send()
			c.JSON(entity.Connected{Connected: false})
			return nil
		}

		c.JSON(entity.Connected{Connected: nc.Conn.IsConnected()})

		return nil
	}
}

func (h *Handler) SubscribeToChannel() fiber.Handler {
	return websocket.New(func(c *websocket.Conn) {

		log.Debug().Msg("ЕСТЬ ВЕБСОООООООООКЕТ")
		var sc entity.SubscribeToChannel
		err := c.ReadJSON(&sc)
		if err != nil {
			log.Error().Err(err).Send()
		}

		cred, err := h.srv.GetConnection(context.Background(), sc.ConnGUID)
		if err != nil {
			log.Error().Err(err).Send()
		}

		nc, err := myNATS.NewNatsConn(cred)
		if err != nil {
			log.Error().Err(err).Send()
		}

		endChan := make(chan struct{})
		subCtx, err := nc.Conn.Subscribe(sc.Channel, func(m *nats.Msg) {

			data := entity.NATSMessageForSubscribe{
				Subject: m.Subject,
				Header:  m.Header,
				Message: string(m.Data),
			}

			err := c.WriteJSON(data)
			if err != nil {
				log.Error().Err(err).Send()
				endChan <- struct{}{}
			}
		})

		//go func() {
		//	for {
		//		time.Sleep(time.Second)
		//		if c == nil || endChan == nil {
		//			break
		//		}
		//		err := c.PingHandler()("lololol")
		//		if err != nil {
		//			log.Error().Err(err).Send()
		//			endChan <- struct{}{}
		//			break
		//		}
		//	}
		//}()

		if err != nil {
			log.Error().Err(err).Send()
		}
		<-endChan

		err = subCtx.Unsubscribe()
		if err != nil {
			log.Error().Err(err).Send()
		}
	})

}

func (h *Handler) SendRequest() fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Response().Header.Set("Access-Control-Allow-Origin", "*")
		var sm entity.SendMessage

		err := json.Unmarshal(c.Body(), &sm)
		if err != nil {
			log.Error().Err(err).Send()
			return fiber.ErrBadRequest
		}

		cred, err := h.srv.GetConnection(c.Context(), sm.ConnGUID)
		if err != nil {
			log.Error().Err(err).Send()
			return fiber.ErrInternalServerError
		}

		nc, err := myNATS.NewNatsConn(cred)
		if err != nil {
			log.Error().Err(err).Send()
			return fiber.ErrInternalServerError
		}

		resp, err := nc.Conn.Request(sm.Channel, []byte(sm.Message), time.Second*15)
		if err != nil {
			log.Error().Err(err).Send()
			return fiber.ErrInternalServerError
		}

		c.JSON(resp)

		return nil

	}
}
