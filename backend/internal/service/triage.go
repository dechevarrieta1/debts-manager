package service

import (
	"sort"
	"time"

	"github.com/northwind/debts-manager/backend/internal/models"
	"github.com/northwind/debts-manager/backend/internal/repository"
)

type TriageService struct {
	repo *repository.Repository
}

func NewTriageService(repo *repository.Repository) *TriageService {
	return &TriageService{repo: repo}
}

func (s *TriageService) PrioritizeClients(clients []models.Client) []models.Client {
	now := time.Now()

	for i := range clients {
		c := &clients[i]
		priority := 3

		if c.Segment == models.SegmentZombi && c.MaxDaysOverdue > 90 && c.ServiceStatus == models.StatusActivo {
			priority = 1
		} else if c.Segment == models.SegmentStartup && c.MaxDaysOverdue >= 1 {

			priority = 2
		} else if c.Segment == models.SegmentGrande {

			if c.MaxDaysOverdue < 90 {
				priority = 4
			} else {
				priority = 3
			}
		} else if c.Segment == models.SegmentEstandar {
			priority = 3
		}

		if c.LatestAction == "Promesa de Pago" && c.LatestActionDate != nil {
			if now.Sub(*c.LatestActionDate) < 7*24*time.Hour {
				priority = 4
			}
		}

		c.Priority = priority
	}

	sort.Slice(clients, func(i, j int) bool {
		if clients[i].Priority != clients[j].Priority {
			return clients[i].Priority < clients[j].Priority
		}
		if clients[i].MaxDaysOverdue != clients[j].MaxDaysOverdue {
			return clients[i].MaxDaysOverdue > clients[j].MaxDaysOverdue
		}
		return clients[i].TotalDebt > clients[j].TotalDebt
	})
	return clients
}

func (s *TriageService) GetTriagedClients(page, limit int, segment string) ([]models.Client, int, error) {
	clients, err := s.repo.GetClientsWithDebt(segment)
	if err != nil {
		return nil, 0, err
	}

	triaged := s.PrioritizeClients(clients)
	total := len(triaged)

	start := (page - 1) * limit
	if start >= total {
		return []models.Client{}, total, nil
	}

	end := start + limit
	if end > total {
		end = total
	}

	return triaged[start:end], total, nil
}
