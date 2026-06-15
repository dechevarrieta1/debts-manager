-- 1. Habilitamos la extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Creación de los ENUMs (dominio cerrado, minúsculas)
CREATE TYPE segment_type AS ENUM ('zombi', 'startup', 'grande', 'estandar');
CREATE TYPE service_status_type AS ENUM ('activo', 'suspendido', 'cancelado');
CREATE TYPE invoice_status_type AS ENUM ('pagada', 'pendiente', 'vencida', 'anulada');

-- 3. Tabla Clientes
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    segment segment_type NOT NULL DEFAULT 'estandar',
    service_status service_status_type NOT NULL DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_segment ON clients(segment);

-- 4. Tabla Facturas / Deudas
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status_type NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_status_due_date ON invoices(status, due_date);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);

-- 5. Tabla Gestiones de Cobranza (collection_status queda como VARCHAR para mayor flexibilidad de notas manuales)
CREATE TABLE collection_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    collection_status VARCHAR(50) NOT NULL,
    note TEXT,
    action_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    promise_date DATE
);

CREATE INDEX idx_collection_actions_client_id ON collection_actions(client_id);
CREATE INDEX idx_collection_actions_action_date ON collection_actions(action_date DESC);

-- 6. Tabla de Notas del Cliente
CREATE TABLE client_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Índices Específicos para Notas
CREATE INDEX idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX idx_client_notes_created_at ON client_notes(created_at DESC);

-- Índices Específicos para KPIs Gerenciales (Suma de facturas vencidas y Deuda en Riesgo)
CREATE INDEX idx_invoices_status_amount ON invoices(status) INCLUDE (amount);
CREATE INDEX idx_clients_segment_id ON clients(segment, id);
