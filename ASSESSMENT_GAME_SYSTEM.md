# Assessment-Game-Retake System Integration Guide

## Overview

This system implements a complete learning loop:
1. **Take Assessment** → Measure initial knowledge
2. **Get Recommendations** → ML-powered game suggestions based on weak areas
3. **Play Games** → Improve knowledge through gamification
4. **Retake Assessment** → Measure improvement
5. **Track Progress** → Visualize learning journey

## System Architecture

```
┌─────────────────┐
│  User Takes     │
│  Assessment     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ML Model       │◄──── User Profile (gender, education, proficiency)
│  Analyzes       │
│  Results        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate        │
│ • Score         │
│ • Weak Areas    │
│ • ML Level      │
│ • Recommendations│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Recommend       │
│ Targeted Games  │
│ (Based on       │
│  weak areas)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Plays      │
│ 3+ Games        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Suggest Retake  │
│ Assessment      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Calculate       │
│ Improvement     │
│ • Score Delta   │
│ • Knowledge ↑   │
│ • Visualize     │
└─────────────────┘
```

## Database Schema

### Assessment Model (Enhanced)
```prisma
model Assessment {
  id                    String   @id @default(auto())
  userId                String
  categoryId            String
  slug                  String
  answers               Int[]
  score                 Int
  percentage            Float
  knowledgeLevel        String      // Beginner, Intermediate, Advanced
  weakAreas             String[]    // Categories where user scored low
  recommendedGames      String[]    // Game slugs recommended
  attemptNumber         Int         // 1, 2, 3, etc.
  previousAttemptId     String?     // Link to previous attempt
  previousScore         Int?
  improvement           Float?      // % improvement from previous
  mlRecommendations     String[]    // ML model suggestions
  mlAwarenessLevel      String?     // ML predicted level
  mlConfidence          Float?      // ML confidence score
  detailedFeedback      Json?       // Full feedback data
  completedAt           DateTime
}
```

## API Endpoints

### 1. Get Recommendations
**Endpoint:** `GET /api/recommendations?userId={id}&category={slug}`

**Response:**
```json
{
  "assessmentId": "...",
  "score": 85,
  "percentage": 85.5,
  "knowledgeLevel": "Intermediate",
  "weakAreas": ["location", "storage"],
  "recommendations": [
    {
      "gameSlug": "privacy-guardian",
      "gameName": "Privacy Guardian",
      "category": "location",
      "reason": "Practice making decisions about location permissions",
      "priority": 1,
      "estimatedImpact": "high"
    }
  ]
}
```

### 2. Get Improvement Data
**Endpoint:** `GET /api/assessments/improvement?userId={id}&category={slug}`

**Response:**
```json
{
  "totalAttempts": 3,
  "firstAttempt": {
    "score": 65,
    "percentage": 65.0,
    "date": "2025-11-20T10:00:00Z"
  },
  "latestAttempt": {
    "score": 85,
    "percentage": 85.0,
    "date": "2025-11-24T10:00:00Z",
    "weakAreas": ["contacts"]
  },
  "totalImprovement": 20.0,
  "improvementPercentage": 30.77,
  "improvementData": [
    {
      "attemptNumber": 1,
      "score": 65,
      "percentage": 65.0,
      "improvement": 0
    },
    {
      "attemptNumber": 2,
      "score": 75,
      "percentage": 75.0,
      "improvement": 10.0
    }
  ],
  "canRetake": true
}
```

### 3. Submit Retake Assessment
**Endpoint:** `POST /api/assessments/improvement`

**Request:**
```json
{
  "userId": "...",
  "categorySlug": "location",
  "score": 85,
  "percentage": 85.0,
  "knowledgeLevel": "Intermediate",
  "weakAreas": ["contacts"],
  "answers": [0, 1, 2, ...],
  "mlData": {
    "recommendations": ["Focus on contact permissions"],
    "awarenessLevel": "Moderate Awareness",
    "confidence": 0.85,
    "detailedFeedback": {...}
  }
}
```

**Response:**
```json
{
  "success": true,
  "attemptNumber": 2,
  "improvement": 10.0,
  "hasImproved": true,
  "significantImprovement": true,
  "message": "Great job! You improved by 10%",
  "previousScore": 75.0,
  "currentScore": 85.0
}
```

### 4. ML Game Recommendations
**Endpoint:** `POST http://localhost:8000/api/game-recommendations`

**Request:**
```json
{
  "detailed_feedback": [...],
  "user_profile": {
    "email": "user@example.com",
    "name": "John Doe",
    "gender": "Male",
    "education_level": "Degree",
    "proficiency": "High Education"
  },
  "ml_awareness_level": "Moderate Awareness",
  "weak_areas": ["location", "storage"]
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "category": "location",
      "priority": "high",
      "reason": "Strengthen your location permission knowledge",
      "estimated_improvement": "15-25%",
      "ml_confidence": 0.85
    }
  ],
  "learning_path": {
    "current_level": "Moderate Awareness",
    "target_level": "High Awareness",
    "estimated_games_needed": 4,
    "estimated_time_hours": 3.0,
    "phases": [
      {
        "phase": 1,
        "focus": "Address weak areas",
        "games": 2
      }
    ]
  },
  "weak_areas": ["location", "storage"],
  "ml_personalized": true
}
```

## React Component Usage

### Basic Usage
```tsx
import AssessmentRecommendations from '@/components/AssessmentRecommendations';

function AssessmentResultsPage() {
  const userId = "user123";
  const categorySlug = "location";
  
  return (
    <AssessmentRecommendations
      userId={userId}
      categorySlug={categorySlug}
      showImprovement={true}
    />
  );
}
```

### Integration with Assessment Submission

```tsx
import { appPermClient } from '@/lib/appperm-client';

async function handleAssessmentSubmit() {
  // 1. Submit to ML service
  const mlResult = await appPermClient.submitAssessment(
    userProfile,
    answers
  );
  
  // 2. Save to database with ML data
  const dbResponse = await fetch('/api/assessments/improvement', {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id,
      categorySlug: category,
      score: mlResult.total_score,
      percentage: mlResult.percentage,
      knowledgeLevel: mlResult.overall_knowledge_level,
      weakAreas: extractWeakAreas(mlResult.detailed_feedback),
      answers: answers.map(a => a.selected_option_index),
      mlData: {
        recommendations: mlResult.ml_recommendations,
        awarenessLevel: mlResult.ml_awareness_level,
        confidence: mlResult.ml_confidence,
        detailedFeedback: mlResult.detailed_feedback
      }
    })
  });
  
  // 3. Get ML-powered game recommendations
  const mlRecs = await appPermClient.getMLGameRecommendations({
    detailed_feedback: mlResult.detailed_feedback,
    user_profile: userProfile,
    ml_awareness_level: mlResult.ml_awareness_level,
    weak_areas: extractWeakAreas(mlResult.detailed_feedback)
  });
  
  // 4. Show results with recommendations
  router.push(`/assessment-results?showRecommendations=true`);
}
```

## ML Model Integration

The ML model provides:

### 1. **Awareness Level Prediction**
- Uses trained model to predict: Low/Moderate/High Awareness
- Based on answer patterns and user profile
- Confidence score included

### 2. **Personalized Explanations**
- Tailored to user's:
  - Gender (Male/Female)
  - Education Level (O/L, A/L, HND, Degree)
  - Proficiency (School, High Education)
- Adjusts technical depth and examples

### 3. **Game Recommendations**
- Analyzes weak areas from assessment
- Considers user profile for personalization
- Suggests learning path with phases
- Estimates improvement potential

### 4. **Progress Tracking**
- Compares attempts over time
- Calculates improvement metrics
- Identifies persistent weak areas
- Suggests targeted interventions

## User Flow Example

### Scenario: New User "Sarah"

1. **Initial Assessment (Attempt 1)**
   - Sarah takes the assessment
   - Score: 60% (Beginner)
   - Weak areas: Location, Storage
   - ML: "Low Awareness" (confidence: 0.88)

2. **Recommendations Generated**
   ```
   Priority Games:
   1. Privacy Guardian (Location) - High Impact
   2. Data Vault Challenge (Storage) - High Impact
   3. Permission Master (General) - Medium Impact
   ```

3. **Sarah Plays Games**
   - Plays Privacy Guardian (30 min)
   - Plays Data Vault Challenge (25 min)
   - Plays Permission Defender (20 min)
   - Total: 3 games, 75 minutes

4. **Retake Assessment (Attempt 2)**
   - Sarah retakes after playing
   - Score: 78% (Intermediate)
   - Improvement: +18%
   - ML: "Moderate Awareness" (confidence: 0.82)
   - Remaining weak area: Contacts

5. **Updated Recommendations**
   ```
   Priority Games:
   1. Contact Protector (Contacts) - High Impact
   2. Permission Master Advanced - Medium Impact
   ```

6. **Continued Progress (Attempt 3)**
   - Score: 88% (Advanced)
   - Total Improvement: +28%
   - ML: "High Awareness" (confidence: 0.90)
   - Achievement Unlocked! 🎉

## Best Practices

### 1. **Retake Cooldown**
- Implement minimum wait time (e.g., 1 hour)
- Encourage playing 3+ games before retaking
- Prevents gaming the system

### 2. **Progress Visualization**
- Show improvement charts
- Display learning path progress
- Celebrate milestones

### 3. **Adaptive Recommendations**
- Update after each game played
- Filter out completed games
- Adjust based on improvement rate

### 4. **ML Model Usage**
- Always send user profile for personalization
- Store ML predictions for analysis
- Use confidence scores to filter recommendations

### 5. **Weak Area Detection**
- Threshold: < 60% on question = weak
- Group by permission category
- Track improvement per category

## Testing the System

### 1. Update Database Schema
```bash
cd gamification-next
npx prisma generate
npx prisma db push
```

### 2. Start Services
```bash
# Terminal 1: Start ML Service
cd app-permission-service
python -m uvicorn src.api.main:app --reload --port 8000

# Terminal 2: Start Next.js
cd gamification-next
pnpm dev
```

### 3. Test Flow
1. Navigate to category assessment
2. Complete assessment
3. View recommendations
4. Play suggested games
5. Return and retake assessment
6. View improvement metrics

## Environment Variables

```env
# gamification-next/.env.local
NEXT_PUBLIC_APPPERM_API_URL=http://localhost:8000
MONGO_URI=mongodb://localhost:27017/gamification

# app-permission-service/.env
PORT=8000
HOST=0.0.0.0
LOG_FORMAT=dev
CORS_ORIGINS=http://localhost:3000
```

## Future Enhancements

1. **Adaptive Learning**
   - Dynamic difficulty adjustment
   - Spaced repetition scheduling
   - Personalized learning curves

2. **Social Features**
   - Compare improvement with peers
   - Share achievements
   - Leaderboards by improvement rate

3. **Advanced ML**
   - Predict optimal game sequence
   - Estimate time to proficiency
   - Identify learning patterns

4. **Gamification**
   - Badges for improvement milestones
   - Streak tracking for retakes
   - Unlock advanced games with progress

## Support

For issues or questions:
- Check API health: `GET http://localhost:8000/health`
- View API docs: `http://localhost:8000/docs`
- Test ML endpoint: Use provided examples
