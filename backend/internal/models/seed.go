package models

import "time"

type SeedClient struct {
	Name          string
	Segment       string
	ServiceStatus string
	Invoices      []SeedInvoice
}

type SeedInvoice struct {
	Amount  float64
	DueDate time.Time
	Status  string
}
