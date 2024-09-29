package entity

type CreateConnection struct {
	GUID     string `json:"guid"`
	Name     string `json:"name"`
	Host     string `json:"host"`
	Port     string `json:"port"`
	Login    string `json:"login"`
	Password string `json:"password"`
}
