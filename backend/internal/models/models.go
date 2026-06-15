package models

import "time"

type SegmentType string

const (
	SegmentZombi    SegmentType = "zombi"
	SegmentStartup  SegmentType = "startup"
	SegmentGrande   SegmentType = "grande"
	SegmentEstandar SegmentType = "estandar"
)

type ServiceStatus string

const (
	StatusActivo     ServiceStatus = "activo"
	StatusSuspendido ServiceStatus = "suspendido"
	StatusCancelado  ServiceStatus = "cancelado"
)

type Client struct {
	ID               string        `json:"id"`
	Name             string        `json:"name"`
	Segment          SegmentType   `json:"segment"`
	ServiceStatus    ServiceStatus `json:"service_status"`
	CreatedAt        time.Time     `json:"created_at"`
	UpdatedAt        time.Time     `json:"updated_at"`
	TotalDebt        float64       `json:"total_debt"`
	MaxDaysOverdue   int           `json:"max_days_overdue"`
	LatestAction     string        `json:"latest_action,omitempty"`
	LatestActionDate *time.Time    `json:"latest_action_date,omitempty"`
	Priority         int           `json:"priority"`
}

type CollectionAction struct {
	ID               string     `json:"id"`
	ClientID         string     `json:"client_id"`
	CollectionStatus string     `json:"collection_status"`
	Note             string     `json:"note"`
	ActionDate       time.Time  `json:"action_date"`
	PromiseDate      *time.Time `json:"promise_date,omitempty"`
}

type SegmentUpdateRequest struct {
	Segment SegmentType `json:"segment"`
}
