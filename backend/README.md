# Backend Setup Guide

This backend uses FastAPI with LangChain and a local LLM (via Ollama) instead of Google's Gemini API.

## Prerequisites

1. **Python 3.9+**
2. **PostgreSQL** database
3. **Ollama** (for running local LLM)

## Installation Steps

### 1. Install PostgreSQL

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Install and remember your password
- Default port: 5432

Create a new database:
```sql
CREATE DATABASE farmer_assistant_db;
```

### 2. Install Ollama

**Windows:**
- Download from: https://ollama.ai/download
- Install the application
- Open PowerShell and run:
```powershell
ollama pull llama3.2
```

This will download the Llama 3.2 model (about 2GB). You can use other models like:
- `ollama pull mistral` (Mistral 7B)
- `ollama pull llama2` (Llama 2)
- `ollama pull phi` (Microsoft Phi - smaller, faster)

### 3. Set up Python Environment

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```

Edit `.env` and update:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/farmer_assistant_db
SECRET_KEY=your-secret-key-change-this-to-something-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
```

To generate a secure SECRET_KEY, run in Python:
```python
import secrets
print(secrets.token_urlsafe(32))
```

### 5. Start Ollama Service

Make sure Ollama is running. On Windows, it should start automatically after installation. You can verify by opening:
```
http://localhost:11434
```

### 6. Run the Backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```

Or use uvicorn directly:
```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: **http://localhost:8000**
API documentation: **http://localhost:8000/docs**

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Chat
- `POST /api/chat/message` - Send chat message
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/history/{id}` - Delete conversation

### Training Data
- `GET /api/conversations/all` - Get all conversations
- `GET /api/conversations/export` - Export for training
- `GET /api/conversations/statistics` - Get statistics

## Database Schema

### Users Table
- id (Primary Key)
- email (Unique)
- hashed_password
- created_at

### Conversations Table
- id (Primary Key)
- user_id (Foreign Key → users.id)
- question (Text)
- response (Text)
- context (Text, nullable)
- timestamp

## Model Training

The conversations are stored in PostgreSQL and can be exported for fine-tuning your local model:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/conversations/export?days=30
```

This returns data in a format suitable for model training.

## Troubleshooting

### Ollama not responding
```powershell
# Check if Ollama is running
curl http://localhost:11434

# Restart Ollama (Windows)
# Close Ollama from system tray and restart it
```

### Database connection errors
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### Import errors
```powershell
pip install --upgrade -r requirements.txt
```

## Alternative Models

To use a different model:
1. Pull the model: `ollama pull model-name`
2. Update `.env`: `OLLAMA_MODEL=model-name`
3. Restart the backend

Recommended models:
- **llama3.2** - Best quality, slower (2GB)
- **mistral** - Good balance (4GB)
- **phi** - Fastest, smallest (1.5GB)
