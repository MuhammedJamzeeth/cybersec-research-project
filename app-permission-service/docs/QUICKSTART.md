# Quick Start Guide

## Setup (5 minutes)

### 1. Clone and Install
```bash
cd app-permission-service
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# Copy example configuration
cp .env.example .env

# Edit .env with your settings (optional - defaults work for local dev)
```

### 3. Start the Server
```bash
# Option 1: Using uvicorn (recommended)
python -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000

# Option 2: Direct execution
cd src/api
python main.py
```

### 4. Test the API
Open your browser and navigate to:
- **API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Get Questions
```bash
GET http://localhost:8000/api/questions
```

### Submit Assessment
```bash
POST http://localhost:8000/api/submit-assessment
Content-Type: application/json

{
  "user_id": "user123",
  "answers": {
    "Question 1": "Answer A",
    "Question 2": "Answer B"
  },
  "demographics": {
    "age_group": "18-24",
    "gender": "male",
    "education_level": "undergraduate"
  }
}
```

### Get Feedback
```bash
POST http://localhost:8000/api/feedback
Content-Type: application/json

{
  "question": "What permissions should a flashlight app request?",
  "selected_answer": "Camera only",
  "correct_answer": "Camera only",
  "user_profile": {
    "age_group": "18-24",
    "gender": "male",
    "education_level": "undergraduate"
  }
}
```

## Integration Example

### React/Next.js
```typescript
// Fetch questions
const response = await fetch('http://localhost:8000/api/questions');
const questions = await response.json();

// Submit assessment
const result = await fetch('http://localhost:8000/api/submit-assessment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: userId,
    answers: userAnswers,
    demographics: userProfile
  })
});
```

See [docs/examples/example-integration.tsx](examples/example-integration.tsx) for a complete example.

## Project Structure

```
app-permission-service/
├── config/          # Configuration (settings.py)
├── data/            # Questions, explanations, datasets
├── models/          # ML model files (.pkl)
├── src/
│   ├── api/         # FastAPI application
│   ├── core/        # Business logic
│   └── utils/       # Helper modules
└── docs/            # Documentation
```

For detailed structure, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

## Development Tips

### Hot Reload
Use `--reload` flag with uvicorn for automatic server restart on code changes:
```bash
python -m uvicorn src.api.main:app --reload
```

### Custom Port
```bash
python -m uvicorn src.api.main:app --port 8080
```

### Enable CORS for Your Frontend
Edit `.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourdomain.com
```

### MongoDB Connection
The service uses MongoDB for storing assessment results. Default configuration:
```env
MONGO_URI=mongodb://localhost:27017/gamification?replicaSet=rs0
```

If MongoDB is not available, the API will still work but won't persist results.

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Import Errors
Ensure you're running from the project root:
```bash
cd app-permission-service
python -m uvicorn src.api.main:app --reload
```

### Model Files Not Found
Check that model files exist in `models/` directory:
- `app_permissions_model.pkl`
- `app_permissions_scaler.pkl`
- `app_permissions_feature_names.pkl`

### Data Files Not Found
Check that data files exist in `data/` directory:
- `answer_sheetappper.json`
- `ExplanationBankappper.json`

## Next Steps

- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Check [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed organization
- Explore [examples/](examples/) for integration samples
- Review API documentation at `/docs` endpoint

## Support

For issues or questions, please refer to:
- API documentation: http://localhost:8000/docs
- Health status: http://localhost:8000/health
- Project README: [README.md](../README.md)
