package main

import (
	"context"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/rs/zerolog/log"
	handler2 "natser/internal/handler"
	router "natser/internal/router/v1"
	"natser/internal/service"
	"natser/internal/storage"
)

func main() {
	app := fiber.New()

	stor, err := storage.NewStorage("./database.db")
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	err = stor.ApplyMigration(context.Background())
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	srv := service.NewService(stor)
	handler := handler2.NewHandler(srv)

	app.Use(cors.New())

	app.Use("/ws", func(c *fiber.Ctx) error {
		// IsWebSocketUpgrade returns true if the client
		// requested upgrade to the WebSocket protocol.
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	router.AddRoutesV1(app, handler)

	log.Fatal().Err(app.Listen(":3000")).Send()
}
