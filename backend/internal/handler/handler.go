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
	repo      *repository.Repository
	triageSvc *service.TriageService
	noteSvc   *service.NoteService
	dashSvc   *service.DashboardService
}

func NewAPIHandler(repo *repository.Repository, triageSvc *service.TriageService, noteSvc *service.NoteService, dashSvc *service.DashboardService) *APIHandler {
	return &APIHandler{repo: repo, triageSvc: triageSvc, noteSvc: noteSvc, dashSvc: dashSvc}
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

	clients, total, err := h.triageSvc.GetTriagedClients(page, limit)
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

	httpjson.Success(w, http.StatusOK, map[string]string{"message": "segment updated successfully"})
}

// -- Notes --

func (h *APIHandler) GetClientNotes(w http.ResponseWriter, r *http.Request) {
	clientID := r.PathValue("id")
	if clientID == "" {
		httpjson.Error(w, http.StatusBadRequest, "Missing client id")
		return
	}

	notes, err := h.noteSvc.GetNotes(clientID)
	if err != nil {
		httpjson.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	httpjson.Success(w, http.StatusOK, notes)
}

func (h *APIHandler) PostClientNote(w http.ResponseWriter, r *http.Request) {
	clientID := r.PathValue("id")
	if clientID == "" {
		httpjson.Error(w, http.StatusBadRequest, "Missing client id")
		return
	}

	var req struct {
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpjson.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	note, err := h.noteSvc.AddNote(clientID, req.Content)
	if err != nil {
		httpjson.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	httpjson.Success(w, http.StatusCreated, note)
}

// -- KPIs --

func (h *APIHandler) GetDashboardKPIs(w http.ResponseWriter, r *http.Request) {
	kpis, err := h.dashSvc.GetKPIs()
	if err != nil {
		httpjson.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpjson.Success(w, http.StatusOK, kpis)
}
