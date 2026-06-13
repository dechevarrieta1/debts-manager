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

func (r *Repository) GetClientsWithDebt() ([]models.Client, error) {
	query := `
		SELECT 
			c.id, c.name, c.segment, c.service_status,
			COALESCE(SUM(i.amount) FILTER (WHERE i.status = 'pendiente'), 0) as total_debt,
			COALESCE(MAX(CURRENT_DATE - i.due_date) FILTER (WHERE i.status = 'pendiente' AND i.due_date < CURRENT_DATE), 0) as max_days_overdue,
			(SELECT collection_status FROM collection_actions ca WHERE ca.client_id = c.id ORDER BY action_date DESC LIMIT 1) as latest_action,
			(SELECT action_date FROM collection_actions ca WHERE ca.client_id = c.id ORDER BY action_date DESC LIMIT 1) as latest_action_date
		FROM clients c
		LEFT JOIN invoices i ON c.id = i.client_id
		GROUP BY c.id
		HAVING COALESCE(SUM(i.amount) FILTER (WHERE i.status = 'pendiente'), 0) > 0
	`

	rows, err := r.db.Query(query)
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
