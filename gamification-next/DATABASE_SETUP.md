# Database Setup Guide

## MongoDB + Prisma Setup

This guide will help you set up MongoDB with Prisma ORM for the CyberSafe gamification application.

## Prerequisites

- Node.js 20+ installed
- pnpm installed (`npm install -g pnpm`)
- MongoDB running (local or MongoDB Atlas)

## Option 1: Local MongoDB Setup

### Windows

1. **Download MongoDB Community Server:**
   - Visit: https://www.mongodb.com/try/download/community
   - Download the MSI installer for Windows
   - Run the installer with default settings

2. **Start MongoDB Service:**
   ```powershell
   # MongoDB should start automatically as a Windows service
   # To verify:
   net start MongoDB
   ```

3. **Verify MongoDB is running:**
   ```powershell
   # Connect using MongoDB Shell
   mongosh
   ```

### Using Docker (Cross-platform)

```bash
# Pull and run MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verify it's running
docker ps
```

## Option 2: MongoDB Atlas (Cloud)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free tier M0)
4. Wait for cluster creation (~5 minutes)
5. Click "Connect" → "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database user password
8. Update your `.env` file:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gamification?retryWrites=true&w=majority
   ```

## Application Setup

### 1. Install Dependencies

```bash
cd gamification-next
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

Edit `.env` with your MongoDB connection string:

```env
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/gamification

# For MongoDB Atlas:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gamification?retryWrites=true&w=majority

PORT=3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
```

### 3. Set Up Prisma

```bash
# Generate Prisma Client
pnpm run db:generate

# Push schema to MongoDB (creates collections and indexes)
pnpm run db:push

# Or run both commands at once:
pnpm run db:setup
```

### 4. Start the Development Server

```bash
pnpm dev
```

The application will be available at http://localhost:3000

## Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
pnpm run db:generate

# Push schema changes to database
pnpm run db:push

# Open Prisma Studio (GUI for database)
pnpm run db:studio

# View database schema
pnpm exec prisma db pull
```

## Database Schema

The application uses two main collections:

### users
- `id`: ObjectId (primary key)
- `username`: String (unique)
- `email`: String (unique)
- `password`: String (hashed)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### assessments
- `id`: ObjectId (primary key)
- `userId`: ObjectId (foreign key → users)
- `categoryId`: String
- `slug`: String (category identifier)
- `answers`: Int[] (array of answer indices)
- `score`: Int (0-100)
- `completedAt`: DateTime

## Troubleshooting

### Connection Issues

**Error: "connect ECONNREFUSED"**
- MongoDB is not running
- Check if MongoDB service is started
- Verify MONGO_URI in .env is correct

**Error: "authentication failed"**
- Check username and password in MongoDB Atlas connection string
- Ensure IP address is whitelisted in Atlas (or allow 0.0.0.0/0 for development)

### SSL Certificate Issues (Corporate Networks)

**Error: "self-signed certificate in certificate chain"**

This happens when your network uses SSL inspection (common in corporate/university networks).

**Solution 1: Use the configured npm scripts (Recommended)**
```bash
# The package.json scripts are already configured with SSL bypass
pnpm run db:generate
pnpm run db:push
pnpm dev
```

**Solution 2: Manual PowerShell command**
```powershell
# Run any Prisma command with SSL bypass
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; pnpm exec prisma generate
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; pnpm exec prisma db push
```

**Solution 3: Use the helper script**
```powershell
# Run the included PowerShell script
.\prisma-ssl.ps1 pnpm exec prisma generate
```

**Important**: The `NODE_TLS_REJECT_UNAUTHORIZED=0` setting is for development only. Never use in production!

### Prisma Issues

**Error: "Prisma Client is not available"**
```bash
# Regenerate Prisma Client
pnpm run db:generate
```

**Error: "Schema engine not found"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
pnpm run db:generate
```

### MongoDB Issues

**Windows: MongoDB won't start**
```powershell
# Check service status
Get-Service MongoDB

# Start service
Start-Service MongoDB

# Or reinstall MongoDB as a service
mongod --install --config "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"
```

**Docker: Container not accessible**
```bash
# Check if container is running
docker ps

# Restart container
docker restart mongodb

# View logs
docker logs mongodb
```

## Testing the Database Connection

Create a test file `test-db.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing database connection...');
  const userCount = await prisma.user.count();
  console.log(`✓ Connected! Found ${userCount} users.`);
}

main()
  .catch((e) => console.error('✗ Connection failed:', e))
  .finally(() => prisma.$disconnect());
```

Run it:
```bash
node test-db.js
```

## Production Deployment

### Environment Variables

Set these in your hosting platform:

- `MONGO_URI`: Your MongoDB Atlas connection string
- `NEXTAUTH_SECRET`: Strong random string (generate with `openssl rand -base64 32`)
- `NODE_ENV`: production

### MongoDB Atlas Configuration

1. **IP Whitelist**: Add your hosting provider's IPs (or 0.0.0.0/0)
2. **Database User**: Create a user with read/write permissions
3. **Connection Limits**: Upgrade to M10+ for production workloads
4. **Backups**: Enable automated backups
5. **Monitoring**: Set up Atlas monitoring and alerts

### Security Checklist

- [ ] Use strong, unique NEXTAUTH_SECRET
- [ ] Restrict MongoDB network access
- [ ] Use MongoDB Atlas for production (not local)
- [ ] Enable MongoDB encryption at rest
- [ ] Set up SSL/TLS for MongoDB connection
- [ ] Regular database backups
- [ ] Monitor database performance and logs

## Next Steps

After setup:
1. Register a test user at http://localhost:3000/register
2. Complete an assessment
3. Check Prisma Studio (`pnpm run db:studio`) to see the data
4. View your profile to see saved assessments

Need help? Check the main README.md or open an issue on GitHub.
