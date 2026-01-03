# MongoDB Replica Set Setup Guide (Windows)

## Problem

Prisma requires MongoDB to run as a replica set for write operations.

## Quick Solution Steps

### Step 1: Stop MongoDB Service (Run as Administrator)

```powershell
Stop-Service -Name "MongoDB"
```

### Step 2: Edit MongoDB Config File

Open as Administrator: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`

Add these lines at the bottom:

```yaml
# Replica Set Configuration
replication:
  replSetName: rs0
```

The file should look like this:

```yaml
# mongod.conf

# Where and how to store data.
storage:
  dbPath: C:\Program Files\MongoDB\Server\7.0\data

# where to write logging data.
systemLog:
  destination: file
  logAppend: true
  path: C:\Program Files\MongoDB\Server\7.0\log\mongod.log

# network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1

# Replica Set Configuration
replication:
  replSetName: rs0
```

### Step 3: Start MongoDB Service (Run as Administrator)

```powershell
Start-Service -Name "MongoDB"
```

### Step 4: Initialize Replica Set

```powershell
# Using mongosh (MongoDB Shell)
& "C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe" --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"

# OR using legacy mongo shell
& "C:\Program Files\MongoDB\Server\7.0\bin\mongo.exe" --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

### Step 5: Verify Replica Set

```powershell
& "C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe" --eval "rs.status()"
```

You should see output showing replica set is PRIMARY.

### Step 6: Update .env.local

Make sure your connection string includes replica set:

```
MONGO_URI=mongodb://localhost:27017/gamification?replicaSet=rs0&directConnection=true
```

### Step 7: Restart Next.js Dev Server

Stop your dev server (Ctrl+C) and start it again:

```powershell
cd gamification-next
npm run dev
```

---

## Alternative: Use Docker Instead

If you prefer Docker (easier), start Docker Desktop and run:

```powershell
docker-compose up -d mongodb
.\init-mongodb-replica.ps1
```

Then restart your Next.js dev server.
