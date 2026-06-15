import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardView } from './DashboardView';
import * as triageApi from '../api/triage';

// Mock de todo el módulo de API para no golpear la red
vi.mock('../api/triage', () => ({
  useTriageClients: vi.fn(),
  useDashboardKPIs: vi.fn(() => ({ data: null, isLoading: false })),
  useAddCollectionAction: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useClientNotes: vi.fn(() => ({ data: null, isLoading: false })),
  useAddClientNote: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

// Datos de prueba simulados (Mock Data)
const mockClients = [
  {
    id: '1',
    name: 'Tech Corp',
    segment: 'startup',
    total_debt: 15000,
    max_days_overdue: 45,
    service_status: 'activo',
    priority: 2,
    latest_action: null,
    latest_action_date: null,
  },
  {
    id: '2',
    name: 'Zombie SL',
    segment: 'zombi',
    total_debt: 8000,
    max_days_overdue: 120,
    service_status: 'activo',
    priority: 1,
    latest_action: null,
    latest_action_date: null,
  },
  {
    id: '3',
    name: 'Mega Enterprises',
    segment: 'grande',
    total_debt: 50000,
    max_days_overdue: 10,
    service_status: 'activo',
    priority: 4,
    latest_action: null,
    latest_action_date: null,
  }
];

describe('DashboardView - Filtrado por Segmentos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar todos los clientes por defecto (Filtro: Todos los Segmentos)', () => {
    vi.mocked(triageApi.useTriageClients).mockReturnValue({
      data: { items: mockClients, total: 3 },
      isLoading: false,
      isError: false,
      error: null,
      isPlaceholderData: false,
    } as any);

    render(<DashboardView />);

    // Verifica que están las 3 empresas renderizadas en la tabla
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Zombie SL')).toBeInTheDocument();
    expect(screen.getByText('Mega Enterprises')).toBeInTheDocument();
  });
});
