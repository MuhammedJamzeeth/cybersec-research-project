# Quick Access URLs

## 🌐 Frontend

**Main Application**: http://localhost:3000

## 🔧 Backend Services

### Health Checks

- App Permissions: http://localhost:8000/health
- Phishing Detection: http://localhost:8001/health
- Password Security: http://localhost:8002/health
- Social Engineering: http://localhost:8003/health
- Device Security: http://localhost:8004/health

### API Documentation (Swagger UI)

- App Permissions: http://localhost:8000/docs
- Phishing Detection: http://localhost:8001/docs
- Password Security: http://localhost:8002/docs
- Social Engineering: http://localhost:8003/docs
- Device Security: http://localhost:8004/docs

### API Endpoints

#### Common Endpoints (available on all services)

- `GET /health` - Health check
- `GET /api/questions` - Get assessment questions
- `POST /api/assess` - Submit assessment answers

#### Example API Usage

**Get Questions:**

```bash
curl http://localhost:8000/api/questions
```

**Submit Assessment:**

```bash
curl -X POST http://localhost:8000/api/assess \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "responses": {
      "Q1": "Option A",
      "Q2": "Option B"
    }
  }'
```

## 💾 Database

**MongoDB**: localhost:27017
**Database Name**: gamification

### MongoDB Connection String

```
mongodb://localhost:27017/gamification
```

---

## 🎮 Service Categories

1. **App Permissions** (Port 8000)

   - Mobile app permission awareness
   - Data collection: `app-permission-service/data/`

2. **Phishing Detection** (Port 8001)

   - Email and phishing awareness
   - Data collection: `phishing-detection-service/data/`

3. **Password Security** (Port 8002)

   - Password strength and best practices
   - Data collection: `password-security-service/data/`

4. **Social Engineering** (Port 8003)

   - Social engineering attack awareness
   - Data collection: `social-engineering-service/data/`

5. **Device Security** (Port 8004)
   - Device protection and security
   - Data collection: `device-security-service/data/`

---

## 🚀 Quick Commands

### Start Everything

```powershell
docker-compose up -d
```

### Stop Everything

```powershell
docker-compose down
```

### View All Services

```powershell
docker-compose ps
```

### View Logs (all services)

```powershell
docker-compose logs -f
```

### View Logs (specific service)

```powershell
docker logs -f <service-name>
```

---

## ✅ Verification Checklist

- [ ] Frontend loads at http://localhost:3000
- [ ] All 5 backend health checks return 200 OK
- [ ] MongoDB is accessible at localhost:27017
- [ ] API docs are accessible at each /docs endpoint
- [ ] No containers in "restarting" state

**Current Status**: ✅ ALL SYSTEMS OPERATIONAL
