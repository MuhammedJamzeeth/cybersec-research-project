# 🚀 CyberSafe Platform - Complete Developer Guide

> **A full-stack gamified cybersecurity awareness platform with ML-powered assessments**

This guide explains the entire project architecture, workflow, and how all components work together.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Complete Workflow](#complete-workflow)
6. [Setup & Installation](#setup--installation)
7. [Development Workflow](#development-workflow)
8. [API Integration](#api-integration)
9. [Database Schema](#database-schema)
10. [Authentication Flow](#authentication-flow)
11. [Assessment Flow](#assessment-flow)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**CyberSafe** is a gamified cybersecurity awareness platform that educates users through interactive assessments across five key cybersecurity topics. The platform combines:

- 🎓 **Educational Content** - Five cybersecurity domains
- 🎮 **Gamification** - Interactive games and challenges
- 🤖 **Machine Learning** - ML-powered Mobile App Permissions assessment
- 📊 **Progress Tracking** - User performance analytics
- 🏆 **Leaderboards** - Competitive learning environment

### Key Cybersecurity Topics

1. **Password Management** - Best practices for strong passwords
2. **Social Media Privacy** - Privacy settings and data protection
3. **Safe Browsing** - Identifying secure websites and practices
4. **Phishing Awareness** - Recognizing and avoiding phishing attacks
5. **Mobile App Permissions** - Understanding app permissions (ML-powered)

---

## 🏗️ Architecture

The platform follows a **microservices architecture** with two main components:

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                    (React/Next.js Frontend)                      │
└───────────────┬─────────────────────────────┬───────────────────┘
                │                             │
                │                             │
                ▼                             ▼
┌───────────────────────────────┐  ┌─────────────────────────────┐
│   GAMIFICATION-NEXT           │  │   APP-PERMISSION-SERVICE    │
│   (Next.js 16 + TypeScript)   │  │   (FastAPI + Python)        │
│                               │  │                             │
│  • Frontend UI/UX             │  │  • ML Model Service         │
│  • 4 Static Assessments       │  │  • Question Generation      │
│  • User Authentication        │  │  • Personalized Feedback    │
│  • Games & Leaderboards       │  │  • Score Calculation        │
│  • Progress Tracking          │  │  • Request Logger           │
└───────────────┬───────────────┘  └────────────┬────────────────┘
                │                               │
                │                               │
                ▼                               ▼
┌───────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                          │
│                                                                │
│  Collections:                                                  │
│  • users            - User accounts & auth                     │
│  • assessments      - Assessment results (4 topics)            │
│  • gameResults      - Game performance data                    │
│  • appperm_assessments - ML assessment results (5th topic)     │
└───────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

#### **Frontend (gamification-next)**
- User interface and experience
- Client-side routing (Next.js App Router)
- Authentication state management
- API calls to both Next.js API routes and FastAPI service
- Form validation and error handling

#### **Backend Services**

**Next.js API Routes** (`gamification-next/src/app/api/*`)
- User registration & login
- Session management
- 4 static assessments (password, social media, browsing, phishing)
- Games and leaderboard data
- Database operations via Prisma

**FastAPI Microservice** (`app-permission-service`)
- Mobile App Permissions assessment (5th topic)
- ML model inference
- Personalized feedback generation
- Separate database collection management
- Request logging and monitoring

#### **Database (MongoDB)**
- User data persistence
- Assessment results storage
- Game performance tracking
- Leaderboard data

---

## 🛠️ Technology Stack

### Frontend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.1 | React framework with App Router |
| React | 19.2.0 | UI library |
| TypeScript | Latest | Type safety |
| Tailwind CSS | v4 | Styling framework |
| shadcn/ui | Latest | Pre-built components |
| Radix UI | Latest | Accessible component primitives |
| Lucide React | Latest | Icon library |
| Prisma | Latest | Database ORM |
| bcryptjs | Latest | Password hashing |

### Backend Stack (FastAPI)
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.115.5 | Python web framework |
| Uvicorn | 0.34.0 | ASGI server |
| Pydantic | 2.10.3 | Data validation |
| scikit-learn | 1.6.0 | ML model training/inference |
| pandas | 2.2.3 | Data processing |
| pymongo | 4.10.1 | MongoDB driver |
| joblib | 1.4.2 | Model serialization |

### Database
- **MongoDB** - NoSQL database with replication support

### Development Tools
- **pnpm** - Fast package manager (frontend)
- **pip** - Python package manager (backend)
- **Git** - Version control

---

## 📁 Project Structure

```
UoR/
├── gamification-next/              # Frontend Next.js application
│   ├── src/
│   │   ├── app/                    # Next.js 16 App Router
│   │   │   ├── page.tsx            # Home page
│   │   │   ├── layout.tsx          # Root layout
│   │   │   ├── globals.css         # Global styles
│   │   │   ├── about/              # About page
│   │   │   ├── login/              # Login page
│   │   │   ├── register/           # Registration page
│   │   │   ├── dashboard/          # User dashboard
│   │   │   ├── profile/            # User profile
│   │   │   ├── categories/         # Assessment categories
│   │   │   ├── games/              # Game pages
│   │   │   └── api/                # API Routes
│   │   │       ├── auth/           # Authentication endpoints
│   │   │       │   ├── login/
│   │   │       │   ├── register/
│   │   │       │   └── user/
│   │   │       ├── assessments/    # Assessment endpoints
│   │   │       ├── games/          # Game endpoints
│   │   │       └── leaderboard/    # Leaderboard endpoint
│   │   │
│   │   ├── components/             # React components
│   │   │   ├── Header.tsx          # Site header
│   │   │   ├── Footer.tsx          # Site footer
│   │   │   ├── CategoryCard.tsx    # Category cards
│   │   │   ├── DashboardQuickView.tsx
│   │   │   └── ui/                 # shadcn/ui components
│   │   │
│   │   ├── lib/                    # Utility libraries
│   │   │   ├── prisma.ts           # Prisma client
│   │   │   ├── auth.tsx            # Auth utilities
│   │   │   ├── appperm-client.ts   # FastAPI client
│   │   │   ├── questions.ts        # Static questions
│   │   │   └── utils.ts            # Helper functions
│   │   │
│   │   └── types/                  # TypeScript types
│   │       └── index.ts
│   │
│   ├── prisma/                     # Prisma schema
│   │   └── schema.prisma           # Database models
│   │
│   ├── public/                     # Static assets
│   ├── package.json                # Dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── tailwind.config.ts          # Tailwind config
│   ├── next.config.ts              # Next.js config
│   └── README.md                   # Frontend docs
│
└── app-permission-service/         # Backend FastAPI microservice
    ├── main.py                     # FastAPI application
    ├── service.py                  # Business logic & ML service
    ├── models.py                   # Pydantic models
    ├── request_logger.py           # Morgan-style logging
    │
    ├── Data & Models/
    │   ├── mobile_app_permission.csv           # Training data
    │   ├── app_permissions_model.pkl           # Trained ML model
    │   ├── app_permissions_feature_names.pkl   # Feature names
    │   ├── answer_sheetappper.json             # Questions & weights
    │   ├── ExplanationBankappper.json          # Personalized feedback
    │   └── app_permissions_assessment_database.json  # Legacy storage
    │
    ├── Training Scripts/
    │   ├── app_permissions_model_trainer.py    # Model training
    │   ├── app_permissions_knowledge_enhancer.py
    │   ├── app_permissions_user_tester.py
    │   └── app_permissions_educational_resources.py
    │
    ├── Configuration/
    │   ├── requirements.txt        # Python dependencies
    │   ├── .env                    # Environment variables
    │   └── .env.example            # Environment template
    │
    ├── Documentation/
    │   ├── README.md               # Service documentation
    │   ├── REQUEST_LOGGER.md       # Logger documentation
    │   ├── LOGGER_QUICKSTART.md    # Logger quick start
    │   ├── LOGGER_ARCHITECTURE.md  # Logger architecture
    │   ├── ARCHITECTURE.md         # System architecture
    │   ├── INTEGRATION.md          # Integration guide
    │   └── [other docs...]
    │
    └── Tests/
        ├── test_api.py             # API tests
        ├── test_request_logger.py  # Logger tests
        └── test_submission.json    # Test data
```

---

## 🔄 Complete Workflow

### 1. **User Registration & Authentication**

```
User Action: Register/Login
    ↓
Frontend: Collect user data
    ↓
POST /api/auth/register or /api/auth/login
    ↓
Backend: Validate credentials
    ↓
Prisma: Store/fetch user data in MongoDB
    ↓
Response: JWT token + user data
    ↓
Frontend: Store auth state
    ↓
Redirect to Dashboard
```

**Files Involved:**
- Frontend: `src/app/register/page.tsx`, `src/app/login/page.tsx`
- API: `src/app/api/auth/register/route.ts`, `src/app/api/auth/login/route.ts`
- Auth Lib: `src/lib/auth.tsx`
- Database: MongoDB `users` collection

---

### 2. **Static Assessment Flow** (4 Topics)

Topics: Password, Social Media, Browsing, Phishing

```
User Action: Start Assessment
    ↓
Frontend: Fetch questions from local questions.ts
    ↓
Display Questions: Multiple choice format
    ↓
User Submits Answers
    ↓
POST /api/assessments
    ↓
Backend: Calculate score based on correct answers
    ↓
Prisma: Save to assessments collection
    ↓
Response: Score & feedback
    ↓
Frontend: Display results
```

**Files Involved:**
- Questions: `src/lib/questions.ts` (hardcoded questions)
- Assessment Page: `src/app/categories/[slug]/page.tsx`
- API: `src/app/api/assessments/route.ts`
- Database: MongoDB `assessments` collection

**Data Model:**
```typescript
{
  userId: ObjectId,
  categoryId: string,
  slug: string,
  answers: number[],     // Array of selected answer indices
  score: number,         // Calculated score
  completedAt: Date
}
```

---

### 3. **ML-Powered Assessment Flow** (Mobile App Permissions)

This is the most complex workflow involving the microservice.

```
User Action: Start Mobile App Permissions Assessment
    ↓
Frontend: Call appperm-client.ts
    ↓
GET http://localhost:8000/api/questions
    ↓
FastAPI: service.get_questions()
    ↓
Load from answer_sheetappper.json
    ↓
Response: Dynamic questions with weights
    ↓
Frontend: Display questions
    ↓
User Submits Answers + Profile
    ↓
POST http://localhost:8000/api/assess
{
  userId: string,
  answers: { question: answer },
  userProfile: {
    gender, education_level, proficiency
  }
}
    ↓
FastAPI: service.calculate_assessment()
    ↓
1. Calculate scores based on answer weights
2. Determine knowledge levels
3. Generate personalized feedback (ML-based)
4. Save to MongoDB appperm_assessments
    ↓
Response: Detailed feedback + score
    ↓
Frontend: Display personalized results
```

**Files Involved:**
- Client: `src/lib/appperm-client.ts`
- Assessment Page: `src/app/categories/mobile-app-permissions/page.tsx`
- FastAPI Main: `app-permission-service/main.py`
- Service Logic: `app-permission-service/service.py`
- Questions: `app-permission-service/answer_sheetappper.json`
- Explanations: `app-permission-service/ExplanationBankappper.json`
- ML Model: `app-permission-service/app_permissions_model.pkl`
- Database: MongoDB `appperm_assessments` collection

**Key Differences from Static Assessments:**
- Dynamic question loading from JSON
- Weight-based scoring (not just correct/incorrect)
- Personalized feedback based on user demographics
- ML model can be used for advanced predictions
- Separate microservice architecture

---

### 4. **Games Workflow**

```
User Action: Play Game
    ↓
Pre-Assessment: Test current knowledge
    ↓
Store preScore
    ↓
Play Interactive Game
    ↓
Earn gameScore based on performance
    ↓
Post-Assessment: Test improved knowledge
    ↓
Store postScore
    ↓
Calculate improvement = postScore - preScore
    ↓
POST /api/games/results
    ↓
Save to gameResults collection
    ↓
Update leaderboard
    ↓
Display results & ranking
```

**Files Involved:**
- Game Pages: `src/app/games/[category]/[gameSlug]/page.tsx`
- API: `src/app/api/games/results/route.ts`
- Leaderboard: `src/app/api/leaderboard/route.ts`
- Database: MongoDB `gameResults` collection

---

### 5. **Dashboard & Progress Tracking**

```
User Logs In
    ↓
Navigate to Dashboard
    ↓
GET /api/auth/user (fetch user data)
GET /api/assessments?userId=xxx
GET /api/games/results?userId=xxx
    ↓
Aggregate Results:
- Total assessments completed
- Average scores
- Game improvements
- Recent activity
    ↓
Display in Dashboard
```

**Files Involved:**
- Dashboard: `src/app/dashboard/page.tsx`
- Quick View: `src/components/DashboardQuickView.tsx`
- APIs: Various endpoints

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** 20+ and **pnpm**
- **Python** 3.11+
- **MongoDB** (local or Atlas)
- **Git**

### Step-by-Step Installation

#### 1. Clone Repository

```powershell
cd C:\Users\Muhammedj\Desktop\UoR
```

#### 2. Setup Frontend (gamification-next)

```powershell
cd gamification-next

# Install dependencies
pnpm install

# Setup environment
Copy-Item .env.example .env

# Edit .env
# DATABASE_URL=mongodb://localhost:27017/gamification?replicaSet=rs0
# MONGO_URI=mongodb://localhost:27017/gamification?replicaSet=rs0
# NEXT_PUBLIC_APPPERM_API_URL=http://localhost:8000

# Generate Prisma client
pnpm prisma generate

# Optional: Seed database
pnpm prisma db push
```

#### 3. Setup Backend (app-permission-service)

```powershell
cd ..\app-permission-service

# Create virtual environment (recommended)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Setup environment
Copy-Item .env.example .env

# Edit .env
# CORS_ORIGINS=http://localhost:3000
# MONGO_URI=mongodb://localhost:27017/gamification?replicaSet=rs0
# LOG_FORMAT=dev
```

#### 4. Setup MongoDB

**Option A: Local MongoDB with Replica Set**

```powershell
# Install MongoDB
# Then initialize replica set
mongod --replSet rs0 --port 27017 --dbpath C:\data\db

# In another terminal
mongosh
> rs.initiate()
```

**Option B: MongoDB Atlas**

1. Create free cluster at mongodb.com
2. Get connection string
3. Update `.env` files with your connection string

#### 5. Verify Setup

```powershell
# Check MongoDB
mongosh "mongodb://localhost:27017/gamification?replicaSet=rs0"
> show dbs
> exit

# Check Python packages
pip list

# Check Node packages
cd ..\gamification-next
pnpm list
```

---

## 💻 Development Workflow

### Starting Development Servers

**Terminal 1: MongoDB**
```powershell
# If using local MongoDB
mongod --replSet rs0 --port 27017 --dbpath C:\data\db
```

**Terminal 2: FastAPI Backend**
```powershell
cd app-permission-service
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# You'll see:
# ✅ Request logger initialized (format: dev)
# ✅ Connected to MongoDB: gamification
# ✅ All components loaded successfully
# INFO: Uvicorn running on http://0.0.0.0:8000
```

**Terminal 3: Next.js Frontend**
```powershell
cd gamification-next
pnpm dev

# You'll see:
# ✓ Ready in 1.5s
# ○ Local: http://localhost:3000
```

### Access Points

- **Frontend**: http://localhost:3000
- **FastAPI Docs**: http://localhost:8000/docs
- **FastAPI ReDoc**: http://localhost:8000/redoc
- **MongoDB**: mongodb://localhost:27017

---

## 🔌 API Integration

### Frontend ↔ Backend Communication

#### Next.js API Routes (Internal)

```typescript
// In any component
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

#### FastAPI Microservice (External)

```typescript
// Using appperm-client.ts
import { getQuestions, submitAssessment } from '@/lib/appperm-client';

// Get questions
const questions = await getQuestions();

// Submit assessment
const result = await submitAssessment(userId, answers, userProfile);
```

### Request Logger (NEW!)

All FastAPI requests are automatically logged:

```
GET /api/questions 200 45.23ms
POST /api/assess 200 234.56ms
```

**Benefits:**
- Automatic request tracking
- Performance monitoring
- Error detection
- Color-coded status

**Configuration:**
```env
# In app-permission-service/.env
LOG_FORMAT=dev      # Options: dev, combined, short, detailed
```

---

## 🗄️ Database Schema

### MongoDB Collections

#### 1. **users**
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **assessments**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  categoryId: String,
  slug: String,              // "password-management", etc.
  answers: [Number],         // Array of answer indices
  score: Number,             // Total score
  completedAt: Date
}
```

#### 3. **gameResults**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  category: String,
  gameSlug: String,
  preScore: Number,          // Score before game
  gameScore: Number,         // Score in game
  postScore: Number,         // Score after game
  improvement: Number,       // postScore - preScore
  completedAt: Date
}
```

#### 4. **appperm_assessments** (FastAPI)
```javascript
{
  _id: ObjectId,
  timestamp: String (ISO),
  user_id: String,
  user_profile: {
    email: String,
    name: String,
    gender: String,
    education_level: String,
    proficiency: String
  },
  total_score: Number,
  max_score: Number,
  percentage: Number,
  overall_knowledge_level: String,
  detailed_feedback: [{
    question_id: String,
    question_text: String,
    selected_option: String,
    score: Number,
    level: String,
    explanation: String,
    enhancement_advice: String
  }]
}
```

---

## 🔐 Authentication Flow

### Registration

```typescript
// src/app/api/auth/register/route.ts
1. Validate input (email, username, password)
2. Hash password with bcryptjs
3. Create user in MongoDB via Prisma
4. Return success message
```

### Login

```typescript
// src/app/api/auth/login/route.ts
1. Find user by email
2. Compare password hash
3. Generate session/token
4. Return user data (without password)
5. Frontend stores auth state
```

### Session Management

```typescript
// src/lib/auth.tsx
- useAuth() hook provides auth state
- AuthProvider wraps application
- Automatic redirect for protected routes
```

### Protected Routes

```typescript
// In any page that requires auth
const { user, loading } = useAuth();

if (!user && !loading) {
  redirect('/login');
}
```

---

## 📝 Assessment Flow (Detailed)

### Static Assessment (Example: Password Management)

**1. Questions Definition** (`src/lib/questions.ts`)
```typescript
{
  id: "password-management",
  title: "Password Management",
  questions: [
    {
      id: "pm-q1",
      question: "What makes a strong password?",
      options: [
        { id: 0, text: "Using your name", correct: false },
        { id: 1, text: "Mix of characters", correct: true },
        // ...
      ]
    }
  ]
}
```

**2. User Takes Assessment**
- Frontend displays questions
- User selects answers
- Frontend collects answer indices

**3. Submission** (`src/app/api/assessments/route.ts`)
```typescript
POST /api/assessments
{
  userId: "user123",
  categoryId: "password-management",
  slug: "password-management",
  answers: [1, 0, 2, 1]  // Indices of selected options
}

// Backend calculates score
const correctAnswers = answers.filter((ans, idx) => 
  ans === questions[idx].correctAnswerIndex
);
const score = (correctAnswers.length / totalQuestions) * 100;

// Save to MongoDB
await prisma.assessment.create({ ... });
```

**4. Display Results**
- Show score percentage
- Show correct/incorrect answers
- Provide explanations

---

### ML-Powered Assessment (Mobile App Permissions)

**1. Fetch Questions**
```typescript
// Frontend
const questions = await getQuestions();
// Fetches from: http://localhost:8000/api/questions
```

**2. Backend Question Loading** (`service.py`)
```python
def get_questions(self):
    # Load from answer_sheetappper.json
    # Each question has weighted options
    return [
        {
            "id": "q1",
            "question": "What permission allows camera access?",
            "options": [
                {"text": "CAMERA", "weight": 10, "level": "Expert"},
                {"text": "MEDIA", "weight": 5, "level": "Intermediate"},
                // ...
            ]
        }
    ]
```

**3. User Submits with Profile**
```typescript
POST http://localhost:8000/api/assess
{
  userId: "user123",
  answers: {
    "What permission allows camera access?": "CAMERA"
  },
  userProfile: {
    email: "user@example.com",
    name: "John",
    gender: "Male",
    education_level: "Degree",
    proficiency: "High Education"
  }
}
```

**4. Backend Processing** (`service.py`)
```python
def calculate_assessment(submission):
    # 1. Score each answer based on weights
    for question, answer in answers.items():
        weight = answer_sheet[question][answer]['weight']
        level = answer_sheet[question][answer]['level']
        total_score += weight
    
    # 2. Generate personalized feedback
    for each answer:
        explanation = find_matching_explanation(
            question, answer, user_profile
        )
    
    # 3. Determine overall knowledge level
    percentage = (total_score / max_score) * 100
    level = determine_level(percentage)
    
    # 4. Save to MongoDB
    save_to_mongodb(result)
    
    return detailed_result
```

**5. Personalized Feedback**

The system matches explanations from `ExplanationBankappper.json` based on:
- User's education level
- User's proficiency
- Specific answer selected
- Question topic

Example:
```json
{
  "question": "Camera permission question",
  "option": "CAMERA",
  "education_level": "Degree",
  "proficiency": "High Education",
  "explanation": "Excellent! CAMERA permission allows direct access...",
  "enhancement": "Consider learning about runtime permissions..."
}
```

---

## 🎮 Games Workflow

### Game Structure

Each game follows a three-phase approach:

**Phase 1: Pre-Assessment**
- Tests current knowledge
- Establishes baseline score

**Phase 2: Interactive Game**
- Educational gameplay
- Earns game score

**Phase 3: Post-Assessment**
- Tests improved knowledge
- Calculates improvement

### Implementation

```typescript
// src/app/games/[category]/[gameSlug]/page.tsx

const [phase, setPhase] = useState('pre');
const [preScore, setPreScore] = useState(0);
const [gameScore, setGameScore] = useState(0);
const [postScore, setPostScore] = useState(0);

// Submit results
await fetch('/api/games/results', {
  method: 'POST',
  body: JSON.stringify({
    userId,
    category,
    gameSlug,
    preScore,
    gameScore,
    postScore,
    improvement: postScore - preScore
  })
});
```

---

## 🚢 Deployment

### Frontend (Vercel Recommended)

```powershell
# Build
cd gamification-next
pnpm build

# Deploy to Vercel
vercel deploy

# Set environment variables in Vercel dashboard
```

### Backend (Railway/Render/AWS)

```powershell
# Prepare for deployment
cd app-permission-service

# Create Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port $PORT" > Procfile

# Deploy to platform
# Configure environment variables
```

### Database (MongoDB Atlas)

1. Create cluster
2. Get connection string
3. Update `.env` files
4. Configure network access

---

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error:** `MongoNetworkError: connect ECONNREFUSED`

**Solution:**
```powershell
# Start MongoDB with replica set
mongod --replSet rs0 --port 27017 --dbpath C:\data\db

# In another terminal, initialize
mongosh
> rs.initiate()
```

#### 2. FastAPI Not Starting

**Error:** `ModuleNotFoundError`

**Solution:**
```powershell
# Activate virtual environment
cd app-permission-service
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt
```

#### 3. Next.js Build Errors

**Error:** `Module not found`

**Solution:**
```powershell
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

#### 4. CORS Issues

**Error:** `Access-Control-Allow-Origin`

**Solution:**
```python
# In app-permission-service/main.py
# Update CORS_ORIGINS in .env
CORS_ORIGINS=http://localhost:3000,http://your-domain.com
```

#### 5. Prisma Issues

**Error:** `Prisma Client not generated`

**Solution:**
```powershell
cd gamification-next
pnpm prisma generate
pnpm prisma db push
```

---

## 📚 Additional Resources

### Documentation Files

- **Frontend:** `gamification-next/README.md`
- **Backend:** `app-permission-service/README.md`
- **Request Logger:** `app-permission-service/REQUEST_LOGGER.md`
- **Architecture:** `app-permission-service/ARCHITECTURE.md`
- **Integration:** `app-permission-service/INTEGRATION.md`

### API Documentation

- **FastAPI Swagger:** http://localhost:8000/docs
- **FastAPI ReDoc:** http://localhost:8000/redoc

### Testing

```powershell
# Test FastAPI endpoints
cd app-permission-service
python test_api.py

# Test request logger
python test_request_logger.py

# Test frontend
cd gamification-next
pnpm test  # If tests are configured
```

---

## 🎯 Development Best Practices

### 1. **Code Organization**
- Keep components small and focused
- Use TypeScript for type safety
- Follow Next.js App Router conventions

### 2. **API Design**
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return consistent response formats
- Include proper error handling

### 3. **Database**
- Use Prisma for type-safe queries
- Create indexes for frequently queried fields
- Keep schemas normalized

### 4. **Security**
- Never commit `.env` files
- Hash passwords before storing
- Validate all user input
- Use HTTPS in production

### 5. **Performance**
- Use Next.js Image component for images
- Implement proper loading states
- Cache API responses when appropriate
- Monitor request logs for slow endpoints

### 6. **Testing**
- Write unit tests for utility functions
- Test API endpoints thoroughly
- Test UI components with user interactions

---

## 🤝 Contributing

### Development Process

1. **Create Feature Branch**
```powershell
git checkout -b feature/your-feature-name
```

2. **Make Changes**
- Follow code style
- Add comments for complex logic
- Update documentation

3. **Test Changes**
- Test locally
- Check for errors
- Verify all features work

4. **Commit**
```powershell
git add .
git commit -m "feat: add your feature description"
```

5. **Push & PR**
```powershell
git push origin feature/your-feature-name
# Create pull request on GitHub
```

---

## 📞 Support

For questions or issues:
- Check documentation in respective README files
- Review code comments
- Check API documentation at `/docs`
- Review request logs for debugging

---

## 🎉 Quick Start Checklist

- [ ] Install Node.js 20+, Python 3.11+, MongoDB
- [ ] Clone repository
- [ ] Install frontend dependencies (`pnpm install`)
- [ ] Install backend dependencies (`pip install -r requirements.txt`)
- [ ] Setup environment variables (`.env` files)
- [ ] Start MongoDB with replica set
- [ ] Start FastAPI backend (`uvicorn main:app --reload`)
- [ ] Start Next.js frontend (`pnpm dev`)
- [ ] Access http://localhost:3000
- [ ] Register a new user
- [ ] Test an assessment
- [ ] Check request logs in FastAPI terminal

---

**Last Updated:** November 14, 2025
**Version:** 1.0.0
**Maintainer:** Development Team

---

## 📖 Summary

This platform combines modern web technologies with machine learning to create an engaging cybersecurity education experience. The microservices architecture allows for scalability and maintainability, while the ML-powered assessment provides personalized learning experiences.

**Key Takeaways:**
- Frontend handles UI and 4 static assessments
- FastAPI microservice powers ML-based Mobile App Permissions assessment
- MongoDB stores all user and assessment data
- Request logger provides real-time monitoring
- Modular design allows easy addition of new features

Happy developing! 🚀
