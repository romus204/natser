package v1

import (
	"github.com/gofiber/fiber/v2"
	"natser/internal/handler"
)

func AddRoutesV1(app *fiber.App, Handler *handler.Handler) {

	v1 := app.Group("/v1")
	wsGroup := app.Group("/ws")

	connectionsGroup := v1.Group("/connections")
	// Запрос списка сохраненных подключений
	connectionsGroup.Get("/", Handler.GetConnectionsList())
	// Проверка текущего подключения
	connectionsGroup.Get("/check/:guid", Handler.CheckConnection())
	// Запись нового подключения
	connectionsGroup.Post("/", Handler.CreateConnection())
	// Удаление подключения
	connectionsGroup.Delete("/", Handler.DeleteConnection())

	sendGroup := v1.Group("/send")
	// Отправка сообщения в канал
	sendGroup.Post("/", Handler.SendMessage())
	//// Отправка rpc запроса
	sendGroup.Post("/request", Handler.SendRequest())
	//
	subscribeGroup := wsGroup.Group("/subscribe")
	// Подписка на канал
	subscribeGroup.Get("/channel", Handler.SubscribeToChannel())

}
