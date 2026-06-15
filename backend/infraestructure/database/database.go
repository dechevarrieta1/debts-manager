package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func Connect() (*sql.DB, error) {
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", dbUser, dbPass, dbHost, dbPort, dbName)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("[ERROR][database.Connect] error abriendo la base de datos: %w", err)
	}

	if err := db.Ping(); err != nil {
		log.Printf("[WARN][database.Connect] No se pudo hacer ping a la base de datos: %v", err)
	} else {
		log.Println("Conectado a PostgreSQL exitosamente")
	}

	return db, nil
}
