# ML-Powered Recommendations System

## Overview

The system uses a **Machine Learning model** trained on app permissions assessment data to provide personalized learning experiences. The ML model integrates with the game recommendation and improvement tracking system.

## ML Model Capabilities

### 1. **Awareness Level Prediction**

The ML model predicts user awareness level based on:
- **Answer patterns** across all questions
- **User profile** (education level, proficiency, gender)
- **Historical performance** (if retaking)

**Output Levels:**
- `Low Awareness` - Beginner level understanding
- `Moderate Awareness` - Intermediate knowledge
- `High Awareness` - Advanced security consciousness

**Example:**
```json
{
  "ml_awareness_level": "Moderate Awareness",
  "ml_confidence": 0.87
}
```

### 2. **Personalized Explanations**

Explanations are tailored based on:

#### **Education Level**
- **O/L (Ordinary Level)**: Simple, non-technical language
- **A/L (Advanced Level)**: Moderate technical depth
- **HND**: Practical, industry-focused examples
- **Degree**: Advanced technical concepts

#### **Proficiency**
- **School**: Visual examples, simple analogies
- **High Education**: Technical depth, professional scenarios

#### **Gender**
- Uses inclusive examples that resonate with all users
- Adjusts tone and context appropriately

**Example Explanation Adaptation:**

For the same wrong answer:

**School-level user:**
```
"This permission could let the app track where you go. Think about 
sharing your location like telling a stranger where you live - 
only do it when really necessary!"
```

**Degree-level user:**
```
"Granting location access without runtime permission checks creates 
a persistent tracking vector. Implement principle of least privilege 
and request permissions contextually."
```

### 3. **Game Recommendations**

ML analyzes assessment results to suggest targeted games:

#### **Priority System**
```
Priority 1 (High Impact):
- Games targeting primary weak areas
- Estimated improvement: 15-25%
- ML Confidence: 0.85+

Priority 2 (Medium Impact):
- Games for secondary weak areas
- Estimated improvement: 10-15%
- ML Confidence: 0.75+

Priority 3 (Personalized):
- ML-specific recommendations
- Based on learning patterns
- ML Confidence: varies
```

#### **Weak Area Detection**

The system identifies weak areas using:
```typescript
// Questions scoring < 60% are flagged
const isWeak = (score / maxScore) < 0.6;

// Categories are extracted from question text
const category = extractCategory(questionText);
```

**Categories Detected:**
- Location permissions
- Storage/File access
- Camera permissions
- Contacts access
- Microphone/Audio
- Calendar, SMS, Phone
- Sensors & Biometrics
- Notifications

### 4. **Learning Path Generation**

ML creates a phased learning approach:

```json
{
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
      },
      {
        "phase": 2,
        "focus": "Consolidate knowledge",
        "games": 1
      },
      {
        "phase": 3,
        "focus": "Advanced scenarios",
        "games": 1
      }
    ]
  }
}
```

## API Integration

### Submitting Assessment to ML Service

```typescript
import { appPermClient } from '@/lib/appperm-client';

const result = await appPermClient.submitAssessment(
  {
    email: "user@example.com",
    name: "John Doe",
    gender: "Male",
    education_level: "Degree",
    proficiency: "High Education",
    organization: "University"
  },
  [
    {
      question_id: "Q1",
      question_text: "When should you grant location access?",
      selected_option: "Only when the app needs it for core functionality",
      selected_option_index: 1
    }
    // ... more answers
  ]
);

// Result includes:
result.ml_awareness_level;      // "Moderate Awareness"
result.ml_confidence;            // 0.87
result.ml_recommendations;       // Array of suggestions
result.detailed_feedback;        // Per-question feedback
```

### Getting ML Game Recommendations

```typescript
const mlRecs = await appPermClient.getMLGameRecommendations({
  detailed_feedback: result.detailed_feedback,
  user_profile: {
    email: "user@example.com",
    name: "John Doe",
    gender: "Male",
    education_level: "Degree",
    proficiency: "High Education"
  },
  ml_awareness_level: result.ml_awareness_level,
  weak_areas: ["location", "storage"]
});

// Response:
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
  "learning_path": { ... },
  "weak_areas": ["location", "storage"],
  "ml_personalized": true
}
```

## Improvement Tracking with ML

### Measuring Knowledge Growth

```typescript
// After user plays games and retakes assessment
const improvementData = await fetch(
  `/api/assessments/improvement?userId=${userId}&category=${category}`
).then(r => r.json());

// Returns:
{
  "totalAttempts": 2,
  "totalImprovement": 15.5,  // % improvement
  "firstAttempt": {
    "percentage": 65.0,
    "knowledgeLevel": "Beginner"
  },
  "latestAttempt": {
    "percentage": 80.5,
    "knowledgeLevel": "Intermediate"
  },
  "improvementData": [
    {
      "attemptNumber": 1,
      "percentage": 65.0,
      "improvement": 0
    },
    {
      "attemptNumber": 2,
      "percentage": 80.5,
      "improvement": 15.5,  // ML helped achieve this!
    }
  ]
}
```

## ML Recommendation Algorithm

### How It Works

```python
# In app-permission-service/src/api/main.py

@app.post("/api/game-recommendations")
async def get_game_recommendations(data: dict):
    # 1. Extract weak areas from feedback
    weak_areas = analyze_feedback(data['detailed_feedback'])
    
    # 2. Consider user profile
    education = data['user_profile']['education_level']
    proficiency = data['user_profile']['proficiency']
    
    # 3. Use ML awareness level
    ml_level = data['ml_awareness_level']
    
    # 4. Generate priority recommendations
    recommendations = []
    
    # Priority 1: Address weak areas
    for area in weak_areas:
        recommendations.append({
            'category': area,
            'priority': 'high',
            'reason': f'Strengthen your {area} knowledge',
            'estimated_improvement': '15-25%',
            'ml_confidence': 0.85
        })
    
    # Priority 2: Level-appropriate challenges
    if ml_level == 'Low Awareness':
        recommendations.append({
            'category': 'fundamentals',
            'priority': 'high',
            'reason': 'Build foundation in security basics',
            'estimated_improvement': '20-30%'
        })
    elif ml_level == 'Moderate Awareness':
        recommendations.append({
            'category': 'intermediate',
            'priority': 'medium',
            'reason': 'Practice real-world scenarios',
            'estimated_improvement': '10-20%'
        })
    
    # Priority 3: Profile-based personalization
    if proficiency == 'School':
        recommendations.append({
            'category': 'interactive',
            'priority': 'medium',
            'learning_style': 'visual and interactive'
        })
    
    return recommendations
```

## Benefits of ML Integration

### 1. **Personalized Learning Paths**
- Each user gets unique recommendations
- Considers prior knowledge and learning style
- Adapts based on progress

### 2. **Efficient Knowledge Building**
- Targets specific gaps in understanding
- Prevents wasted time on mastered topics
- Optimizes learning sequence

### 3. **Measurable Improvement**
- Tracks effectiveness of each game
- Identifies most impactful learning activities
- Provides data-driven insights

### 4. **Adaptive Difficulty**
- Beginner-friendly for low awareness
- Challenging for advanced users
- Progressive skill development

### 5. **Engagement & Motivation**
- Visible progress metrics
- Achievement of milestones
- Gamification of learning

## Example User Journey with ML

### Sarah's Story

#### **Attempt 1: Initial Assessment**
```json
{
  "score": 60,
  "percentage": 60.0,
  "ml_awareness_level": "Low Awareness",
  "ml_confidence": 0.88,
  "weak_areas": ["location", "storage", "camera"]
}
```

**ML Recommendations Generated:**
1. **Privacy Guardian** (Location) - Priority High
   - Reason: "Critical weakness in location permissions"
   - Impact: 20-25% improvement expected

2. **Data Vault Challenge** (Storage) - Priority High
   - Reason: "Storage permissions fundamentals needed"
   - Impact: 15-20% improvement expected

3. **Camera Shield** (Camera) - Priority Medium
   - Reason: "Build camera permission awareness"
   - Impact: 10-15% improvement expected

**Learning Path Suggested:**
- Phase 1: Play 2 high-priority games (2 hours)
- Phase 2: Practice with scenarios (1 hour)
- Phase 3: Retake assessment

#### **After Playing 3 Games**

Sarah plays:
1. Privacy Guardian (30 min) ✓
2. Data Vault Challenge (25 min) ✓
3. Camera Shield (20 min) ✓

#### **Attempt 2: Retake Assessment**
```json
{
  "score": 78,
  "percentage": 78.0,
  "ml_awareness_level": "Moderate Awareness",
  "ml_confidence": 0.85,
  "weak_areas": ["microphone"],
  "improvement": 18.0,  // 18% improvement!
  "areas_improved": ["location", "storage", "camera"]
}
```

**ML Analysis:**
- ✓ Location: No longer weak (improved by games!)
- ✓ Storage: No longer weak (improved by games!)
- ✓ Camera: No longer weak (improved by games!)
- ⚠ Microphone: New weak area identified

**New Recommendations:**
1. **Audio Defender** (Microphone) - Priority High
   - Impact: 10-15% to reach High Awareness

**Progress Message:**
> "Great improvement! Your targeted practice paid off. Just one more 
> area to master to reach High Awareness level."

## ML Model Training Considerations

### Current Approach
The ML model is trained on:
- Historical assessment data
- User demographics
- Answer patterns
- Learning outcomes

### Continuous Improvement
As more users complete the flow:
1. **Collect data** on game effectiveness
2. **Measure** actual improvement vs predicted
3. **Retrain model** with new patterns
4. **Refine** recommendations based on outcomes

### Metrics to Track
- **Prediction Accuracy**: ML level vs actual performance
- **Game Effectiveness**: Improvement per game category
- **Recommendation Quality**: User satisfaction with suggestions
- **Learning Velocity**: Time to reach target level

## Configuration & Tuning

### Adjust Weak Area Threshold
```typescript
// In src/lib/assessment-utils.ts
export function extractWeakAreas(
  feedback: QuestionFeedback[],
  threshold: number = 0.6  // Change this (0-1)
): string[] {
  // Lower = more strict (more areas flagged)
  // Higher = more lenient (fewer areas flagged)
}
```

### Modify Improvement Estimates
```typescript
// In src/lib/assessment-utils.ts
export function estimateTimeToTarget(
  currentPercentage: number,
  targetPercentage: number,
  averageImprovementPerGame: number = 5  // Adjust based on data
)
```

### Customize ML Confidence Thresholds
```python
# In app-permission-service/src/api/main.py
if ml_confidence > 0.85:  # High confidence
    priority = 'high'
elif ml_confidence > 0.70:  # Medium confidence
    priority = 'medium'
else:  # Low confidence
    priority = 'low'
```

## Testing ML Recommendations

### 1. **Test Complete Flow**
```bash
# Start services
cd app-permission-service
python -m uvicorn src.api.main:app --reload

cd gamification-next
pnpm dev
```

### 2. **Test ML Endpoint Directly**
```bash
curl -X POST http://localhost:8000/api/game-recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "detailed_feedback": [...],
    "user_profile": {
      "email": "test@example.com",
      "name": "Test User",
      "gender": "Male",
      "education_level": "Degree",
      "proficiency": "High Education"
    },
    "ml_awareness_level": "Moderate Awareness",
    "weak_areas": ["location", "storage"]
  }'
```

### 3. **Verify Improvement Tracking**
```bash
# After taking assessment
curl "http://localhost:3000/api/assessments/improvement?userId=USER_ID&category=CATEGORY"
```

## Future ML Enhancements

1. **Deep Learning Integration**
   - Use neural networks for pattern recognition
   - Predict optimal learning sequences
   - Personalized difficulty curves

2. **Reinforcement Learning**
   - Learn from user interactions
   - Optimize game recommendations over time
   - Adaptive testing strategies

3. **Natural Language Processing**
   - Analyze free-text responses
   - Generate custom explanations
   - Sentiment analysis of feedback

4. **Collaborative Filtering**
   - Recommend based on similar users
   - Find learning patterns across cohorts
   - Social learning insights

## Summary

The ML-powered system provides:

✅ **Personalized assessment analysis**
✅ **Targeted game recommendations**
✅ **Learning path generation**
✅ **Progress tracking & improvement metrics**
✅ **Adaptive difficulty & content**
✅ **Data-driven insights**

This creates a **complete adaptive learning loop** where ML continuously optimizes the learning experience based on individual user needs and performance.
