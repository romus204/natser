package entity

type Connection struct {
	GUID     string `json:"guid"`
	Name     string `json:"name"`
	URL      string `json:"url"`
	Port     string `json:"port"`
	Login    string `json:"login"`
	Password string `json:"password"`
}

type ConnectionList []Connection
