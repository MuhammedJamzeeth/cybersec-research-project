@echo off
echo ========================================
echo MongoDB Replica Set Setup (Run as Admin)
echo ========================================
echo.

:: Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script requires Administrator privileges!
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

echo [1/5] Stopping MongoDB service...
net stop MongoDB

echo.
echo [2/5] Backing up config file...
copy "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg" "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg.backup"

echo.
echo [3/5] Adding replica set configuration...
echo. >> "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"
echo replication: >> "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"
echo   replSetName: rs0 >> "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"

echo.
echo [4/5] Starting MongoDB service...
net start MongoDB

echo.
echo [5/5] Waiting 5 seconds for MongoDB to start...
timeout /t 5 /nobreak

echo.
echo Initializing replica set...
mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"

echo.
echo ========================================
echo DONE! MongoDB is now a replica set.
echo Restart your Next.js dev server.
echo ========================================
pause
