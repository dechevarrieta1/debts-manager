package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
	"github.com/northwind/debts-manager/backend/internal/handler"
	"github.com/northwind/debts-manager/backend/internal/repository"
	"github.com/northwind/debts-manager/backend/internal/service"
)

func main() {
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "admin"
	}
	dbPass := os.Getenv("DB_PASSWORD")
	if dbPass == "" {
		dbPass = "admin123"
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "debts_manager"
	}
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}

	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", dbUser, dbPass, dbHost, dbPort, dbName)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Printf("Warning: Unable to ping database: %v", err)
	} else {
		log.Println("Connected to PostgreSQL successfully")
	}

	repo := repository.NewRepository(db)
	svc := service.NewTriageService()
	h := handler.NewAPIHandler(repo, svc)

	mux := http.NewServeMux()

	// CORS Middleware simplificado
	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}

	mux.HandleFunc("GET /api/v1/debts/triage", h.GetTriage)
	mux.HandleFunc("POST /api/v1/clients/{id}/actions", h.PostCollectionAction)
	mux.HandleFunc("PUT /api/v1/clients/{id}/segment", h.PutClientSegment)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, corsMiddleware(mux)); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
