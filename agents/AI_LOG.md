# Registro de Uso de IA (AI Log)

## [2026-06-11] Definición de Producto y Alcance (MVP)
**Agente:** Antigravity (Actuando como Technical Product Manager)
**Acción Realizada:** 
- Análisis del problema de cobranza descrito en `instructions.md` y asunción de rol según `product_manager.md`.
- Definición de reglas de negocio y segmentos (Zombis, Startups, Grandes, Estándar).
- Redacción de 3 Historias de Usuario core para el MVP del dashboard de triaje.
- Creación de diagramas de secuencia en formato Mermaid para el flujo principal de triaje y la actualización de estado de gestión.
- Redacción del borrador final para el archivo `DECISIONS.md`, justificando qué entra en el MVP de 3 días y qué queda excluido.

**Reflexión del Desarrollador:**
El dia de hoy dejamos como supuestos varios puntos de valor importantes:
- Generamos los agentes respectivos segregando en 5 agentes base para poder tener mejor control del desarrollo, cada uno con su propia descripción de objetivos, reglas y contexto.
- Solo nos enfocaremos en la funcionalidad de triaje y gestión manual, dejando fuera el envío automatizado de recordatorios por email o SMS.
- Definimos un modelo de datos relacional que permite la interacción entre clientes, facturas y gestiones, con 3 tablas principales.
- Definimos las reglas de negocio para la segmentación de clientes en 4 categorías (Zombis, Startups, Grandes, Estándar) y las prioridades asociadas.
- Definimos un flujo de trabajo simple para el triaje de clientes y la gestión de cobranzas, con 3 historias de usuario principales.

## [2026-06-11] Diseño de Base de Datos y Normalización (MVP)
**Agente:** Antigravity (Actuando como Database Architect)
**Acción Realizada:**
- Diseño del esquema relacional en 3NF focalizado en `clients`, `invoices` y `collection_actions`.
- Generación del diagrama visual en sintaxis `dbdiagram.io`.
- Creación del Diccionario de Datos base definiendo tipos estrictos (UUIDs, `NUMERIC` para montos, `TIMESTAMPTZ` para fechas) y refinado con tipos `ENUM` (`segment_type`, `service_status_type`, `invoice_status_type`) en minúsculas por decisión técnica.
- Generación de script DDL con índices optimizados para las consultas de triaje y estados de deuda.
- Creacion de carpeta infraestructure con los diagramas y script DDL.

**Reflexión del Desarrollador:**
Segundo update:
- Tuve que modificar salida del agente a nivel de gestor de bases de datos, dado que la primera salida generada tenia una orientacion generalista para un contexto que definimos cerrado.
- Se cambiaron ciertas columnas para manejar enums en vez de textos para asegurar integridad referencial y evitar errores de tipeo.
- No definí usar tablas intermedias para los mismos debido a que considero que es innecesario y lo volvería mas complejo de mantener y entender para el desarrollador y alcance que definimos.
