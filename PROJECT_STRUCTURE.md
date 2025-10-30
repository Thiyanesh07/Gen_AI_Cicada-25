# Project Structure

```
Gen_AI_Cicada-25/
│
├── 📄 SETUP_GUIDE.md          # Comprehensive setup instructions
├── 📄 CHANGES.md              # Detailed list of all changes
├── 📄 start-all.ps1           # Launch both backend and frontend
│
├── 📁 backend/                # FastAPI Backend
│   ├── 📄 main.py            # FastAPI app entry point
│   ├── 📄 config.py          # Configuration (env variables)
│   ├── 📄 database.py        # Database connection & session
│   ├── 📄 models.py          # SQLAlchemy models (Users, Conversations)
│   ├── 📄 schemas.py         # Pydantic schemas for validation
│   ├── 📄 auth.py            # JWT authentication utilities
│   ├── 📄 requirements.txt   # Python dependencies
│   ├── 📄 .env.example       # Environment variables template
│   ├── 📄 .gitignore         # Git ignore patterns
│   ├── 📄 README.md          # Backend documentation
│   ├── 📄 setup.ps1          # Setup script
│   ├── 📄 start.ps1          # Start script
│   │
│   ├── 📁 routes/            # API endpoints
│   │   ├── 📄 __init__.py
│   │   ├── 📄 auth.py       # /api/auth/* endpoints
│   │   ├── 📄 chat.py       # /api/chat/* endpoints
│   │   └── 📄 conversations.py  # /api/conversations/* endpoints
│   │
│   └── 📁 services/          # Business logic
│       ├── 📄 __init__.py
│       └── 📄 llm_service.py # LangChain + Ollama integration
│
└── 📁 frontend/              # React Frontend
    ├── 📄 App.tsx            # Main app component
    ├── 📄 index.tsx          # Entry point
    ├── 📄 constants.tsx      # Constants
    ├── 📄 translations.ts    # i18n translations
    ├── 📄 types.ts           # TypeScript types
    ├── 📄 package.json       # Node dependencies
    ├── 📄 vite.config.ts     # Vite configuration
    ├── 📄 tsconfig.json      # TypeScript config
    │
    ├── 📁 components/        # React components
    │   ├── 📄 Icon.tsx
    │   ├── 📄 LoginPage.tsx  # ✨ Updated (removed OAuth)
    │   ├── 📄 MainPage.tsx
    │   ├── 📄 ThemeToggle.tsx
    │   │
    │   └── 📁 panels/        # Feature panels
    │       ├── 📄 AudioPanel.tsx
    │       ├── 📄 ChatPanel.tsx
    │       ├── 📄 ImagePanel.tsx
    │       ├── 📄 RemindersPanel.tsx
    │       ├── 📄 SettingsPanel.tsx
    │       ├── 📄 TextExtractorPanel.tsx
    │       └── 📄 VideoPanel.tsx
    │
    ├── 📁 contexts/          # React contexts
    │   └── 📄 LanguageContext.tsx
    │
    └── 📁 services/          # API services
        ├── 📄 geminiService.ts   # ❌ Old (no longer used)
        └── 📄 apiService.ts      # ✨ New (FastAPI client)
```

## Key Files Explained

### Backend Core:
- **main.py** - FastAPI app with CORS, routes, database init
- **config.py** - Loads environment variables with Pydantic
- **database.py** - SQLAlchemy engine, session, Base
- **models.py** - Users & Conversations tables
- **schemas.py** - Request/response validation models
- **auth.py** - Password hashing, JWT creation, user verification

### Backend Routes:
- **auth.py** - Register, login, get current user
- **chat.py** - Send message, get history, delete conversation
- **conversations.py** - Export training data, statistics

### Backend Services:
- **llm_service.py** - LangChain + Ollama for local LLM inference

### Frontend Services:
- **apiService.ts** - Complete API client (replaces geminiService.ts)
  - Authentication (register, login, logout)
  - Chat (send message, get history)
  - Training data export
  - Token management (localStorage)

### Frontend Components:
- **LoginPage.tsx** - Simplified to email/password only
- **ChatPanel.tsx** - Needs update to use apiService
- Other panels - Need updates based on requirements

## Database Schema

### users table:
```sql
id              SERIAL PRIMARY KEY
email           VARCHAR UNIQUE NOT NULL
hashed_password VARCHAR NOT NULL
created_at      TIMESTAMP DEFAULT NOW()
```

### conversations table:
```sql
id          SERIAL PRIMARY KEY
user_id     INTEGER REFERENCES users(id)
question    TEXT NOT NULL
response    TEXT NOT NULL
context     TEXT
timestamp   TIMESTAMP DEFAULT NOW()
```

## Environment Variables

### Backend (.env):
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/farmer_assistant_db
SECRET_KEY=your-random-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
```

### Frontend:
No environment variables needed. API URL is in apiService.ts:
```typescript
const API_BASE_URL = 'http://localhost:8000';
```

## Tech Stack

### Backend:
- FastAPI (Web framework)
- SQLAlchemy (ORM)
- PostgreSQL (Database)
- LangChain (LLM framework)
- Ollama (Local LLM runtime)
- Python-Jose (JWT)
- Passlib (Password hashing)

### Frontend:
- React 19
- TypeScript
- Vite
- (No external auth dependencies)

## Quick Start

1. **Install prerequisites:**
   - Python 3.9+
   - Node.js 18+
   - PostgreSQL
   - Ollama

2. **Setup database:**
   ```sql
   CREATE DATABASE farmer_assistant_db;
   ```

3. **Install Ollama model:**
   ```bash
   ollama pull llama3.2
   ```

4. **Setup backend:**
   ```powershell
   cd backend
   .\setup.ps1
   ```

5. **Setup frontend:**
   ```powershell
   cd frontend
   npm install
   ```

6. **Start everything:**
   ```powershell
   .\start-all.ps1
   ```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login (get JWT) |
| GET | /api/auth/me | Get current user |
| POST | /api/chat/message | Send chat message |
| GET | /api/chat/history | Get chat history |
| DELETE | /api/chat/history/{id} | Delete conversation |
| GET | /api/conversations/all | All conversations |
| GET | /api/conversations/export | Export for training |
| GET | /api/conversations/statistics | Usage stats |

## Next Steps

1. ✅ Backend created and documented
2. ✅ Frontend authentication updated
3. ✅ API service created
4. ⏳ Update ChatPanel to use new API
5. ⏳ Test full authentication flow
6. ⏳ Export training data and fine-tune model

See SETUP_GUIDE.md for detailed instructions!
