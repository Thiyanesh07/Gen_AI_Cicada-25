# Farmer Assistant - Full Stack Setup Guide

A full-stack farmer query assistant application with FastAPI backend using local LLM (via Ollama) and React frontend.

## Architecture Overview

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI + LangChain + Ollama (Local LLM)
- **Database**: PostgreSQL (User auth + Conversation storage)
- **Authentication**: JWT-based (email/password)
- **Model**: Local LLM (Llama 3.2, Mistral, or others via Ollama)

## Prerequisites

1. **Node.js** (v18+) - [Download](https://nodejs.org/)
2. **Python** (3.9+) - [Download](https://www.python.org/)
3. **PostgreSQL** - [Download](https://www.postgresql.org/download/)
4. **Ollama** - [Download](https://ollama.ai/download)

---

## Backend Setup

### 1. Install PostgreSQL

1. Install PostgreSQL and remember your password
2. Create database:
```sql
CREATE DATABASE farmer_assistant_db;
```

### 2. Install and Configure Ollama

**Install Ollama:**
- Download and install from https://ollama.ai/download

**Pull a model** (choose one):
```powershell
# Recommended: Llama 3.2 (2GB)
ollama pull llama3.2

# Alternative: Mistral (4GB)
ollama pull mistral

# Alternative: Phi (1.5GB, faster)
ollama pull phi
```

**Verify Ollama is running:**
Open browser: http://localhost:11434

### 3. Setup Python Environment

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 4. Configure Environment

Copy and edit `.env`:
```powershell
cp .env.example .env
```

Update `.env` with your settings:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/farmer_assistant_db
SECRET_KEY=generate-a-random-secret-key-here
OLLAMA_MODEL=llama3.2
```

Generate SECRET_KEY:
```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5. Start Backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```

Backend will run at: **http://localhost:8000**
API Docs: **http://localhost:8000/docs**

---

## Frontend Setup

### 1. Install Dependencies

```powershell
cd frontend
npm install
```

### 2. Configure Environment

The frontend is already configured to connect to `http://localhost:8000` in `apiService.ts`.

### 3. Start Frontend

```powershell
npm run dev
```

Frontend will run at: **http://localhost:3000** (or 3001 if 3000 is busy)

---

## Usage Guide

### 1. Register/Login

1. Open http://localhost:3000 in your browser
2. Enter email and password
3. Click "Sign In" (registration happens automatically on first login)

### 2. Chat with Local LLM

1. Navigate to the Chat panel
2. Type your farming-related question
3. The local LLM will respond (stored in database for training)

### 3. Export Training Data

**Via API:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/conversations/export?days=30
```

**Via Code:**
```typescript
import { exportConversationsForTraining } from './services/apiService';

const trainingData = await exportConversationsForTraining(30);
```

---

## Database Structure

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Conversations Table
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    context TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user

### Chat
- `POST /api/chat/message` - Send message to LLM
- `GET /api/chat/history?limit=50` - Get chat history
- `DELETE /api/chat/history/{id}` - Delete conversation

### Training Data
- `GET /api/conversations/all` - Get all conversations
- `GET /api/conversations/export?days=30` - Export for training
- `GET /api/conversations/statistics` - Usage statistics

---

## Frontend Changes Made

### Removed:
- ❌ Google OAuth authentication
- ❌ GitHub OAuth authentication
- ❌ Gemini API integration
- ❌ `geminiService.ts` (replaced with `apiService.ts`)

### Added:
- ✅ Email/password authentication
- ✅ JWT token management
- ✅ API service for backend communication
- ✅ Local storage for auth tokens

### Update Your Components:

Replace all imports from `geminiService.ts` with `apiService.ts`:

```typescript
// Old
import { generateImage } from '../services/geminiService';

// New
import { sendChatMessage } from '../services/apiService';
```

**For ChatPanel.tsx:**
```typescript
const response = await sendChatMessage({ 
  message: userMessage,
  context: additionalContext 
});
```

---

## Model Training

### Export Conversations

```bash
# Get last 30 days of conversations
curl http://localhost:8000/api/conversations/export?days=30 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Training Data Format

```json
{
  "total_conversations": 150,
  "date_range": {
    "from": "2025-10-01T00:00:00",
    "to": "2025-10-30T00:00:00"
  },
  "data": [
    {
      "instruction": "How do I prepare soil for tomatoes?",
      "response": "To prepare soil for tomatoes...",
      "context": "",
      "timestamp": "2025-10-15T10:30:00"
    }
  ]
}
```

This data can be used to fine-tune your local model.

---

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Ensure Ollama is running: `curl http://localhost:11434`

### LLM not responding
- Check Ollama is running
- Verify model is pulled: `ollama list`
- Try pulling model again: `ollama pull llama3.2`

### Frontend can't connect
- Verify backend is running on port 8000
- Check CORS settings in `backend/config.py`
- Clear browser cache and localStorage

### Database errors
```powershell
# Check PostgreSQL service
# Windows: Services → PostgreSQL

# Reset database (WARNING: deletes all data)
DROP DATABASE farmer_assistant_db;
CREATE DATABASE farmer_assistant_db;
```

---

## Production Deployment

### Backend
1. Use production PostgreSQL database
2. Set strong SECRET_KEY
3. Configure proper CORS_ORIGINS
4. Use Gunicorn/Uvicorn with supervisor
5. Setup HTTPS

### Frontend
1. Build: `npm run build`
2. Update API_BASE_URL in `apiService.ts`
3. Deploy to Netlify/Vercel/etc.

### Security
- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens with expiration
- ✅ SQL injection protected (SQLAlchemy)
- ✅ CORS configured
- ⚠️ Use HTTPS in production
- ⚠️ Set secure SECRET_KEY
- ⚠️ Enable rate limiting

---

## Next Steps

1. **Update ChatPanel** to use new API service
2. **Add registration UI** (currently auto-registers)
3. **Implement password reset**
4. **Add user profile management**
5. **Setup model fine-tuning pipeline**
6. **Add rate limiting to API**
7. **Implement refresh tokens**

---

## Support

For issues:
1. Check logs: Backend terminal for API errors
2. Check browser console for frontend errors
3. Verify all services are running
4. Check `backend/README.md` for detailed backend info

## License

[Your License Here]
