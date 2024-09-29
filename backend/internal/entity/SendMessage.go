package entity

type SendMessage struct {
	ConnGUID string `json:"connection_guid"`
	Channel  string `json:"channel"`
	Message  string `json:"message"`
}
