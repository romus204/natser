package entity

type SubscribeToChannel struct {
	Channel  string `json:"channel"`
	ConnGUID string `json:"connection_guid"`
}
