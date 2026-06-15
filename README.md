# 🚀 Northwind Triage - Sistema de Gestión de Cobranzas

Bienvenido a **Northwind Triage**, la plataforma de priorización de cobranzas y gestión de carteras. Este documento te guiará paso a paso para levantar, inicializar y probar el sistema localmente desde cero.

---

## 🛠️ Requisitos Previos

Asegúrate de tener instalados los siguientes componentes en tu máquina:
- **Docker y Docker Compose** (Para levantar la base de datos PostgreSQL)
- **Go 1.22+** (Para el Backend)
- **Node.js y pnpm** (Para el Frontend)

---

## 🏗️ Paso 1: Levantar la Base de Datos (PostgreSQL)

El proyecto incluye un entorno Docker preconfigurado que levantará la base de datos y ejecutará automáticamente los scripts de creación de tablas (`schema.sql`).

1. Abre tu terminal en la raíz del proyecto.
2. Navega a la carpeta de infraestructura:
   ```bash
   cd infrastructure
   ```
3. Copia el archivo de variables de entorno de ejemplo:
   ```bash
   cp .env.example .env
   ```
4. Levanta el contenedor en segundo plano:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```
> Verifica que el contenedor esté corriendo con `docker ps`. La base de datos estará disponible en `localhost:5432`.

---

## ⚙️ Paso 2: Ejecutar el Backend (Go)

El backend expone la API REST necesaria para conectar el frontend con la base de datos.

1. Abre una nueva pestaña/ventana en tu terminal.
2. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```
3. Descarga las dependencias:
   ```bash
   go mod tidy
   ```
4. Levanta el servidor:
   ```bash
   go run ./cmd/...
   ```
> El servidor quedará ejecutándose e informará: `Server starting on port 8080`.

---

## 📥 Paso 3: Población Masiva de Datos (Seed)

Para probar la plataforma en su máximo esplendor, alimentaremos la base de datos con cientos de registros aleatorios.

1. Abre una nueva pestaña/ventana en tu terminal.
2. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```
3. Genera el archivo CSV con datos aleatorios ejecutando el *Seeder*:
   ```bash
   go run ./cmd/seed/main.go
   ```
   *Esto creará un archivo llamado `mock_data.csv` en la carpeta `backend`.*
4. Carga esos datos en el sistema llamando al Endpoint de carga mediante `curl`:
   ```bash
   curl -F "file=@mock_data.csv" http://localhost:8080/api/v1/seed/upload
   ```
> Si recibes `{"data":{"message":"Database seeded successfully"}}`, los datos se insertaron con éxito.

---

## 🖥️ Paso 4: Ejecutar el Frontend (React + Vite)

Finalmente, levantaremos la interfaz de usuario.

1. Abre una nueva pestaña/ventana en tu terminal.
2. Navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
3. Instala las dependencias necesarias:
   ```bash
   pnpm install
   ```
4. Levanta el servidor de desarrollo:
   ```bash
   pnpm run dev
   ```

🎉 **¡Todo listo!** 
Abre tu navegador y dirígete a `http://localhost:5173`. Verás el Dashboard de Triaje poblado con toda la información generada, listo para que pruebes los filtros por segmento, la visualización de KPIs y el modal de gestión de acciones.

---

## 🧪 Pruebas Unitarias (Opcional)

Si deseas verificar la robustez de los componentes visuales e interactivos de la aplicación, el Frontend cuenta con un entorno de pruebas robusto (`Vitest` + `React Testing Library`).

1. Desde la carpeta `frontend`, ejecuta:
   ```bash
   pnpm run test
   ```
> Esto validará componentes críticos como el filtrado, los modals y la interacción simulada del usuario.


> Por otro lado, para validar la lógica del negocio central en el servidor, el Backend incluye pruebas nativas de **Go**:

1. Desde la carpeta `backend`, ejecuta los tests unitarios con:
   ```bash
   go test ./... -v
   ```
2. Para comprobar el porcentaje de cobertura de los tests en la lógica del sistema:
   ```bash
   go test ./... -cover
   ```
> Esto confirmará que la segmentación, agrupación de KPIs y priorización concurrente funcionen correctamente.
