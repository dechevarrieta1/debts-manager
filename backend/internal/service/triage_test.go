package service

import (
	"testing"
	"time"

	"github.com/northwind/debts-manager/backend/internal/models"
)

func TestPrioritizeClients(testingT *testing.T) {
	svc := NewTriageService()
	now := time.Now()
	recentDate := now.Add(-24 * time.Hour)

	clients := []models.Client{
		{
			ID: "1", Name: "Estandar Normal", Segment: models.SegmentEstandar, MaxDaysOverdue: 15, TotalDebt: 100, ServiceStatus: models.StatusActivo,
		},
		{
			ID: "2", Name: "Startup en Riesgo", Segment: models.SegmentStartup, MaxDaysOverdue: 2, TotalDebt: 500, ServiceStatus: models.StatusActivo,
		},
		{
			ID: "3", Name: "Corp Zombi", Segment: models.SegmentZombi, MaxDaysOverdue: 95, TotalDebt: 2000, ServiceStatus: models.StatusActivo,
		},
		{
			ID: "4", Name: "Gran Cliente (Ignorar)", Segment: models.SegmentGrande, MaxDaysOverdue: 60, TotalDebt: 15000, ServiceStatus: models.StatusActivo,
		},
		{
			ID: "5", Name: "Estandar con Promesa", Segment: models.SegmentEstandar, MaxDaysOverdue: 30, TotalDebt: 300, ServiceStatus: models.StatusActivo,
			LatestAction: "Promesa de Pago", LatestActionDate: &recentDate,
		},
	}

	result := svc.PrioritizeClients(clients)

	// Esperado: Zombi (1) -> Startup (2) -> Estandar Normal (3) -> Gran Cliente (4) / Promesa (4)
	if len(result) != 5 {
		testingT.Fatalf("expected 5 clients, got %d", len(result))
	}

	if result[0].ID != "3" || result[0].Priority != 1 {
		testingT.Errorf("expected Zombi to be first with priority 1, got ID %s with priority %d", result[0].ID, result[0].Priority)
	}

	if result[1].ID != "2" || result[1].Priority != 2 {
		testingT.Errorf("expected Startup to be second with priority 2, got ID %s with priority %d", result[1].ID, result[1].Priority)
	}

	if result[2].ID != "1" || result[2].Priority != 3 {
		testingT.Errorf("expected Estandar Normal to be third with priority 3, got ID %s with priority %d", result[2].ID, result[2].Priority)
	}

	if result[3].Priority != 4 || result[4].Priority != 4 {
		testingT.Errorf("expected the last two to have priority 4")
	}
}
