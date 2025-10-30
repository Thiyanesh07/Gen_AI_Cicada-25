

Write-Host "🚀 Starting Farmer Assistant Backend Setup..." -ForegroundColor Green

# Check Python
Write-Host "`n📋 Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "$pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python not found. Please install Python 3.9+ from python.org" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host "`nChecking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version 2>&1
    Write-Host "$pgVersion" -ForegroundColor Green
} catch {
    Write-Host "PostgreSQL CLI not found in PATH" -ForegroundColor Yellow
    Write-Host "Make sure PostgreSQL is installed and running" -ForegroundColor Yellow
}

# Check Ollama
Write-Host "`nChecking Ollama..." -ForegroundColor Yellow
try {
    $ollamaResponse = Invoke-WebRequest -Uri "http://localhost:11434" -Method Get -UseBasicParsing -TimeoutSec 2
    Write-Host "Ollama is running" -ForegroundColor Green
} catch {
    Write-Host "  Ollama is not running or not installed" -ForegroundColor Red
    Write-Host "   Download from: https://ollama.ai/download" -ForegroundColor Yellow
    Write-Host "   After installing, run: ollama pull llama3.2" -ForegroundColor Yellow
}

# Create virtual environment
Write-Host "`n Setting up Python virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host " Virtual environment already exists" -ForegroundColor Green
} else {
    python -m venv venv
    Write-Host "Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment and install dependencies
Write-Host "`n Installing dependencies..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
pip install -r requirements.txt
Write-Host "Dependencies installed" -ForegroundColor Green

# Check for .env file
Write-Host "`n Checking configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host " .env file exists" -ForegroundColor Green
} else {
    Write-Host " .env file not found" -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host " Created .env from .env.example" -ForegroundColor Green
        Write-Host "  Please edit .env and update:" -ForegroundColor Yellow
        Write-Host "   - DATABASE_URL (your PostgreSQL credentials)" -ForegroundColor Yellow
        Write-Host "   - SECRET_KEY (generate with: python -c 'import secrets; print(secrets.token_urlsafe(32))')" -ForegroundColor Yellow
    } else {
        Write-Host " .env.example not found" -ForegroundColor Red
    }
}

Write-Host "`n Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your database credentials" -ForegroundColor White
Write-Host "2. Make sure Ollama is running with a model (ollama pull llama3.2)" -ForegroundColor White
Write-Host "3. Create PostgreSQL database: CREATE DATABASE farmer_assistant_db;" -ForegroundColor White
Write-Host "4. Run: python main.py" -ForegroundColor White
Write-Host "`nFor detailed setup, see README.md" -ForegroundColor Cyan
