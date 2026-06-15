import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionModal } from './ActionModal';
import * as triageApi from '../service/triage';

// Mock del API
vi.mock('../api/triage', () => ({
  useAddCollectionAction: vi.fn(),
}));

// Mock de NotesTimeline para evitar que renderice la otra mitad compleja del modal
vi.mock('./NotesTimeline', () => ({
  NotesTimeline: () => <div data-testid="mock-notes-timeline" />
}));

const mockClient = {
  id: 'c-123',
  name: 'Acme Corp',
  segment: 'estandar',
  total_debt: 2000,
  max_days_overdue: 15,
  service_status: 'activo',
  priority: 3,
  latest_action: null,
  latest_action_date: null,
};

describe('ActionModal - Mutaciones y Formulario', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(triageApi.useAddCollectionAction).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);
  });

  it('no se renderiza si no hay cliente (isOpen=false / client=null)', () => {
    const { container } = render(<ActionModal client={null} isOpen={false} onClose={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('permite registrar una nueva acción y llama a mutate() con los datos correctos', async () => {
    const onClose = vi.fn();
    render(<ActionModal client={mockClient as any} isOpen={true} onClose={onClose} />);

    // Verifica la renderización de datos
    expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument();

    // El estado por defecto es "Llamada Realizada" en Select, el textarea está vacío.
    // Llenamos la nota interna:
    const textarea = screen.getByPlaceholderText(/Ej. El cliente solicitó/i);
    fireEvent.change(textarea, { target: { value: 'Se contactó exitosamente.' } });

    // Enviamos el formulario
    const submitBtn = screen.getByRole('button', { name: /Guardar Acción/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
      // Validamos los parámetros pasados al mutate
      expect(mockMutate).toHaveBeenCalledWith(
        {
          collection_status: 'Llamada Realizada',
          note: 'Se contactó exitosamente.',
          promise_date: undefined
        },
        expect.any(Object)
      );
    });
  });
});
