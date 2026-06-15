package repository

import (
	"database/sql"
	"fmt"

	"github.com/northwind/debts-manager/backend/internal/models"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetClientsWithDebt(segment string) ([]models.Client, error) {
	baseQuery := `
		SELECT 
			c.id, c.name, c.segment, c.service_status,
			COALESCE(SUM(i.amount) FILTER (WHERE i.status = 'pendiente'), 0) as total_debt,
			COALESCE(MAX(CURRENT_DATE - i.due_date) FILTER (WHERE i.status = 'pendiente' AND i.due_date < CURRENT_DATE), 0) as max_days_overdue,
			(SELECT collection_status FROM collection_actions ca WHERE ca.client_id = c.id ORDER BY action_date DESC LIMIT 1) as latest_action,
			(SELECT action_date FROM collection_actions ca WHERE ca.client_id = c.id ORDER BY action_date DESC LIMIT 1) as latest_action_date
		FROM clients c
		LEFT JOIN invoices i ON c.id = i.client_id
	`
	
	var rows *sql.Rows
	var err error

	if segment != "todos" && segment != "" {
		query := baseQuery + ` WHERE c.segment = $1 GROUP BY c.id HAVING COALESCE(SUM(i.amount) FILTER (WHERE i.status = 'pendiente'), 0) > 0`
		rows, err = r.db.Query(query, segment)
	} else {
		query := baseQuery + ` GROUP BY c.id HAVING COALESCE(SUM(i.amount) FILTER (WHERE i.status = 'pendiente'), 0) > 0`
		rows, err = r.db.Query(query)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var clients []models.Client
	for rows.Next() {
		var c models.Client
		var latestAction sql.NullString
		var latestActionDate sql.NullTime

		err := rows.Scan(
			&c.ID, &c.Name, &c.Segment, &c.ServiceStatus,
			&c.TotalDebt, &c.MaxDaysOverdue,
			&latestAction, &latestActionDate,
		)
		if err != nil {
			return nil, err
		}

		if latestAction.Valid {
			c.LatestAction = latestAction.String
		}
		if latestActionDate.Valid {
			c.LatestActionDate = &latestActionDate.Time
		}
		clients = append(clients, c)
	}

	return clients, nil
}

func (r *Repository) AddCollectionAction(action models.CollectionAction) error {
	query := `
		INSERT INTO collection_actions (client_id, collection_status, note, promise_date)
		VALUES ($1, $2, $3, $4)
	`
	_, err := r.db.Exec(query, action.ClientID, action.CollectionStatus, action.Note, action.PromiseDate)
	return err
}

func (r *Repository) UpdateClientSegment(clientID string, segment models.SegmentType) error {
	query := `UPDATE clients SET segment = $1, updated_at = NOW() WHERE id = $2`
	res, err := r.db.Exec(query, segment, clientID)
	if err != nil {
		return err
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return fmt.Errorf("client not found")
	}
	return nil
}

// -- Notes --

func (r *Repository) CreateClientNote(note *models.ClientNote) error {
	query := `INSERT INTO client_notes (client_id, content) VALUES ($1, $2) RETURNING id, created_at`
	return r.db.QueryRow(query, note.ClientID, note.Content).Scan(&note.ID, &note.CreatedAt)
}

func (r *Repository) GetClientNotes(clientID string) ([]models.ClientNote, error) {
	query := `SELECT id, client_id, content, created_at FROM client_notes WHERE client_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(query, clientID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notes []models.ClientNote
	for rows.Next() {
		var n models.ClientNote
		if err := rows.Scan(&n.ID, &n.ClientID, &n.Content, &n.CreatedAt); err != nil {
			return nil, err
		}
		notes = append(notes, n)
	}
	return notes, nil
}

// -- KPIs --

func (r *Repository) GetTotalOverdueDebt() (float64, error) {
	var total sql.NullFloat64
	err := r.db.QueryRow(`SELECT SUM(amount) FROM invoices WHERE status = 'vencida'`).Scan(&total)
	if err != nil {
		return 0, err
	}
	return total.Float64, nil
}

func (r *Repository) GetAtRiskDebt() (float64, error) {
	var total sql.NullFloat64
	query := `
		SELECT SUM(i.amount) 
		FROM invoices i 
		JOIN clients c ON i.client_id = c.id 
		WHERE i.status = 'vencida' AND c.segment IN ('zombi', 'startup')
	`
	err := r.db.QueryRow(query).Scan(&total)
	if err != nil {
		return 0, err
	}
	return total.Float64, nil
}

func (r *Repository) GetTopDebtors(limit int) ([]models.Client, error) {
	query := `
		SELECT c.id, c.name, c.segment, c.service_status,
		       COALESCE(SUM(i.amount), 0) as total_debt
		FROM clients c
		JOIN invoices i ON c.id = i.client_id
		WHERE i.status IN ('pendiente', 'vencida')
		GROUP BY c.id
		ORDER BY total_debt DESC
		LIMIT $1
	`
	rows, err := r.db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var clients []models.Client
	for rows.Next() {
		var c models.Client
		if err := rows.Scan(&c.ID, &c.Name, &c.Segment, &c.ServiceStatus, &c.TotalDebt); err != nil {
			return nil, err
		}
		clients = append(clients, c)
	}
	return clients, nil
}

// -- Seed Data --
func (r *Repository) SeedFromCSV(clients []models.SeedClient) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback() // Rollback is safe to call if already committed

	for _, client := range clients {
		var clientID string
		err := tx.QueryRow(`
			INSERT INTO clients (name, segment, service_status) 
			VALUES ($1, $2, $3) RETURNING id`,
			client.Name, client.Segment, client.ServiceStatus,
		).Scan(&clientID)
		
		if err != nil {
			return err
		}

		for _, inv := range client.Invoices {
			_, err = tx.Exec(`
				INSERT INTO invoices (client_id, amount, due_date, status)
				VALUES ($1, $2, $3, $4)`,
				clientID, inv.Amount, inv.DueDate.Format("2006-01-02"), inv.Status,
			)
			if err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}
