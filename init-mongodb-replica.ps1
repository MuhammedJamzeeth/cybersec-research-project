# Initialize MongoDB Replica Set for Prisma
Write-Host "Initializing MongoDB Replica Set..." -ForegroundColor Cyan

# Check if MongoDB is running
$mongoRunning = docker ps --filter "name=mongodb" --format "{{.Names}}" 2>$null

if ($mongoRunning -eq "mongodb") {
    Write-Host "MongoDB container found. Initializing replica set..." -ForegroundColor Green
    
    # Initialize replica set
    docker exec -it mongodb mongosh --eval "
        try {
            rs.status();
            print('Replica set already initialized');
        } catch(e) {
            rs.initiate({
                _id: 'rs0',
                members: [{ _id: 0, host: 'localhost:27017' }]
            });
            print('Replica set initialized successfully');
        }
    "
    
    Write-Host "`nWaiting for replica set to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    Write-Host "`nReplica set status:" -ForegroundColor Cyan
    docker exec -it mongodb mongosh --eval "rs.status()" --quiet
    
    Write-Host "`nDone! Restart your Next.js dev server." -ForegroundColor Green
} else {
    Write-Host "MongoDB container not found. Starting MongoDB with replica set..." -ForegroundColor Yellow
    docker-compose up -d mongodb
    
    Write-Host "Waiting 10 seconds for MongoDB to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "Initializing replica set..." -ForegroundColor Cyan
    docker exec -it mongodb mongosh --eval "
        rs.initiate({
            _id: 'rs0',
            members: [{ _id: 0, host: 'localhost:27017' }]
        });
    "
    
    Start-Sleep -Seconds 3
    Write-Host "`nDone! Restart your Next.js dev server." -ForegroundColor Green
}
