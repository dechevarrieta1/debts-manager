package main

import (
	"encoding/csv"
	"fmt"
	"log"
	"math/rand"
	"os"
	"time"
)

var (
	segments       = []string{"zombi", "startup", "grande", "estandar"}
	serviceStatus  = []string{"activo", "suspendido", "cancelado"}
	invoiceStatus  = []string{"pagada", "pendiente", "vencida", "anulada"}
	companyPrefixes = []string{"Tech", "Global", "Next", "Mega", "Alpha", "Zenith", "Core", "Prime"}
	companySuffixes = []string{"Solutions", "Corp", "Inc", "LLC", "Group", "Enterprises", "Partners"}
)

func randomElement(slice []string) string {
	return slice[rand.Intn(len(slice))]
}

func generateCompanyName() string {
	return fmt.Sprintf("%s %s %d", randomElement(companyPrefixes), randomElement(companySuffixes), rand.Intn(1000))
}

func main() {
	rand.Seed(time.Now().UnixNano())

	file, err := os.Create("mock_data.csv")
	if err != nil {
		log.Fatalf("Error creando archivo: %v", err)
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	// Headers
	err = writer.Write([]string{"client_name", "segment", "service_status", "invoice_amount", "invoice_due_date", "invoice_status"})
	if err != nil {
		log.Fatalf("Error escribiendo headers: %v", err)
	}

	// Create a pool of 100 random companies to simulate multiple invoices per company
	var companies []struct {
		Name    string
		Segment string
		Status  string
	}

	for i := 0; i < 100; i++ {
		companies = append(companies, struct {
			Name    string
			Segment string
			Status  string
		}{
			Name:    generateCompanyName(),
			Segment: randomElement(segments),
			Status:  randomElement(serviceStatus),
		})
	}

	// Generate 500 invoices
	for i := 0; i < 500; i++ {
		company := companies[rand.Intn(len(companies))]
		
		// Random amount between 100 and 50000
		amount := float64(rand.Intn(49900)+100) + rand.Float64()
		
		// Random date between -180 days and +30 days from today
		daysOffset := rand.Intn(210) - 180
		dueDate := time.Now().AddDate(0, 0, daysOffset).Format("2006-01-02")

		status := randomElement(invoiceStatus)
		
		// If due date is in the past and status is not "pagada" or "anulada", let's make it "pendiente"
		// The query uses 'pendiente' to calculate overdue.
		if daysOffset < 0 && status != "pagada" && status != "anulada" {
			status = "pendiente"
		}

		err := writer.Write([]string{
			company.Name,
			company.Segment,
			company.Status,
			fmt.Sprintf("%.2f", amount),
			dueDate,
			status,
		})
		if err != nil {
			log.Printf("Error escribiendo fila: %v", err)
		}
	}

	fmt.Println("Generado mock_data.csv con éxito (500 facturas).")
}
