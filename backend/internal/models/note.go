package models

import "time"

type ClientNote struct {
	ID        string     `json:"id"`
	ClientID  string     `json:"client_id"`
	Content   string     `json:"content"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
}
