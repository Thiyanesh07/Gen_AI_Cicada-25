# Docker Setup Guide

This guide will help you run the Cicada-25 project using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Start All Services

```powershell
docker-compose up -d
```

This will start:
- PostgreSQL Database on `localhost:5432`
- Backend API (FastAPI) on `http://localhost:8000`
- Frontend (React + Vite) on `http://localhost:5173`
- Ollama service on `http://localhost:11434`

### 2. Pull the Ollama Model

After services are running, pull the required model:

```powershell
docker exec -it cicada-ollama ollama pull llama3.2
```

### 3. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Common Commands

### View Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ollama
```

### Stop All Services

```powershell
docker-compose down
```

### Stop and Remove Volumes (Clean Slate)

```powershell
docker-compose down -v
```

### Rebuild Services

If you make changes to Dockerfile or dependencies:

```powershell
docker-compose up -d --build
```

### Access Container Shell

```powershell
# PostgreSQL
docker exec -it cicada-postgres psql -U cicada_user -d cicada_users

# Backend
docker exec -it cicada-backend sh

# Frontend
docker exec -it cicada-frontend sh

# Ollama
docker exec -it cicada-ollama sh
```

### Check Ollama Models

```powershell
docker exec -it cicada-ollama ollama list
```

## Development Workflow

### Hot Reload

Both frontend and backend have hot reload enabled:
- Backend: Changes to Python files will auto-reload
- Frontend: Changes to TypeScript/React files will auto-reload

### Install New Python Package

1. Add package to `backend/requirements.txt`
2. Rebuild backend:
   ```powershell
   docker-compose up -d --build backend
   ```

### Install New NPM Package

1. Add package to `frontend/package.json`
2. Rebuild frontend:
   ```powershell
   docker-compose up -d --build frontend
   ```

## Troubleshooting

### Port Already in Use

If you get port conflicts:
1. Stop existing processes using those ports
2. Or modify ports in `docker-compose.yml`

### Ollama Connection Issues

If backend can't connect to Ollama:
1. Check Ollama is running: `docker ps`
2. Verify the model is pulled: `docker exec -it cicada-ollama ollama list`
3. Check backend logs: `docker-compose logs backend`

### Database Issues

To reset the database:
```powershell
docker-compose down -v
docker-compose up -d
```

### Rebuild Everything

For a complete fresh start:
```powershell
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

For production, modify `docker-compose.yml`:
1. Remove volume mounts for code
2. Set `NODE_ENV=production` for frontend
3. Disable `--reload` for backend
4. Use proper environment variables
5. Add nginx reverse proxy
6. Enable SSL/TLS

## Network Architecture

All services run on the `cicada-network` bridge network:
- Services can communicate using service names (e.g., `http://backend:8000`)
- Host machine uses `localhost` to access services
- Backend connects to Ollama via `host.docker.internal:11434`

## Data Persistence

Volumes are used for data persistence:
- `postgres-data`: PostgreSQL databases (users and training data)
- `backend-data`: Backend application data
- `ollama-data`: Ollama models and data

These persist even when containers are stopped.

### Backup PostgreSQL Data

```powershell
# Backup both databases
docker exec -t cicada-postgres pg_dump -U cicada_user cicada_users > backup_users.sql
docker exec -t cicada-postgres pg_dump -U cicada_user cicada_training > backup_training.sql
```

### Restore PostgreSQL Data

```powershell
# Restore databases
docker exec -i cicada-postgres psql -U cicada_user cicada_users < backup_users.sql
docker exec -i cicada-postgres psql -U cicada_user cicada_training < backup_training.sql
```
