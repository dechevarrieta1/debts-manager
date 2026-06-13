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

## [2026-06-11] Infraestructura y Dockerización Universal (MVP)
**Agente:** Antigravity (Actuando como Infra Manager)
**Acción Realizada:**
- Creación de archivos `docker-compose` separados para 3 entornos: `dev` (con mapeo de puertos locales), `test` (efímero) y `prod` (seguro, sin puertos expuestos), enfocados *únicamente* en la orquestación de la base de datos por ahora.
- Centralización de variables sensibles en `.env.example`.
- Configuración de la base de datos para auto-iniciar el esquema `schema.sql` usando `/docker-entrypoint-initdb.d/`.
- Creación del `README.md` en la carpeta `infrastructure` con instrucciones precisas para levantar la base de datos.
*(Nota: La dockerización del Frontend y Backend se pospuso hasta tener sus definiciones técnicas cerradas).*

**Reflexión del Desarrollador:**
- Me parece correcto el uso de ciertos puntos dentro de los dockerfiles como los ambientes, por lo general no suelo utilizar los healtchecks TAN FUERTEMENTE y menos en ambientes pre-productivos cada 5 segundos, pero los vamos a dejar asi por ahora.
- Otra observacion es que me parece super correcto el no exponer puerto hacia fuera del docker de prod.
- Si tuve que pararlo en la parte de generacion de los dockerfiles para front y back debido a que aun no definimos ciertas cosas como herramientas de gestion de dependencias, librerias core, etc. 


## [2026-06-11] Generación de Seed Data (MVP)
**Agente:** Antigravity (Actuando como Infra Manager / DB Architect)
**Acción Realizada:**
- Creación de `seeds.sql` utilizando un bloque PL/pgSQL anónimo para generar los 420 clientes sintéticos.
- Se introdujeron casos deterministas ("Corp Zombi 1", "FastTech Startup", etc.) para verificar visualmente que las reglas de negocio del dashboard aplican correctamente.
- Se implementó distribución estadística (función `random()`) simulando el 14% de mora objetivo de la prueba.
- Modificación de `docker-compose.dev.yml` para mapear los volúmenes en orden numérico (`1_schema.sql` y `2_seeds.sql`), garantizando ejecución en secuencia al iniciar el entorno de desarrollo limpio.

**Reflexión del Desarrollador:**
- Tuve que generar una iteracion extra debido a que no pudo con la instruccion de generar el seed.

## [2026-06-13] Backend en Go y Reglas de Negocio (MVP)
**Agente:** Antigravity (Actuando como Backend Manager)
**Acción Realizada:**
- Se implementó la arquitectura en capas (`cmd/api`, `internal/models`, `internal/repository`, `internal/service`, `internal/handler`).
- Se utilizó Go nativo 1.22+ (`net/http.ServeMux`) sin librerías de enrutamiento externas como Gin o Chi.
- El repositorio está 100% implementado con SQL plano y `github.com/lib/pq` en `postgres.go`, conectándose y parseando la data combinada para la vista del dashboard.
- Se implementó `TriageService.PrioritizeClients` donde se ordena la lógica de negocio y se aplican las prioridades 1 a 4.
- Se elaboraron Tests Unitarios en `triage_test.go` validados con un éxito total, asegurando que las reglas del Product Manager se cumplen rigurosamente.

**Reflexión del Desarrollador:**
[ COMPLETAR POR EL USUARIO ]
