# Full Stack Starter Script

Write-Host "🚀 Farmer Assistant - Full Stack Launcher" -ForegroundColor Green
Write-Host "=========================================`n" -ForegroundColor Green

# Function to check if a port is in use
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# Check Ollama
Write-Host "📋 Checking Ollama..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434" -Method Get -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Ollama is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Ollama is not running!" -ForegroundColor Red
    Write-Host "   Please start Ollama and run: ollama pull llama3.2" -ForegroundColor Yellow
    Write-Host "   Download from: https://ollama.ai/download`n" -ForegroundColor Cyan
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") { exit 1 }
}

# Check if backend port is available
Write-Host "`n📋 Checking backend port (8000)..." -ForegroundColor Yellow
if (Test-Port -Port 8000) {
    Write-Host "⚠️  Port 8000 is already in use" -ForegroundColor Yellow
    Write-Host "   Backend might already be running" -ForegroundColor Yellow
} else {
    Write-Host "✅ Port 8000 is available" -ForegroundColor Green
}

# Check if frontend port is available
Write-Host "📋 Checking frontend port (3000)..." -ForegroundColor Yellow
if (Test-Port -Port 3000) {
    Write-Host "⚠️  Port 3000 is in use, frontend will use port 3001" -ForegroundColor Yellow
} else {
    Write-Host "✅ Port 3000 is available" -ForegroundColor Green
}

Write-Host "`n🚀 Starting services...`n" -ForegroundColor Green

# Start Backend
Write-Host "1️⃣  Starting Backend (FastAPI)..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "backend"
if (Test-Path $backendPath) {
    $backendJob = Start-Job -ScriptBlock {
        param($path)
        Set-Location $path
        & ".\venv\Scripts\Activate.ps1"
        python main.py
    } -ArgumentList $backendPath
    
    Start-Sleep -Seconds 3
    
    if ($backendJob.State -eq "Running") {
        Write-Host "   ✅ Backend started" -ForegroundColor Green
        Write-Host "   📍 API: http://localhost:8000" -ForegroundColor White
        Write-Host "   📍 Docs: http://localhost:8000/docs`n" -ForegroundColor White
    } else {
        Write-Host "   ❌ Backend failed to start" -ForegroundColor Red
        Write-Host "   Check backend/.env configuration`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Backend directory not found`n" -ForegroundColor Red
}

# Start Frontend
Write-Host "2️⃣  Starting Frontend (React + Vite)..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "frontend"
if (Test-Path $frontendPath) {
    $frontendJob = Start-Job -ScriptBlock {
        param($path)
        Set-Location $path
        npm run dev
    } -ArgumentList $frontendPath
    
    Start-Sleep -Seconds 5
    
    if ($frontendJob.State -eq "Running") {
        Write-Host "   ✅ Frontend started" -ForegroundColor Green
        Write-Host "   📍 App: http://localhost:3000 (or 3001)`n" -ForegroundColor White
    } else {
        Write-Host "   ❌ Frontend failed to start" -ForegroundColor Red
        Write-Host "   Run 'npm install' in frontend directory`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Frontend directory not found`n" -ForegroundColor Red
}

Write-Host "=========================================`n" -ForegroundColor Green
Write-Host "📊 Services Status:" -ForegroundColor Cyan
Write-Host "   Backend:  " -NoNewline -ForegroundColor White
if ($backendJob -and $backendJob.State -eq "Running") {
    Write-Host "🟢 Running" -ForegroundColor Green
} else {
    Write-Host "🔴 Not Running" -ForegroundColor Red
}

Write-Host "   Frontend: " -NoNewline -ForegroundColor White
if ($frontendJob -and $frontendJob.State -eq "Running") {
    Write-Host "🟢 Running`n" -ForegroundColor Green
} else {
    Write-Host "🔴 Not Running`n" -ForegroundColor Red
}

Write-Host "🌐 Open in browser: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📚 API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`n⚠️  Press Ctrl+C to stop all services`n" -ForegroundColor Yellow

# Wait for user to stop
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`n🛑 Stopping services..." -ForegroundColor Yellow
    if ($backendJob) { Stop-Job -Job $backendJob; Remove-Job -Job $backendJob }
    if ($frontendJob) { Stop-Job -Job $frontendJob; Remove-Job -Job $frontendJob }
    Write-Host "✅ All services stopped" -ForegroundColor Green
}
