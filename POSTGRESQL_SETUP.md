# PostgreSQL Setup and Migration Guide

## 🐘 Overview

Your application now uses **PostgreSQL** instead of SQLite for better:
- ✅ Performance and scalability
- ✅ Concurrent connections
- ✅ Production-ready features
- ✅ ACID compliance
- ✅ Better data integrity

---

## 🚀 Quick Start with Docker (Easiest)

### Start Everything:
```powershell
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Backend API (port 8000)
- Frontend (port 5173)
- Ollama LLM (port 11434)

### Pull the AI Model:
```powershell
docker exec -it cicada-ollama ollama pull llama3.2
```

### Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432

---

## 🔧 Manual Setup (Without Docker)

### 1. Install PostgreSQL

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Or use Chocolatey: `choco install postgresql`

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Databases

**Connect to PostgreSQL:**
```powershell
# Windows
psql -U postgres


```

**Create databases and user:**
```sql


-- Create databases
CREATE DATABASE cicada_users;
CREATE DATABASE cicada_training;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cicada_users TO cicada_user;
GRANT ALL PRIVILEGES ON DATABASE cicada_training TO cicada_user;

-- Exit
\q
```

### 3. Update Backend Configuration

**Edit `backend/.env`:**
```env
# PostgreSQL connection strings
USER_DATABASE_URL=postgresql://cicada_user:cicada_password@localhost:5432/cicada_users
TRAINING_DATABASE_URL=postgresql://cicada_user:cicada_password@localhost:5432/cicada_training
```

### 4. Install Python Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### 5. Start the Backend

```powershell
cd backend
python -m uvicorn main:app --reload
```

The backend will automatically create all tables on startup!

---

## 🗄️ Database Structure

### Two Separate Databases:

**1. cicada_users** (Authentication Database)
```
Table: users
├── id (SERIAL PRIMARY KEY)
├── email (VARCHAR UNIQUE NOT NULL)
├── hashed_password (VARCHAR NOT NULL)
└── created_at (TIMESTAMP DEFAULT NOW())
```

**2. cicada_training** (Conversations Database)
```
Table: conversations
├── id (SERIAL PRIMARY KEY)
├── user_email (VARCHAR NOT NULL)
├── question (TEXT NOT NULL)
├── response (TEXT NOT NULL)
├── context (TEXT)
└── timestamp (TIMESTAMP DEFAULT NOW())

Indexes:
- idx_conversations_user_email
- idx_conversations_timestamp
```

---

## 🔐 Connection String Format

```
postgresql://[username]:[password]@[host]:[port]/[database]
```

**Example:**
```
postgresql://cicada_user:cicada_password@localhost:5432/cicada_users
```

**For Docker:**
```
postgresql://cicada_user:cicada_password@postgres:5432/cicada_users
```

---

## 📊 Database Management

### Connect to PostgreSQL:

**Using psql (CLI):**
```powershell
# Docker
docker exec -it cicada-postgres psql -U cicada_user -d cicada_users

# Local installation
psql -U cicada_user -d cicada_users
```

### Common PostgreSQL Commands:

```sql
-- List all databases
\l

-- Connect to database
\c cicada_users

-- List all tables
\dt

-- Describe table structure
\d users

-- View all users
SELECT * FROM users;

-- View recent conversations
SELECT * FROM conversations ORDER BY timestamp DESC LIMIT 10;

-- Count users
SELECT COUNT(*) FROM users;

-- Count conversations per user
SELECT user_email, COUNT(*) as conversation_count 
FROM conversations 
GROUP BY user_email;

-- Exit
\q
```

### Backup Database:

```powershell
# Docker
docker exec -t cicada-postgres pg_dump -U cicada_user cicada_users > backup_users.sql
docker exec -t cicada-postgres pg_dump -U cicada_user cicada_training > backup_training.sql

# Local
pg_dump -U cicada_user cicada_users > backup_users.sql
pg_dump -U cicada_user cicada_training > backup_training.sql
```

### Restore Database:

```powershell
# Docker
docker exec -i cicada-postgres psql -U cicada_user cicada_users < backup_users.sql

# Local
psql -U cicada_user cicada_users < backup_users.sql
```

---

## 🔄 Migration from SQLite to PostgreSQL

### If You Have Existing SQLite Data:

**1. Export SQLite Data:**
```python
# export_sqlite.py
import sqlite3
import json

# Export users
conn = sqlite3.connect('users.db')
cursor = conn.cursor()
cursor.execute('SELECT * FROM users')
users = cursor.fetchall()
with open('users.json', 'w') as f:
    json.dump(users, f)
conn.close()

# Export conversations
conn = sqlite3.connect('training.db')
cursor = conn.cursor()
cursor.execute('SELECT * FROM conversations')
conversations = cursor.fetchall()
with open('conversations.json', 'w') as f:
    json.dump(conversations, f)
conn.close()
```

**2. Import to PostgreSQL:**
```python
# import_postgres.py
import json
import psycopg2

# Import users
conn = psycopg2.connect(
    "postgresql://cicada_user:cicada_password@localhost:5432/cicada_users"
)
cursor = conn.cursor()

with open('users.json', 'r') as f:
    users = json.load(f)
    for user in users:
        cursor.execute(
            "INSERT INTO users (id, email, hashed_password, created_at) VALUES (%s, %s, %s, %s)",
            user
        )

conn.commit()
conn.close()

# Similar for conversations...
```

---

## 🐳 Docker Configuration

### PostgreSQL Service:
```yaml
postgres:
  image: postgres:15-alpine
  environment:
    - POSTGRES_USER=cicada_user
    - POSTGRES_PASSWORD=cicada_password
  ports:
    - "5432:5432"
  volumes:
    - postgres-data:/var/lib/postgresql/data
```

### Backend Service (with PostgreSQL):
```yaml
backend:
  environment:
    - USER_DATABASE_URL=postgresql://cicada_user:cicada_password@postgres:5432/cicada_users
    - TRAINING_DATABASE_URL=postgresql://cicada_user:cicada_password@postgres:5432/cicada_training
  depends_on:
    postgres:
      condition: service_healthy
```

---

## ⚙️ Environment Variables

### Development (.env):
```env
USER_DATABASE_URL=postgresql://cicada_user:cicada_password@localhost:5432/cicada_users
TRAINING_DATABASE_URL=postgresql://cicada_user:cicada_password@localhost:5432/cicada_training
```

### Production (secure):
```env
USER_DATABASE_URL=postgresql://prod_user:STRONG_PASSWORD@db-server:5432/cicada_users
TRAINING_DATABASE_URL=postgresql://prod_user:STRONG_PASSWORD@db-server:5432/cicada_training
```

**⚠️ Important:** Change passwords in production!

---

## 🔍 Troubleshooting

### Issue: "Connection refused"
**Cause:** PostgreSQL not running
**Solution:**
```powershell
# Docker
docker-compose up -d postgres

# Local (Windows)
net start postgresql-x64-15

# Local (macOS)
brew services start postgresql@15

# Local (Linux)
sudo systemctl start postgresql
```

### Issue: "password authentication failed"
**Cause:** Wrong credentials
**Solution:** Check username/password in `.env` file

### Issue: "database does not exist"
**Cause:** Databases not created
**Solution:** Run database creation commands (see section 2 above)

### Issue: "pg_config not found"
**Cause:** PostgreSQL development files not installed
**Solution:**
```powershell
# Windows: Install PostgreSQL from official site

# macOS
brew install postgresql

# Linux
sudo apt install postgresql-server-dev-all
```

### Issue: Port 5432 already in use
**Cause:** Another PostgreSQL instance running
**Solution:**
```powershell
# Find process using port 5432
netstat -ano | findstr :5432

# Stop the process or change port in docker-compose.yml
ports:
  - "5433:5432"  # Use different external port
```

---

## 📈 Performance Tips

### Connection Pooling:
SQLAlchemy automatically handles connection pooling. Configure in `database.py`:
```python
engine = create_engine(
    DATABASE_URL,
    pool_size=20,        # Number of connections to maintain
    max_overflow=10,     # Additional connections when needed
    pool_pre_ping=True   # Test connections before using
)
```

### Indexes:
Already created automatically by SQLAlchemy:
- `users.email` - Unique index for fast lookups
- `conversations.user_email` - Index for user queries
- `conversations.timestamp` - Index for time-based queries

### Vacuum (Maintenance):
```sql
-- Reclaim storage and update statistics
VACUUM ANALYZE users;
VACUUM ANALYZE conversations;
```

---

## 🎯 Advantages of PostgreSQL

### vs SQLite:

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Concurrent Writes | ❌ Limited | ✅ Excellent |
| Scalability | ❌ Single file | ✅ Highly scalable |
| Data Types | ⚠️ Limited | ✅ Rich types |
| Full Text Search | ⚠️ Basic | ✅ Advanced |
| Replication | ❌ No | ✅ Yes |
| ACID Compliance | ✅ Yes | ✅ Yes |
| Deployment | ✅ Easy | ⚠️ Moderate |

---

## 🔒 Security Best Practices

### Production Checklist:
- [ ] Change default passwords
- [ ] Use SSL/TLS connections
- [ ] Restrict database access by IP
- [ ] Use environment variables for credentials
- [ ] Enable PostgreSQL authentication logs
- [ ] Regular backups
- [ ] Keep PostgreSQL updated
- [ ] Use read-only users for analytics

### Enable SSL (Production):
```env
USER_DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

---

## 📚 Resources

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **SQLAlchemy with PostgreSQL**: https://docs.sqlalchemy.org/en/14/dialects/postgresql.html
- **psycopg2 Documentation**: https://www.psycopg.org/docs/
- **Docker PostgreSQL**: https://hub.docker.com/_/postgres

---

## ✅ Verification Steps

After setup, verify everything works:

**1. Check PostgreSQL is running:**
```powershell
docker ps | findstr postgres
# OR
psql -U cicada_user -d cicada_users -c "SELECT version();"
```

**2. Check databases exist:**
```sql
psql -U cicada_user -d postgres -c "\l"
```

**3. Start backend and check logs:**
```powershell
cd backend
python -m uvicorn main:app --reload
# Should see: "Application startup complete"
```

**4. Test registration:**
```powershell
curl -X POST http://localhost:8000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"test123"}'
```

**5. Verify user in database:**
```sql
psql -U cicada_user -d cicada_users -c "SELECT * FROM users;"
```

---

## 🎉 Summary

You now have:
- ✅ PostgreSQL database setup (Docker or local)
- ✅ Two separate databases (users + training)
- ✅ Automatic table creation
- ✅ Connection pooling
- ✅ Production-ready configuration
- ✅ Backup and restore procedures
- ✅ Monitoring and maintenance tools

**Next Steps:**
1. Start Docker: `docker-compose up -d`
2. Pull AI model: `docker exec -it cicada-ollama ollama pull llama3.2`
3. Open app: http://localhost:5173
4. Create account and start chatting!

Enjoy your PostgreSQL-powered application! 🚀
