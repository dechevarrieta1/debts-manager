# Infraestructura de Northwind Triage MVP

Este directorio contiene la orquestación inicial de contenedores Docker. Actualmente, está enfocado únicamente en proveer la base de datos PostgreSQL de forma consistente para los distintos entornos. Los servicios de backend y frontend se incorporarán más adelante en sus respectivas definiciones.

## Requisitos Previos
- Docker y Docker Compose instalados.
- Puerto `5432` disponible localmente (entorno `dev`).

## 🚀 Cómo levantar la base de datos local

1. **Configurar las variables de entorno:**
   ```bash
   cp .env.example .env
   ```

2. **Levantar el contenedor:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Verificar que esté corriendo:**
   ```bash
   docker ps
   ```

### Notas importantes:
- **Base de datos Automática:** Al levantar el compose por primera vez, PostgreSQL ejecutará automáticamente el archivo `schema.sql`.

## 🌍 Entornos Disponibles

1. **Development (`docker-compose.dev.yml`)**: Expone el puerto `5432`. Usa volúmenes locales.
2. **Testing (`docker-compose.test.yml`)**: Entorno efímero. No retiene datos.
3. **Production (`docker-compose.prod.yml`)**: Contenedor securizado, no expone el puerto `5432` al exterior.
