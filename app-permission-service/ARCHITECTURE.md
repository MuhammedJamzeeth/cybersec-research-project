# System Architecture Diagram

## Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GAMIFICATION PLATFORM                               │
│                         (Next.js Application)                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
         ┌──────────▼─────────┐        ┌───────────▼──────────┐
         │   Static Categories │        │  App Permissions     │
         │   (4 Categories)    │        │  Category            │
         └──────────┬─────────┘        └───────────┬──────────┘
                    │                               │
         ┌──────────▼─────────┐                    │
         │  Password Mgmt     │         ┌──────────▼──────────┐
         │  Social Media      │         │  FastAPI Client     │
         │  Safe Browsing     │         │  (appperm-client.ts)│
         │  Phishing          │         └──────────┬──────────┘
         └────────────────────┘                    │
                    │                               │
         ┌──────────▼─────────┐         ┌──────────▼──────────┐
         │  Static Questions  │         │  HTTP REST API      │
         │  (questions.ts)    │         │  Calls              │
         └────────────────────┘         └──────────┬──────────┘
                                                    │
                                         ┌──────────▼──────────┐
                                         │   FastAPI Service   │
                                         │   (Port 8000)       │
                                         └──────────┬──────────┘
                                                    │
                    ┌───────────────────────────────┼───────────────────────────────┐
                    │                               │                               │
         ┌──────────▼─────────┐        ┌───────────▼──────────┐       ┌───────────▼──────────┐
         │   Model Service    │        │   API Endpoints      │       │   Data Storage       │
         │   (service.py)     │        │   (main.py)          │       │                      │
         └──────────┬─────────┘        └───────────┬──────────┘       │  - Assessment DB     │
                    │                               │                  │  - Answer Sheet      │
         ┌──────────▼─────────┐                    │                  │  - Explanation Bank  │
         │  ML Model          │         ┌──────────▼──────────┐       │  - Feature Names     │
         │  - Loading         │         │  /api/questions     │       │  - Trained Model     │
         │  - Scoring         │         │  /api/assess        │       └──────────────────────┘
         │  - Prediction      │         │  /api/stats         │
         └────────────────────┘         │  /health            │
                                        └─────────────────────┘
```

## Data Flow

### 1. Load Questions Flow

```
User Opens "App Permissions"
         │
         ├─→ Next.js Page Loads
         │
         ├─→ useEffect Hook Triggered
         │
         ├─→ appPermClient.getQuestions()
         │
         ├─→ HTTP GET /api/questions
         │
         ├─→ FastAPI Endpoint
         │
         ├─→ service.get_questions()
         │
         ├─→ Reads answer_sheetappper.json
         │
         ├─→ Returns Questions Array
         │
         └─→ Display Questions to User
```

### 2. Submit Assessment Flow

```
User Submits Answers
         │
         ├─→ Prepare User Profile
         │
         ├─→ Prepare Answers Array
         │
         ├─→ appPermClient.submitAssessment()
         │
         ├─→ HTTP POST /api/assess
         │
         ├─→ FastAPI Endpoint
         │
         ├─→ For Each Answer:
         │   ├─→ Calculate Score (service.calculate_score)
         │   ├─→ Get Explanation (service.get_explanation)
         │   └─→ Get Enhancement Advice
         │
         ├─→ Calculate Overall Results
         │   ├─→ Total Score
         │   ├─→ Percentage
         │   └─→ Knowledge Level
         │
         ├─→ Save to Database
         │
         ├─→ Return Detailed Results
         │
         ├─→ Display Results on Next.js
         │   ├─→ Score & Percentage
         │   ├─→ Detailed Feedback
         │   └─→ Enhancement Advice
         │
         └─→ Also Save to Next.js DB
```

## File Structure

```
Desktop/UoR/
│
├── gamification-next/              # Next.js Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── categories/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx    # ← MODIFY THIS
│   │   │   └── api/
│   │   │       └── assessments/
│   │   │           └── route.ts
│   │   └── lib/
│   │       ├── questions.ts        # Static questions (other categories)
│   │       └── appperm-client.ts   # ← NEW: FastAPI client
│   ├── .env.local                  # ← ADD: NEXT_PUBLIC_APPPERM_API_URL
│   └── package.json
│
└── ModelAppPer/                    # FastAPI Service
    ├── main.py                     # FastAPI app & endpoints
    ├── models.py                   # Pydantic models
    ├── service.py                  # Business logic
    ├── requirements.txt            # Dependencies
    ├── .env                        # Configuration
    ├── start.ps1                   # Start script
    ├── test_api.py                 # Test script
    │
    ├── answer_sheetappper.json     # Questions & answers
    ├── ExplanationBankappper.json  # Personalized explanations
    ├── app_permissions_model.pkl   # Trained ML model
    │
    ├── README.md                   # Full documentation
    ├── QUICKSTART.md               # Quick start guide
    ├── INTEGRATION.md              # Integration guide
    └── SETUP-COMPLETE.md           # This summary
```

## API Request/Response Examples

### GET /api/questions

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

### POST /api/assess

**Request:**
```json
{
  "user_profile": {
    "email": "user@example.com",
    "name": "John Doe",
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
  "total_score": 85,
  "max_score": 100,
  "percentage": 85.0,
  "overall_knowledge_level": "Advanced",
  "detailed_feedback": [
    {
      "question_id": "map1",
      "score": 20,
      "level": "advanced",
      "explanation": "Excellent! You understand the importance...",
      "enhancement_advice": "Continue staying updated with best practices."
    }
  ],
  "saved_to_database": true,
  "message": "Assessment completed successfully!"
}
```

## Technology Stack

```
┌─────────────────────────────────────────────┐
│            Frontend (Next.js)                │
│  - Next.js 16                                │
│  - React 19                                  │
│  - TypeScript                                │
│  - Tailwind CSS                              │
│  - Fetch API                                 │
└──────────────┬──────────────────────────────┘
               │ HTTP REST
┌──────────────▼──────────────────────────────┐
│         Backend (FastAPI)                    │
│  - FastAPI 0.115                             │
│  - Pydantic 2.10                             │
│  - Python 3.11+                              │
│  - Uvicorn (ASGI Server)                     │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│         ML & Data Layer                      │
│  - scikit-learn 1.6                          │
│  - pandas 2.2                                │
│  - NumPy 2.2                                 │
│  - joblib 1.4                                │
│  - JSON files (data storage)                 │
└─────────────────────────────────────────────┘
```

## Deployment Topology

### Development
```
localhost:3000 (Next.js) ──→ localhost:8000 (FastAPI)
```

### Production
```
yourdomain.com (Next.js) ──→ api.yourdomain.com (FastAPI)
         │                            │
         │                            │
    Vercel/Netlify              AWS/Azure/Heroku
```

## Security Considerations

1. **CORS**: Configure allowed origins
2. **Rate Limiting**: Add to FastAPI endpoints
3. **Authentication**: Validate user tokens
4. **Input Validation**: Pydantic models handle this
5. **HTTPS**: Use in production
6. **API Keys**: Optional for additional security

## Monitoring & Logging

```python
# FastAPI automatically logs:
- Request details
- Response status
- Errors and exceptions

# Access logs at:
- Console output (development)
- Log files (production)
- Cloud monitoring (AWS CloudWatch, etc.)
```

## Performance Optimization

1. **Caching**: Cache questions response
2. **Connection Pooling**: For database connections
3. **Async Operations**: FastAPI is async by default
4. **Load Balancing**: Multiple workers in production
5. **CDN**: Serve static assets from CDN

## Version Control

```
ModelAppPer/
├── v1.0.0 (Current)
│   ├── /api/questions
│   ├── /api/assess
│   └── /api/stats
│
└── Future: v2.0.0
    ├── /api/v2/questions
    ├── /api/v2/assess
    └── /api/v2/stats
```
