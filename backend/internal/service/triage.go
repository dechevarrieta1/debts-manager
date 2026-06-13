package service

import (
	"sort"
	"time"

	"github.com/northwind/debts-manager/backend/internal/models"
)

type TriageService struct{}

func NewTriageService() *TriageService {
	return &TriageService{}
}

// PrioritizeClients assigns priorities according to business rules and sorts them
func (s *TriageService) PrioritizeClients(clients []models.Client) []models.Client {
	now := time.Now()

	for i := range clients {
		c := &clients[i]
		priority := 3 // Media (Estándar por defecto)

		// 1. Zombi con más de 90 días -> Crítica (1)
		if c.Segment == models.SegmentZombi && c.MaxDaysOverdue > 90 && c.ServiceStatus == models.StatusActivo {
			priority = 1
		} else if c.Segment == models.SegmentStartup && c.MaxDaysOverdue >= 1 {
			// 2. Startup con 1 o más días -> Alta (2)
			priority = 2
		} else if c.Segment == models.SegmentGrande {
			// 3. Grande
			if c.MaxDaysOverdue < 90 {
				priority = 4 // Baja (ignoramos hasta el día 90 porque pagan a 75)
			} else {
				priority = 3 // Media (ya pasó el changüí)
			}
		} else if c.Segment == models.SegmentEstandar {
			priority = 3 // Media
		}

		// Promesa de Pago reciente baja la prioridad a 4 (Baja)
		if c.LatestAction == "Promesa de Pago" && c.LatestActionDate != nil {
			if now.Sub(*c.LatestActionDate) < 7*24*time.Hour {
				priority = 4 // No molestar si prometieron pagar esta semana
			}
		}

		c.Priority = priority
	}

	// Ordenamos: primero por Priority (ascendente 1..4), luego por MaxDaysOverdue (desc), luego por TotalDebt (desc)
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
