# 🐘 PostgreSQL Migration Complete!

## ✅ What Changed

Your application now uses **PostgreSQL** instead of SQLite for better performance and scalability!

### Files Updated:
- ✅ `backend/requirements.txt` - Added `asyncpg` for async PostgreSQL support
- ✅ `backend/.env` - Updated to PostgreSQL connection strings
- ✅ `backend/.env.example` - Updated with PostgreSQL examples
- ✅ `docker-compose.yml` - Added PostgreSQL container with health checks
- ✅ `docker/init-db.sql` - Database initialization script
- ✅ `DOCKER_GUIDE.md` - Updated with PostgreSQL info
- ✅ `POSTGRESQL_SETUP.md` - Complete PostgreSQL guide (NEW)

---

## 🚀 Quick Start

### Using Docker (Easiest):

```powershell
# Start all services (PostgreSQL + Backend + Frontend + Ollama)
docker-compose up -d

# Wait for PostgreSQL to be ready (about 10-15 seconds)
docker ps

# Pull the AI model
docker exec -it cicada-ollama ollama pull llama3.2

# Open your browser
start http://localhost:5173
```

### Manual Setup:

**1. Install PostgreSQL:**
- Download: https://www.postgresql.org/download/
- Or use package manager

**2. Create Databases:**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create user
CREATE USER cicada_user WITH PASSWORD 'cicada_password';

-- Create databases
CREATE DATABASE cicada_users;
CREATE DATABASE cicada_training;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE cicada_users TO cicada_user;
GRANT ALL PRIVILEGES ON DATABASE cicada_training TO cicada_user;

-- Exit
\q
```

**3. Install Python packages:**
```powershell
cd backend
pip install -r requirements.txt
```

**4. Start Backend:**
```powershell
cd backend
python -m uvicorn main:app --reload
```

**5. Start Frontend:**
```powershell
cd frontend
npm install
npm run dev
```

---

## 🗄️ Database Configuration

### Current Setup (.env):

```env
# User Authentication Database
USER_DATABASE_URL=postgresql://cicada_user:cicada_password@localhost:5432/cicada_users

# Conversations/Training Database
TRAINING_DATABASE_URL=postgresql://cicada_user:cicada_password@localhost:5432/cicada_training
```

### Docker Setup:
```env
# In Docker, use 'postgres' as hostname instead of 'localhost'
USER_DATABASE_URL=postgresql://cicada_user:cicada_password@postgres:5432/cicada_users
TRAINING_DATABASE_URL=postgresql://cicada_user:cicada_password@postgres:5432/cicada_training
```

---

## 🔍 Verify Setup

### Check PostgreSQL is Running:

**Docker:**
```powershell
docker ps | findstr postgres
docker logs cicada-postgres
```

**Local:**
```powershell
pg_isready -U cicada_user
```

### Access PostgreSQL:

**Docker:**
```powershell
docker exec -it cicada-postgres psql -U cicada_user -d cicada_users
```

**Local:**
```powershell
psql -U cicada_user -d cicada_users
```

### Common PostgreSQL Commands:

```sql
-- List all databases
\l

-- Connect to database
\c cicada_users

-- List tables
\dt

-- View table structure
\d users

-- View all users
SELECT * FROM users;

-- View recent conversations
SELECT * FROM conversations ORDER BY timestamp DESC LIMIT 10;

-- Count total users
SELECT COUNT(*) FROM users;

-- Exit
\q
```

---

## 📊 Database Schema

### cicada_users Database:

**users table:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### cicada_training Database:

**conversations table:**
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR NOT NULL,
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    context TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_user_email ON conversations(user_email);
CREATE INDEX idx_conversations_timestamp ON conversations(timestamp);
```

---

## 💾 Backup & Restore

### Backup Databases:

**Docker:**
```powershell
# Backup users database
docker exec -t cicada-postgres pg_dump -U cicada_user cicada_users > backup_users.sql

# Backup training database
docker exec -t cicada-postgres pg_dump -U cicada_user cicada_training > backup_training.sql
```

**Local:**
```powershell
pg_dump -U cicada_user cicada_users > backup_users.sql
pg_dump -U cicada_user cicada_training > backup_training.sql
```

### Restore Databases:

**Docker:**
```powershell
docker exec -i cicada-postgres psql -U cicada_user cicada_users < backup_users.sql
docker exec -i cicada-postgres psql -U cicada_user cicada_training < backup_training.sql
```

**Local:**
```powershell
psql -U cicada_user cicada_users < backup_users.sql
psql -U cicada_user cicada_training < backup_training.sql
```

---

## ⚠️ Troubleshooting

### Issue: "Connection refused"
**Solution:**
```powershell
# Docker: Start PostgreSQL
docker-compose up -d postgres

# Local: Start PostgreSQL service
# Windows
net start postgresql-x64-15

# Linux/Mac
sudo systemctl start postgresql
```

### Issue: "password authentication failed"
**Solution:** Check credentials in `backend/.env` file

### Issue: "database does not exist"
**Solution:** Create databases using SQL commands above

### Issue: "role does not exist"
**Solution:**
```sql
CREATE USER cicada_user WITH PASSWORD 'cicada_password';
```

### Issue: Port 5432 already in use
**Solution:**
```powershell
# Find what's using port 5432
netstat -ano | findstr :5432

# Kill the process or change Docker port
# In docker-compose.yml: "5433:5432"
```

### Issue: "Import asyncpg could not be resolved"
**Solution:**
```powershell
cd backend
pip install asyncpg psycopg2-binary
```

---

## 🎯 Advantages Over SQLite

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| **Concurrent Writes** | ❌ Limited | ✅ Unlimited |
| **Scalability** | ❌ Single file | ✅ Enterprise-grade |
| **Data Types** | ⚠️ Basic | ✅ Advanced |
| **Full Text Search** | ⚠️ Limited | ✅ Powerful |
| **Replication** | ❌ No | ✅ Yes |
| **Performance** | ⚠️ Good for small | ✅ Excellent for large |
| **ACID** | ✅ Yes | ✅ Yes |
| **Production Ready** | ⚠️ Small apps | ✅ Enterprise apps |

---

## 📚 Documentation

For more details, see:
- **POSTGRESQL_SETUP.md** - Complete PostgreSQL setup and migration guide
- **USER_AUTH_GUIDE.md** - Authentication system documentation
- **DOCKER_GUIDE.md** - Docker deployment guide

---

## 🧪 Test the Setup

### 1. Test Backend Health:
```powershell
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### 2. Test User Registration:
```powershell
curl -X POST http://localhost:8000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"test123456"}'
```

### 3. Verify in Database:
```sql
docker exec -it cicada-postgres psql -U cicada_user -d cicada_users -c "SELECT * FROM users;"
```

### 4. Test Login:
```powershell
curl -X POST http://localhost:8000/api/auth/login `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "username=test@example.com&password=test123456"
```

---

## 🎉 Summary

You now have:
- ✅ **PostgreSQL Database** - Production-ready, scalable database
- ✅ **Two Separate Databases** - Users & Training data isolated
- ✅ **Docker Integration** - PostgreSQL container with health checks
- ✅ **Automatic Schema Creation** - Tables created by SQLAlchemy
- ✅ **Backup & Restore** - Database management tools
- ✅ **Connection Pooling** - Optimized database connections
- ✅ **Async Support** - asyncpg for better performance

### Environment Summary:

**Services Running:**
- 🐘 PostgreSQL (port 5432) - Databases: cicada_users, cicada_training
- 🚀 FastAPI Backend (port 8000) - User auth & chat API
- ⚛️ React Frontend (port 5173) - User interface
- 🤖 Ollama (port 11434) - Local LLM (llama3.2)

**Connection Strings:**
- Users DB: `postgresql://cicada_user:cicada_password@localhost:5432/cicada_users`
- Training DB: `postgresql://cicada_user:cicada_password@localhost:5432/cicada_training`

### Next Steps:
1. ✅ PostgreSQL is configured
2. ✅ Databases are ready
3. ✅ Schema will auto-create on first run
4. 🎯 **Start the app:** `docker-compose up -d`
5. 🎯 **Access:** http://localhost:5173

**Happy coding with PostgreSQL! 🚀**
