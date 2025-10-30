# Start Backend Script

Write-Host " Starting Farmer Assistant Backend..." -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host " .env file not found!" -ForegroundColor Red
    Write-Host "   Run setup.ps1 first or copy .env.example to .env" -ForegroundColor Yellow
    exit 1
}

# Check if venv exists
if (-not (Test-Path "venv")) {
    Write-Host " Virtual environment not found!" -ForegroundColor Red
    Write-Host "   Run setup.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Check Ollama
Write-Host "`n Checking Ollama..." -ForegroundColor Yellow
try {
    $ollamaResponse = Invoke-WebRequest -Uri "http://localhost:11434" -Method Get -UseBasicParsing -TimeoutSec 2
    Write-Host "Ollama is running" -ForegroundColor Green
} catch {
    Write-Host "  Warning: Ollama is not responding at http://localhost:11434" -ForegroundColor Yellow
    Write-Host "   The backend will start but LLM features won't work" -ForegroundColor Yellow
}

# Start the server
Write-Host "`n Starting FastAPI server..." -ForegroundColor Green
Write-Host "API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Yellow

python main.py
