# Cybersecurity Assessment Platform - Startup Script
# This script starts all microservices

Write-Host "🚀 Starting Cybersecurity Assessment Platform..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Option 1: Run with Docker Compose
Write-Host "Choose startup option:" -ForegroundColor Yellow
Write-Host "1. Backend services only (Docker) + Frontend locally (Recommended for development)"
Write-Host "2. All services with Docker Compose (Full production setup)"
Write-Host "3. Start services individually (Manual development)"
Write-Host "4. Stop all services"
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🐳 Starting backend services with Docker..." -ForegroundColor Cyan
        Write-Host ""
        
        # Build and start backend services only
        docker-compose -f docker-compose.dev.yml up --build -d
        
        Write-Host ""
        Write-Host "✅ Backend services are starting up!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📍 Service URLs:" -ForegroundColor Yellow
        Write-Host "   App Permissions API:       http://localhost:8000/docs"
        Write-Host "   Phishing Detection API:    http://localhost:8001/docs"
        Write-Host "   Password Security API:     http://localhost:8002/docs"
        Write-Host "   Social Engineering API:    http://localhost:8003/docs"
        Write-Host "   Safe Browsing API:         http://localhost:8004/docs"
        Write-Host "   MongoDB:                   mongodb://localhost:27017"
        Write-Host ""
        Write-Host "🎯 To start the frontend:" -ForegroundColor Cyan
        Write-Host "   cd gamification-next"
        Write-Host "   pnpm install"
        Write-Host "   pnpm dev"
        Write-Host ""
        Write-Host "💡 View logs: docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor Cyan
        Write-Host "💡 Stop services: docker-compose -f docker-compose.dev.yml down" -ForegroundColor Cyan
    }
    
    "2" {
        Write-Host ""
        Write-Host "🐳 Starting all services with Docker Compose..." -ForegroundColor Cyan
        Write-Host ""
        
        # Build and start all containers including frontend
        docker-compose up --build -d
        
        Write-Host ""
        Write-Host "✅ All services are starting up!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📍 Service URLs:" -ForegroundColor Yellow
        Write-Host "   Frontend:                  http://localhost:3000"
        Write-Host "   App Permissions API:       http://localhost:8000/docs"
        Write-Host "   Phishing Detection API:    http://localhost:8001/docs"
        Write-Host "   Password Security API:     http://localhost:8002/docs"
        Write-Host "   Social Engineering API:    http://localhost:8003/docs"
        Write-Host "   Safe Browsing API:         http://localhost:8004/docs"
        Write-Host "   MongoDB:                   mongodb://localhost:27017"
        Write-Host ""
        Write-Host "💡 View logs: docker-compose logs -f" -ForegroundColor Cyan
        Write-Host "💡 Stop services: docker-compose down" -ForegroundColor Cyan
    }
    
    "3" {
        Write-Host ""
        Write-Host "🔧 Development Mode - Starting services individually..." -ForegroundColor Cyan
        Write-Host ""
        
        # Start MongoDB only with Docker
        Write-Host "Starting MongoDB..." -ForegroundColor Yellow
        docker-compose up -d mongodb mongo-init
        Start-Sleep -Seconds 5
        
        Write-Host ""
        Write-Host "✅ MongoDB started" -ForegroundColor Green
        Write-Host ""
        Write-Host "To start services manually:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "# App Permission Service"
        Write-Host "cd app-permission-service"
        Write-Host "python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload"
        Write-Host ""
        Write-Host "# Phishing Detection Service"
        Write-Host "cd phishing-detection-service"
        Write-Host "python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8001 --reload"
        Write-Host ""
        Write-Host "# Password Security Service"
        Write-Host "cd password-security-service"
        Write-Host "python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8002 --reload"
        Write-Host ""
        Write-Host "# Social Engineering Service"
        Write-Host "cd social-engineering-service"
        Write-Host "python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8003 --reload"
        Write-Host ""
        Write-Host "# Safe Browsing Service"
        Write-Host "cd device-security-service"
        Write-Host "python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8004 --reload"
        Write-Host ""
        Write-Host "# Frontend"
        Write-Host "cd gamification-next"
        Write-Host "pnpm dev"
    }
    
    "4" {
        Write-Host ""
        Write-Host "🛑 Stopping all services..." -ForegroundColor Red
        docker-compose down
        docker-compose -f docker-compose.dev.yml down
        Write-Host ""
        Write-Host "✅ All services stopped" -ForegroundColor Green
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
