package main

import (
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
	"github.com/northwind/debts-manager/backend/infraestructure/database"
	middleware "github.com/northwind/debts-manager/backend/infraestructure/http"
	"github.com/northwind/debts-manager/backend/internal/handler"
	"github.com/northwind/debts-manager/backend/internal/repository"
	"github.com/northwind/debts-manager/backend/internal/service"
)

func main() {

	db, err := database.Connect()
	if err != nil {
		log.Fatalf("[ERROR][main] conectando a la base de datos: %v", err)
	}
	defer db.Close()

	repo := repository.NewRepository(db)
	svc := service.NewTriageService()
	h := handler.NewAPIHandler(repo, svc)

	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/v1/debts/triage", h.GetTriage)
	mux.HandleFunc("POST /api/v1/clients/{id}/actions", h.PostCollectionAction)
	mux.HandleFunc("PUT /api/v1/clients/{id}/segment", h.PutClientSegment)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, middleware.CORS(mux)); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
