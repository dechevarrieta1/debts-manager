package service

import (
	"github.com/northwind/debts-manager/backend/internal/models"
)

type SeedRepository interface {
	SeedFromCSV(clients []models.SeedClient) error
}

type SeedService struct {
	repo SeedRepository
}

func NewSeedService(repo SeedRepository) *SeedService {
	return &SeedService{repo: repo}
}

func (s *SeedService) ProcessCSVData(clients []models.SeedClient) error {
	return s.repo.SeedFromCSV(clients)
}
