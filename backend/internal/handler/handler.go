package handler

import (
	"encoding/csv"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

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
	seedSvc   *service.SeedService
}

func NewAPIHandler(repo *repository.Repository, triageSvc *service.TriageService, noteSvc *service.NoteService, dashSvc *service.DashboardService, seedSvc *service.SeedService) *APIHandler {
	return &APIHandler{repo: repo, triageSvc: triageSvc, noteSvc: noteSvc, dashSvc: dashSvc, seedSvc: seedSvc}
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
	segment := r.URL.Query().Get("segment")
	if segment == "" {
		segment = "todos"
	}

	clients, total, err := h.triageSvc.GetTriagedClients(page, limit, segment)
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

// -- Seed --
func (h *APIHandler) HandleUploadSeed(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		httpjson.Error(w, http.StatusBadRequest, "File too large")
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		httpjson.Error(w, http.StatusBadRequest, "Missing 'file' field")
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	// Read headers
	_, err = reader.Read()
	if err != nil {
		httpjson.Error(w, http.StatusBadRequest, "Failed to read CSV headers")
		return
	}

	clientMap := make(map[string]*models.SeedClient)

	for {
		record, err := reader.Read()
		if err != nil {
			break
		}
		if len(record) < 6 {
			continue
		}

		clientName := record[0]
		segment := record[1]
		serviceStatus := record[2]
		amountStr := record[3]
		dueDateStr := record[4]
		status := record[5]

		amount, _ := strconv.ParseFloat(amountStr, 64)
		dueDate, _ := time.Parse("2006-01-02", dueDateStr)

		if _, exists := clientMap[clientName]; !exists {
			clientMap[clientName] = &models.SeedClient{
				Name:          clientName,
				Segment:       segment,
				ServiceStatus: serviceStatus,
			}
		}

		clientMap[clientName].Invoices = append(clientMap[clientName].Invoices, models.SeedInvoice{
			Amount:  amount,
			DueDate: dueDate,
			Status:  status,
		})
	}

	var clients []models.SeedClient
	for _, c := range clientMap {
		clients = append(clients, *c)
	}

	if err := h.seedSvc.ProcessCSVData(clients); err != nil {
		httpjson.Error(w, http.StatusInternalServerError, "Failed to seed database: "+err.Error())
		return
	}

	httpjson.Success(w, http.StatusOK, map[string]string{"message": "Database seeded successfully"})
}
