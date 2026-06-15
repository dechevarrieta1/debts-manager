package models

type DashboardKPIs struct {
	TotalOverdueDebt float64  `json:"total_overdue_debt"`
	AtRiskDebt       float64  `json:"at_risk_debt"`
	TopDebtors       []Client `json:"top_debtors"`
}
