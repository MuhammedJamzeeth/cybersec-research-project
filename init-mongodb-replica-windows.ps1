# Convert MongoDB Windows Service to Replica Set
Write-Host "Converting MongoDB to Replica Set..." -ForegroundColor Cyan

# Stop MongoDB service
Write-Host "Stopping MongoDB service..." -ForegroundColor Yellow
Stop-Service -Name "MongoDB" -Force

# Find MongoDB installation and config
$mongoPath = "C:\Program Files\MongoDB\Server"
$mongoCfgPath = "$mongoPath\mongod.cfg"

# Common MongoDB installation paths
$possiblePaths = @(
    "C:\Program Files\MongoDB\Server\7.0",
    "C:\Program Files\MongoDB\Server\6.0",
    "C:\Program Files\MongoDB\Server\5.0",
    "C:\Program Files\MongoDB\Server\4.4"
)

$mongoInstall = $null
foreach ($path in $possiblePaths) {
    if (Test-Path "$path\bin\mongod.exe") {
        $mongoInstall = $path
        $mongoCfgPath = "$path\bin\mongod.cfg"
        break
    }
}

if (-not $mongoInstall) {
    Write-Host "MongoDB installation not found. Please start Docker Desktop and run .\init-mongodb-replica.ps1 instead" -ForegroundColor Red
    exit 1
}

Write-Host "Found MongoDB at: $mongoInstall" -ForegroundColor Green

# Backup original config
if (Test-Path $mongoCfgPath) {
    Copy-Item $mongoCfgPath "$mongoCfgPath.backup" -Force
    Write-Host "Backed up config to $mongoCfgPath.backup" -ForegroundColor Green
}

# Update config for replica set
$configContent = @"
# mongod.conf - Replica Set Configuration

# Where and how to store data.
storage:
  dbPath: C:\data\db
  journal:
    enabled: true

# Where to write logging data.
systemLog:
  destination: file
  logAppend: true
  path: C:\data\log\mongod.log

# Network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1,localhost

# Replica Set
replication:
  replSetName: rs0
"@

Set-Content -Path $mongoCfgPath -Value $configContent
Write-Host "Updated MongoDB config for replica set" -ForegroundColor Green

# Ensure data directories exist
if (-not (Test-Path "C:\data\db")) {
    New-Item -ItemType Directory -Path "C:\data\db" -Force | Out-Null
}
if (-not (Test-Path "C:\data\log")) {
    New-Item -ItemType Directory -Path "C:\data\log" -Force | Out-Null
}

# Start MongoDB service
Write-Host "Starting MongoDB service with replica set..." -ForegroundColor Yellow
Start-Service -Name "MongoDB"
Start-Sleep -Seconds 3

# Initialize replica set using mongo command
Write-Host "Initializing replica set..." -ForegroundColor Cyan
$mongoShellPath = "$mongoInstall\bin\mongo.exe"
$mongoShPath = "$mongoInstall\bin\mongosh.exe"

$initScript = "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"

if (Test-Path $mongoShPath) {
    & $mongoShPath --eval $initScript
} elseif (Test-Path $mongoShellPath) {
    & $mongoShellPath --eval $initScript
} else {
    Write-Host "MongoDB shell not found. Manually run: rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})" -ForegroundColor Yellow
}

Start-Sleep -Seconds 2
Write-Host "`nDone! MongoDB is now running as replica set 'rs0'" -ForegroundColor Green
Write-Host "Restart your Next.js dev server." -ForegroundColor Cyan
