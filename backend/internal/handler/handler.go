package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/northwind/debts-manager/backend/internal/models"
	"github.com/northwind/debts-manager/backend/internal/repository"
	"github.com/northwind/debts-manager/backend/internal/service"
	"github.com/northwind/debts-manager/backend/pkg/httpjson"
)

type APIHandler struct {
	repo    *repository.Repository
	service *service.TriageService
}

func NewAPIHandler(repo *repository.Repository, service *service.TriageService) *APIHandler {
	return &APIHandler{repo: repo, service: service}
}

func (h *APIHandler) GetTriage(w http.ResponseWriter, r *http.Request) {
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page := 1
	limit := 10

	if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
		page = p
	}
	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
		limit = l
	}

	clients, total, err := h.service.GetTriagedClients(page, limit)
	if err != nil {
		httpjson.Error(w, http.StatusInternalServerError, "Failed to process triage: "+err.Error())
		return
	}

	httpjson.Success(w, http.StatusOK, map[string]any{
		"items": clients,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (h *APIHandler) PostCollectionAction(w http.ResponseWriter, r *http.Request) {
	clientID := r.PathValue("id")
	if clientID == "" {
		httpjson.Error(w, http.StatusBadRequest, "Missing client ID")
		return
	}

	var action models.CollectionAction
	if err := json.NewDecoder(r.Body).Decode(&action); err != nil {
		httpjson.Error(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}
	action.ClientID = clientID

	if err := h.repo.AddCollectionAction(action); err != nil {
		httpjson.Error(w, http.StatusInternalServerError, "Failed to save action: "+err.Error())
		return
	}

	httpjson.JSON(w, http.StatusCreated, map[string]string{"message": "Action recorded successfully"})
}

func (h *APIHandler) PutClientSegment(w http.ResponseWriter, r *http.Request) {
	clientID := r.PathValue("id")
	if clientID == "" {
		httpjson.Error(w, http.StatusBadRequest, "Missing client ID")
		return
	}

	var req models.SegmentUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpjson.Error(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if err := h.repo.UpdateClientSegment(clientID, req.Segment); err != nil {
		httpjson.Error(w, http.StatusInternalServerError, "Failed to update segment: "+err.Error())
		return
	}

	httpjson.JSON(w, http.StatusOK, map[string]string{"message": "Segment updated successfully"})
}
