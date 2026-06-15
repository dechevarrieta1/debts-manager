package service

import (
	"golang.org/x/sync/errgroup"

	"github.com/northwind/debts-manager/backend/internal/models"
)

// DashboardRepository define el contrato para acceder a los datos analíticos,
// permitiendo realizar inyección de dependencias para testing.
type DashboardRepository interface {
	GetTotalOverdueDebt() (float64, error)
	GetAtRiskDebt() (float64, error)
	GetTopDebtors(limit int) ([]models.Client, error)
}

type DashboardService struct {
	repo DashboardRepository
}

func NewDashboardService(repo DashboardRepository) *DashboardService {
	return &DashboardService{repo: repo}
}

// GetKPIs ejecuta de manera concurrente las llamadas a la base de datos
// utilizando errgroup para el manejo de Fan-Out / Fan-In.
func (s *DashboardService) GetKPIs() (*models.DashboardKPIs, error) {
	var totalOverdue float64
	var atRisk float64
	var topDebtors []models.Client

	var g errgroup.Group

	// Goroutine 1: Total Overdue Debt
	g.Go(func() error {
		val, err := s.repo.GetTotalOverdueDebt()
		if err == nil {
			totalOverdue = val
		}
		return err
	})

	// Goroutine 2: At Risk Debt
	g.Go(func() error {
		val, err := s.repo.GetAtRiskDebt()
		if err == nil {
			atRisk = val
		}
		return err
	})

	// Goroutine 3: Top Debtors
	g.Go(func() error {
		clients, err := s.repo.GetTopDebtors(3)
		if err == nil {
			topDebtors = clients
		}
		return err
	})

	// Wait for all queries to complete
	if err := g.Wait(); err != nil {
		return nil, err
	}

	return &models.DashboardKPIs{
		TotalOverdueDebt: totalOverdue,
		AtRiskDebt:       atRisk,
		TopDebtors:       topDebtors,
	}, nil
}
