Write-Host "`n🎮 Setting up Gaming System..." -ForegroundColor Cyan

# Install @radix-ui/react-progress
Write-Host "`n📦 Installing Progress component..." -ForegroundColor Yellow
npm install @radix-ui/react-progress

# Generate Prisma client with new GameResult model
Write-Host "`n🔄 Generating Prisma client..." -ForegroundColor Yellow
npm run db:generate

# Push schema to MongoDB
Write-Host "`n💾 Updating database schema..." -ForegroundColor Yellow
npm run db:push

Write-Host "`n✅ Gaming system setup complete!" -ForegroundColor Green
Write-Host "`nYou can now:" -ForegroundColor Cyan
Write-Host "  1. Start FastAPI: cd ..\ModelAppPer; .\venv\Scripts\python.exe -m uvicorn main:app --reload" -ForegroundColor White
Write-Host "  2. Start Next.js: npm run dev" -ForegroundColor White
Write-Host "  3. Visit: http://localhost:3000/games" -ForegroundColor White
Write-Host ""
