-- ==========================================
-- Seeds (Datos Sintéticos) - Northwind MVP
-- Generación de 420 clientes para simular el estado actual (14% mora)
-- ==========================================

DO $$
DECLARE
    client_uuid UUID;
    i INT;
    rand_segment segment_type;
    rand_invoice_status invoice_status_type;
    days_overdue INT;
BEGIN
    -- 1. Casos Especiales y Deterministas (Para probar las reglas de negocio del Dashboard)
    
    -- CASO 1: Zombi (Deuda > 90 días, Sigue Activo)
    client_uuid := uuid_generate_v4();
    INSERT INTO clients (id, name, segment, service_status) 
    VALUES (client_uuid, 'Corp Zombi 1 (Demo)', 'zombi', 'activo');
    
    INSERT INTO invoices (client_id, amount, due_date, status)
    VALUES (client_uuid, 2500.00, CURRENT_DATE - INTERVAL '95 days', 'pendiente');
    
    -- CASO 2: Startup en riesgo (Mora de 5 días)
    client_uuid := uuid_generate_v4();
    INSERT INTO clients (id, name, segment, service_status) 
    VALUES (client_uuid, 'FastTech Startup (Demo)', 'startup', 'activo');
    
    INSERT INTO invoices (client_id, amount, due_date, status)
    VALUES (client_uuid, 800.00, CURRENT_DATE - INTERVAL '5 days', 'pendiente');
    
    -- CASO 3: Cliente Grande (Mora de 60 días, pero pagan a 75, debe ser ignorado por ahora)
    client_uuid := uuid_generate_v4();
    INSERT INTO clients (id, name, segment, service_status) 
    VALUES (client_uuid, 'Enterprise Megacorp (Demo)', 'grande', 'activo');
    
    INSERT INTO invoices (client_id, amount, due_date, status)
    VALUES (client_uuid, 15000.00, CURRENT_DATE - INTERVAL '60 days', 'pendiente');

    -- CASO 4: Estándar con promesa de pago
    client_uuid := uuid_generate_v4();
    INSERT INTO clients (id, name, segment, service_status) 
    VALUES (client_uuid, 'Pyme Estándar (Demo)', 'estandar', 'activo');
    
    INSERT INTO invoices (client_id, amount, due_date, status)
    VALUES (client_uuid, 450.00, CURRENT_DATE - INTERVAL '20 days', 'pendiente');
    
    INSERT INTO collection_actions (client_id, collection_status, note, action_date, promise_date)
    VALUES (client_uuid, 'Promesa de Pago', 'El cliente me indicó por teléfono que transfiere este viernes.', CURRENT_TIMESTAMP, CURRENT_DATE + INTERVAL '3 days');

    -- 2. Generación Masiva (Resto hasta llegar a 420 clientes para volumen)
    -- Aproximadamente 14% de mora (unos 58 clientes en mora total).
    
    FOR i IN 5..420 LOOP
        client_uuid := uuid_generate_v4();
        
        -- Segmento aleatorio (mayoría estándar)
        IF random() < 0.1 THEN rand_segment := 'startup';
        ELSIF random() < 0.2 THEN rand_segment := 'grande';
        ELSIF random() < 0.25 THEN rand_segment := 'zombi';
        ELSE rand_segment := 'estandar';
        END IF;

        -- Insertar cliente
        INSERT INTO clients (id, name, segment, service_status) 
        VALUES (client_uuid, 'Cliente Genérico ' || i, rand_segment, 'activo');
        
        -- Decidir si está en mora (simulando la tasa de 14% de morosidad)
        IF random() < 0.14 THEN
            rand_invoice_status := 'pendiente';
            days_overdue := floor(random() * 120 + 1); -- De 1 a 120 días de vencido
            
            INSERT INTO invoices (client_id, amount, due_date, status)
            VALUES (client_uuid, floor(random() * 5000 + 200), CURRENT_DATE - (days_overdue || ' days')::INTERVAL, rand_invoice_status);
        ELSE
            -- Cliente al día (factura pagada o por vencer)
            rand_invoice_status := 'pagada';
            
            INSERT INTO invoices (client_id, amount, due_date, status)
            VALUES (client_uuid, floor(random() * 5000 + 200), CURRENT_DATE - INTERVAL '10 days', rand_invoice_status);
        END IF;
    END LOOP;
END $$;
