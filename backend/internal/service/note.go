package service

import (
	"errors"
	"strings"

	"github.com/northwind/debts-manager/backend/internal/models"
)

type NoteRepository interface {
	CreateClientNote(note *models.ClientNote) error
	GetClientNotes(clientID string) ([]models.ClientNote, error)
}

type NoteService struct {
	repo NoteRepository
}

func NewNoteService(repo NoteRepository) *NoteService {
	return &NoteService{repo: repo}
}

func (s *NoteService) AddNote(clientID string, content string) (*models.ClientNote, error) {
	content = strings.TrimSpace(content)
	if content == "" {
		return nil, errors.New("note content cannot be empty")
	}
	if len(content) > 1000 {
		return nil, errors.New("note content exceeds maximum length of 1000 characters")
	}

	note := &models.ClientNote{
		ClientID: clientID,
		Content:  content,
	}

	if err := s.repo.CreateClientNote(note); err != nil {
		return nil, err
	}
	return note, nil
}

func (s *NoteService) GetNotes(clientID string) ([]models.ClientNote, error) {
	return s.repo.GetClientNotes(clientID)
}
