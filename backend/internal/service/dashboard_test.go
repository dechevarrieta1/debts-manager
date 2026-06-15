package service

import (
	"errors"
	"testing"

	"github.com/northwind/debts-manager/backend/internal/models"
)

// MockDashboardRepo implementa DashboardRepository para pruebas.
type MockDashboardRepo struct {
	TotalOverdueDebt float64
	AtRiskDebt       float64
	TopDebtors       []models.Client
	ReturnError      error
}

func (m *MockDashboardRepo) GetTotalOverdueDebt() (float64, error) {
	if m.ReturnError != nil {
		return 0, m.ReturnError
	}
	return m.TotalOverdueDebt, nil
}

func (m *MockDashboardRepo) GetAtRiskDebt() (float64, error) {
	if m.ReturnError != nil {
		return 0, m.ReturnError
	}
	return m.AtRiskDebt, nil
}

func (m *MockDashboardRepo) GetTopDebtors(limit int) ([]models.Client, error) {
	if m.ReturnError != nil {
		return nil, m.ReturnError
	}
	return m.TopDebtors, nil
}

func TestDashboardService_GetKPIs_Success(t *testing.T) {
	mockRepo := &MockDashboardRepo{
		TotalOverdueDebt: 15000.50,
		AtRiskDebt:       5000.25,
		TopDebtors: []models.Client{
			{ID: "client-1", Name: "Zombi Corp", TotalDebt: 3000.00},
			{ID: "client-2", Name: "Startup LLC", TotalDebt: 2000.25},
		},
	}

	svc := NewDashboardService(mockRepo)

	kpis, err := svc.GetKPIs()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if kpis.TotalOverdueDebt != 15000.50 {
		t.Errorf("expected TotalOverdueDebt 15000.50, got %f", kpis.TotalOverdueDebt)
	}

	if kpis.AtRiskDebt != 5000.25 {
		t.Errorf("expected AtRiskDebt 5000.25, got %f", kpis.AtRiskDebt)
	}

	if len(kpis.TopDebtors) != 2 {
		t.Errorf("expected 2 TopDebtors, got %d", len(kpis.TopDebtors))
	}
}

func TestDashboardService_GetKPIs_ErrorPropagation(t *testing.T) {
	expectedErr := errors.New("database timeout")
	mockRepo := &MockDashboardRepo{
		ReturnError: expectedErr,
	}

	svc := NewDashboardService(mockRepo)

	kpis, err := svc.GetKPIs()
	if err == nil {
		t.Fatal("expected an error, got nil")
	}

	if err.Error() != expectedErr.Error() {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}

	if kpis != nil {
		t.Errorf("expected nil KPIs, got %v", kpis)
	}
}
