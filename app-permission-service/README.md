# Mobile App Permissions Assessment API

A FastAPI microservice for mobile app permissions security assessment with **ML-powered awareness prediction** and **demographically personalized feedback**.

## 🌟 Key Features

- 🤖 **ML-Powered Predictions**: LogisticRegression model predicts user awareness levels (Low/Moderate/High) with confidence scores
- 👥 **Demographic Personalization**: 480 unique explanations tailored to:
  - **Gender** (Male/Female)
  - **Education Level** (O/L, A/L, HND, Degree)
  - **IT Proficiency** (School, High)
- 🎯 **Dynamic Question Generation**: 10 questions from trained ML model data
- 📊 **Comprehensive Assessment**: Rule-based scoring + ML-based awareness analysis
- 💡 **Personalized Recommendations**: Learning paths adapted to user profile and ML predictions
- 🔄 **Easy Integration**: RESTful API with full CORS support
- 📚 **Auto Documentation**: Interactive API docs with Swagger UI
- 💾 **MongoDB Integration**: Stores full assessment results with demographics

## Architecture

```
app-permission-service/
├── config/                          # Configuration management
│   └── settings.py                  # Centralized settings
├── data/                            # Data files and datasets
│   ├── answer_sheetappper.json      # Questions & scoring weights
│   ├── ExplanationBankappper.json   # Personalized explanations
│   └── mobile_app_permission.csv    # Training dataset
├── docs/                            # Documentation
│   ├── examples/                    # Integration examples
│   ├── images/                      # Visualizations
│   └── PROJECT_STRUCTURE.md         # Detailed structure guide
├── models/                          # ML model artifacts
│   ├── app_permissions_model.pkl
│   ├── app_permissions_scaler.pkl
│   └── app_permissions_feature_names.pkl
├── src/                             # Source code
│   ├── api/                         # API layer
│   │   ├── main.py                  # FastAPI application
│   │   └── models.py                # Pydantic models
│   ├── core/                        # Business logic
│   │   └── service.py               # ML model service
│   └── utils/                       # Utility modules
├── tests/                           # Test files
├── .env                             # Environment configuration
├── .env.example                     # Example configuration
└── requirements.txt                 # Python dependencies
```

For detailed structure documentation, see [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

## Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` to match your setup:

```env
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
MONGO_URI=mongodb://localhost:27017/gamification?replicaSet=rs0
```

### 3. Verify Required Files

The project includes all necessary files in organized directories:
- `models/` - Pre-trained ML models
- `data/` - Questions, explanations, and datasets
- `config/` - Configuration management

## Running the API

### Development Mode

```bash
# From project root
python -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

Or using the direct approach:

```bash
cd src/api
python main.py
```

### Production Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### 1. Health Check

```http
GET /health
```

Check API and component status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-13T10:30:00",
  "model_loaded": true,
  "components_status": {
    "model_loaded": true,
    "answer_sheet_loaded": true,
    "questions_loaded": true,
    "explanation_bank_loaded": true
  }
}
```

### 2. Get Questions

```http
GET /api/questions
```

Retrieve all assessment questions.

**Response:**
```json
[
  {
    "id": "map1",
    "question": "Why should you review app permissions?",
    "options": [
      {
        "text": "It's not necessary",
        "weight": 0,
        "level": "wrong"
      },
      {
        "text": "To ensure apps only access what they need",
        "weight": 20,
        "level": "advanced"
      }
    ],
    "category": "App Permissions"
  }
]
```

### 3. Submit Assessment

```http
POST /api/assess
Content-Type: application/json
```

Submit answers and get results with personalized feedback.

**Request Body:**
```json
{
  "user_profile": {
    "email": "user@example.com",
    "name": "John Doe",
    "organization": "UOR",
    "gender": "Male",
    "education_level": "Degree",
    "proficiency": "High Education"
  },
  "answers": [
    {
      "question_id": "map1",
      "question_text": "Why should you review app permissions?",
      "selected_option": "To ensure apps only access what they need",
      "selected_option_index": 1
    }
  ]
}
```

**Response:**
```json
{
  "timestamp": "2025-11-13T10:30:00",
  "user_profile": { ... },
  "total_score": 85,
  "max_score": 100,
  "percentage": 85.0,
  "overall_knowledge_level": "Advanced",
  "detailed_feedback": [
    {
      "question_id": "map1",
      "question_text": "Why should you review app permissions?",
      "selected_option": "To ensure apps only access what they need",
      "score": 20,
      "level": "advanced",
      "explanation": "Excellent! You understand...",
      "enhancement_advice": "Stay updated with latest mobile security best practices."
    }
  ],
  "saved_to_database": true,
  "message": "Assessment completed successfully!"
}
```

### 4. Get Statistics

```http
GET /api/stats
```

Get aggregated assessment statistics.

**Response:**
```json
{
  "total_assessments": 150,
  "average_score": 68.5,
  "level_distribution": {
    "Beginner": 20,
    "Basic": 45,
    "Intermediate": 60,
    "Advanced": 25
  },
  "message": "Statistics retrieved successfully"
}
```

## Integration with Next.js Frontend

### Example: Fetching Questions

```typescript
// In your Next.js API route or component
const API_URL = 'http://localhost:8000';

async function getQuestions() {
  const response = await fetch(`${API_URL}/api/questions`);
  const questions = await response.json();
  return questions;
}
```

### Example: Submitting Assessment

```typescript
async function submitAssessment(userProfile, answers) {
  const response = await fetch(`${API_URL}/api/assess`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_profile: userProfile,
      answers: answers,
    }),
  });
  
  const result = await response.json();
  return result;
}
```

## Data Models

### User Profile
```typescript
{
  email: string;
  name: string;
  organization?: string;
  gender: "Male" | "Female";
  education_level: "O/L" | "A/L" | "HND" | "Degree";
  proficiency: "School" | "High Education";
}
```

### Knowledge Levels
- **Beginner**: < 40%
- **Basic**: 40-59%
- **Intermediate**: 60-79%
- **Advanced**: 80%+

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error
- `503`: Service Unavailable

Error response format:
```json
{
  "detail": "Error message description"
}
```

## Testing

### Manual Testing

1. Open interactive docs: http://localhost:8000/docs
2. Test each endpoint using the Swagger UI
3. View responses and schemas

### Using cURL

```bash
# Health check
curl http://localhost:8000/health

# Get questions
curl http://localhost:8000/api/questions

# Submit assessment
curl -X POST http://localhost:8000/api/assess \
  -H "Content-Type: application/json" \
  -d @test_submission.json
```

## Troubleshooting

### Model Not Loading

Ensure `app_permissions_model.pkl` exists and was trained with compatible scikit-learn version.

### CORS Issues

Add your frontend URL to `CORS_ORIGINS` in `.env`:

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Port Already in Use

Change port in `.env` or command:

```bash
uvicorn main:app --port 8001
```

## Development

### Adding New Features

1. Add models in `models.py`
2. Add business logic in `service.py`
3. Add endpoints in `main.py`

### Hot Reload

Development mode automatically reloads on file changes:

```bash
python main.py
```

## Production Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## License

MIT

## Support

For issues or questions, please contact the development team.

python -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000

ython -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
