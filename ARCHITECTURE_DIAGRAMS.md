# System Architecture Diagrams

## 1. Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GAMIFICATION SYSTEM                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│   Next.js App    │◄────────┤   MongoDB        │────────►│  ML Service      │
│   (Frontend)     │         │   (Database)     │         │  (FastAPI)       │
│                  │         │                  │         │                  │
└─────────┬────────┘         └──────────────────┘         └────────┬─────────┘
          │                                                          │
          │                                                          │
          │  1. User takes assessment                               │
          │  ───────────────────────────►                           │
          │                                                          │
          │  2. Submit to ML for analysis                           │
          │  ────────────────────────────────────────────────────► │
          │                                                          │
          │  3. ML returns predictions & recommendations            │
          │  ◄──────────────────────────────────────────────────── │
          │                                                          │
          │  4. Save to DB with ML data                             │
          │  ───────────────────────────►                           │
          │                                                          │
          │  5. Generate game recommendations                       │
          │  ◄───────────────────────────                           │
          │                                                          │
          │  6. User plays games                                    │
          │  (tracked in system)                                    │
          │                                                          │
          │  7. User retakes assessment                             │
          │  ───────────────────────────►                           │
          │                                                          │
          │  8. Calculate improvement                               │
          │  ◄───────────────────────────                           │
          │                                                          │
          ▼                                                          ▼
    [User sees progress & improved knowledge level]
```

## 2. Database Schema Relationships

```
┌────────────────────────────────────────────────────────────────┐
│                          User                                   │
├────────────────────────────────────────────────────────────────┤
│ id: String                                                     │
│ username: String                                               │
│ email: String                                                  │
│ education_level: String                                        │
│ proficiency: String                                            │
│ gender: String                                                 │
└───────────┬────────────────────────────────────────────────────┘
            │
            │ 1:N (One user, many assessments)
            │
            ▼
┌────────────────────────────────────────────────────────────────┐
│                        Assessment                               │
├────────────────────────────────────────────────────────────────┤
│ id: String                                                     │
│ userId: String ──────► References User                         │
│ categoryId: String                                             │
│ slug: String                                                   │
│ answers: Int[]                                                 │
│ score: Int                                                     │
│ percentage: Float                                              │
│ knowledgeLevel: String       ◄── NEW                           │
│ weakAreas: String[]          ◄── NEW                           │
│ recommendedGames: String[]   ◄── NEW                           │
│ attemptNumber: Int           ◄── NEW (1, 2, 3...)             │
│ previousAttemptId: String?   ◄── NEW (links to previous)      │
│ improvement: Float?          ◄── NEW (% change)                │
│ mlRecommendations: String[]  ◄── NEW (from ML)                 │
│ mlAwarenessLevel: String?    ◄── NEW (ML prediction)           │
│ mlConfidence: Float?         ◄── NEW (ML confidence)           │
│ detailedFeedback: Json?      ◄── NEW (full ML data)            │
│ completedAt: DateTime                                          │
└───────────┬────────────────────────────────────────────────────┘
            │
            │ Self-reference for retakes
            │
            ▼
    [Previous Assessment Record]
```

## 3. Assessment Retake Chain

```
First Attempt                Second Attempt              Third Attempt
┌─────────────┐            ┌─────────────┐            ┌─────────────┐
│ Assessment1 │            │ Assessment2 │            │ Assessment3 │
├─────────────┤            ├─────────────┤            ├─────────────┤
│ attempt: 1  │◄───────────│ attempt: 2  │◄───────────│ attempt: 3  │
│ previous:   │  previous  │ previous:   │  previous  │ previous:   │
│   null      │   AttemptId│   Assess1   │   AttemptId│   Assess2   │
│             │            │             │            │             │
│ score: 65%  │            │ score: 78%  │            │ score: 88%  │
│ improve: 0  │            │ improve:    │            │ improve:    │
│             │            │   +13%      │            │   +10%      │
└─────────────┘            └─────────────┘            └─────────────┘
      │                          │                          │
      │                          │                          │
      ▼                          ▼                          ▼
  Weak Areas:              Weak Areas:              Weak Areas:
  - Location               - Contacts               - None
  - Storage                                         
  - Camera                                          [Advanced Level!]
```

## 4. ML Recommendation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Completes Assessment                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Extract Assessment Data                         │
│  • Answers array                                                │
│  • User profile (education, gender, proficiency)                │
│  • Category                                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ML Model Analysis                             │
│  ┌──────────────────────────────────────────────────┐           │
│  │ 1. Score Calculation                              │           │
│  │    • Per-question scoring                         │           │
│  │    • Total score & percentage                     │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │ 2. Awareness Level Prediction                     │           │
│  │    • ML Model Input: answers + profile            │           │
│  │    • Output: Low/Moderate/High + confidence       │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │ 3. Weak Area Identification                       │           │
│  │    • Questions with score < 60%                   │           │
│  │    • Extract categories from questions            │           │
│  │    • Group by permission type                     │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │ 4. Personalized Explanations                      │           │
│  │    • Adjust for education level                   │           │
│  │    • Adapt technical depth                        │           │
│  │    • Use appropriate examples                     │           │
│  └──────────────────────────────────────────────────┘           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Generate Recommendations                        │
│                                                                  │
│  Priority 1 (High):                                             │
│  ┌──────────────────────────────────────────┐                  │
│  │ Games for Weak Areas                      │                  │
│  │ • Location → Privacy Guardian             │                  │
│  │ • Storage → Data Vault Challenge          │                  │
│  │ Impact: 15-25% improvement                │                  │
│  └──────────────────────────────────────────┘                  │
│                                                                  │
│  Priority 2 (Medium):                                           │
│  ┌──────────────────────────────────────────┐                  │
│  │ Level-Appropriate Games                   │                  │
│  │ • Low Awareness → Fundamentals            │                  │
│  │ • Moderate → Real-world scenarios         │                  │
│  │ Impact: 10-20% improvement                │                  │
│  └──────────────────────────────────────────┘                  │
│                                                                  │
│  Priority 3 (Personalized):                                     │
│  ┌──────────────────────────────────────────┐                  │
│  │ ML-Specific Recommendations               │                  │
│  │ • Based on learning patterns              │                  │
│  │ • Profile-matched games                   │                  │
│  │ Impact: Varies by user                    │                  │
│  └──────────────────────────────────────────┘                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Learning Path Creation                        │
│                                                                  │
│  Phase 1: Address Weak Areas (2-3 games)                       │
│  Phase 2: Consolidate Knowledge (1-2 games)                    │
│  Phase 3: Advanced Practice (1 game)                           │
│                                                                  │
│  Estimated Time: 3-5 hours                                      │
│  Expected Improvement: 20-30%                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                Display to User with UI                           │
└─────────────────────────────────────────────────────────────────┘
```

## 5. API Endpoints Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js API Routes                           │
└─────────────────────────────────────────────────────────────────┘

GET  /api/recommendations
     ?userId={id}&category={slug}
     ──────────────────────────────────►
     Returns: Game recommendations based on latest assessment
     
POST /api/recommendations
     body: { userId, categorySlug, gamesPlayed[] }
     ──────────────────────────────────►
     Returns: Updated recommendations after games played

GET  /api/assessments/improvement
     ?userId={id}&category={slug}
     ──────────────────────────────────►
     Returns: Improvement history, metrics, can retake status

POST /api/assessments/improvement
     body: { userId, categorySlug, score, percentage, mlData, ... }
     ──────────────────────────────────►
     Returns: New assessment record with improvement calculated


┌─────────────────────────────────────────────────────────────────┐
│                  ML Service API (FastAPI)                        │
└─────────────────────────────────────────────────────────────────┘

GET  /health
     ──────────────────────────────────►
     Returns: Service health, ML model status

GET  /api/questions
     ──────────────────────────────────►
     Returns: All assessment questions

POST /api/assess
     body: { user_profile, answers[] }
     ──────────────────────────────────►
     Returns: Scores, ML predictions, detailed feedback

POST /api/game-recommendations
     body: { detailed_feedback, user_profile, ml_awareness_level, weak_areas }
     ──────────────────────────────────►
     Returns: ML-powered game recommendations, learning path

GET  /api/stats
     ──────────────────────────────────►
     Returns: Aggregate statistics
```

## 6. Component Hierarchy

```
assessment-results/page.tsx
│
├── AssessmentRecommendations
│   │
│   ├── Score Summary Card
│   │   ├── Total Score
│   │   ├── Percentage
│   │   └── Knowledge Level
│   │
│   ├── Improvement History Card
│   │   ├── First Attempt Info
│   │   ├── Latest Attempt Info
│   │   ├── Total Improvement
│   │   ├── Progress Bar
│   │   └── Attempt History List
│   │
│   ├── Game Recommendations Card
│   │   ├── Recommendation List
│   │   │   ├── Game Card (Priority 1)
│   │   │   ├── Game Card (Priority 2)
│   │   │   └── Game Card (Priority 3)
│   │   │
│   │   └── Games Played Tracker
│   │
│   └── Retake Assessment Button/Timer
│
└── ImprovementJourney
    │
    ├── Journey Overview
    │   ├── Starting Point
    │   ├── Improvement Delta
    │   └── Current Level
    │
    ├── Progress Timeline
    │   ├── Attempt 1 Card
    │   ├── Attempt 2 Card
    │   └── Attempt N Card
    │
    └── Insights Section
        ├── Best Improvement
        ├── Areas Improved
        └── Motivational Message
```

## 7. Data Flow Sequence

```
User Action              Frontend                 API                   ML Service         Database
    │                       │                      │                         │                │
    │ 1. Take Assessment    │                      │                         │                │
    │──────────────────────►│                      │                         │                │
    │                       │                      │                         │                │
    │ 2. Submit Answers     │                      │                         │                │
    │──────────────────────►│  Submit to ML        │                         │                │
    │                       │─────────────────────────────────────────────► │                │
    │                       │                      │                         │                │
    │                       │                      │   3. ML Analysis        │                │
    │                       │                      │        Processing...    │                │
    │                       │                      │        • Score          │                │
    │                       │                      │        • Predict level  │                │
    │                       │                      │        • Find weak areas│                │
    │                       │                      │                         │                │
    │                       │  4. ML Results       │                         │                │
    │                       │◄─────────────────────────────────────────────│                │
    │                       │  • Awareness level   │                         │                │
    │                       │  • Recommendations   │                         │                │
    │                       │  • Detailed feedback │                         │                │
    │                       │                      │                         │                │
    │                       │  5. Save to DB       │                         │                │
    │                       │──────────────────────────►                     │────────────────►│
    │                       │     with ML data     │                         │  New Assessment│
    │                       │                      │                         │  Record        │
    │                       │                      │                         │                │
    │                       │  6. Get Recommendations                        │                │
    │                       │──────────────────────────►                     │                │
    │                       │                      │  Query latest assessment│                │
    │                       │                      │─────────────────────────────────────────►│
    │                       │                      │◄─────────────────────────────────────────│
    │                       │                      │  Assessment data        │                │
    │                       │                      │  • Score                │                │
    │                       │                      │  • Weak areas           │                │
    │                       │                      │  • ML recommendations   │                │
    │                       │                      │                         │                │
    │                       │  7. Recommendations  │                         │                │
    │                       │◄──────────────────────────                     │                │
    │                       │  • Game list         │                         │                │
    │                       │  • Priority          │                         │                │
    │                       │  • Estimated impact  │                         │                │
    │                       │                      │                         │                │
    │ 8. Show Results       │                      │                         │                │
    │◄──────────────────────│                      │                         │                │
    │ • Score               │                      │                         │                │
    │ • Weak areas          │                      │                         │                │
    │ • Game recommendations│                      │                         │                │
    │                       │                      │                         │                │
    │ 9. Play Games (3+)    │                      │                         │                │
    │──────────────────────►│  Track games played  │                         │                │
    │                       │                      │                         │                │
    │ 10. Retake Assessment │                      │                         │                │
    │──────────────────────►│  Submit retake       │                         │                │
    │                       │─────────────────────────────────────────────► │                │
    │                       │  (same flow as steps 2-7)                      │                │
    │                       │                      │                         │                │
    │                       │  Calculate improvement                         │                │
    │                       │──────────────────────────►                     │                │
    │                       │                      │  Compare attempts       │                │
    │                       │                      │─────────────────────────────────────────►│
    │                       │                      │  • Previous score       │                │
    │                       │                      │  • Current score        │                │
    │                       │                      │  • Delta calculation    │                │
    │                       │                      │◄─────────────────────────────────────────│
    │                       │                      │  Improvement metrics    │                │
    │                       │◄──────────────────────────                     │                │
    │                       │  • +18% improvement! │                         │                │
    │                       │                      │                         │                │
    │ 11. View Progress     │                      │                         │                │
    │◄──────────────────────│                      │                         │                │
    │ • Improvement chart   │                      │                         │                │
    │ • Areas improved      │                      │                         │                │
    │ • New recommendations │                      │                         │                │
    │                       │                      │                         │                │
```

## 8. Weak Area Detection Logic

```
Assessment Questions
         │
         ▼
┌──────────────────────────────────────────┐
│ For each question:                        │
│                                           │
│   Question: "When to grant location?"    │
│   User Answer: Option B (weight: 2)      │
│   Max Score: 5                           │
│   Score Percentage: 2/5 = 40%           │
│                                           │
│   IS 40% < 60%? → YES                    │
│   This is a WEAK AREA                    │
│                                           │
│   Extract Category:                      │
│   - Search for keywords in question      │
│   - "location" found                     │
│   - Category: "location"                 │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Group all weak questions by category:    │
│                                           │
│ location: 3 questions (weak)             │
│ storage: 2 questions (weak)              │
│ camera: 0 questions (all good)           │
│ contacts: 1 question (weak)              │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Final Weak Areas Array:                  │
│                                           │
│ ["location", "storage", "contacts"]      │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Generate Game Recommendations:           │
│                                           │
│ For "location" →  Privacy Guardian       │
│ For "storage" →   Data Vault Challenge   │
│ For "contacts" → Contact Protector       │
└──────────────────────────────────────────┘
```

This comprehensive diagram set shows the complete system architecture and data flows!
