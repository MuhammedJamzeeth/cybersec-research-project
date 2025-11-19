# ML-Powered Personalization Guide

## Overview
This application uses a trained machine learning model to provide **fully personalized** assessment results based on user demographics including:
- **Gender** (Male/Female)
- **Education Level** (O/L, A/L, HND, Degree)
- **Proficiency** (School, High Education)

## How It Works

### 1. User Registration/Profile
When users register or start the assessment, collect these required fields:

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "gender": "Male",
  "education_level": "Degree",
  "proficiency": "High",
  "organization": "University of Ruhuna"
}
```

### 2. ML Model Prediction
After quiz completion, the system:

#### a) **Prepares Features**
- Encodes user answers into feature vectors
- Uses the same format as training data (41 features)
- Includes question-answer combinations

#### b) **Makes Predictions**
- Scales features using trained StandardScaler
- Predicts awareness level using LogisticRegression model
- Returns:
  - **Awareness Level**: Low/Moderate/High
  - **Confidence Score**: 0.0 to 1.0

#### c) **Generates Personalized Explanations**
For each question, retrieves explanations from the bank (480 explanations) matching:
- Question ID
- Selected option
- User's gender
- User's education level
- User's proficiency

### 3. Personalized Feedback Example

For a **Male, Degree, High proficiency** user who selected wrong answer:
```
"Malli, at degree level you should know short passwords are weakest. 
Think of research data locked with a small key — easily stolen. 
Best is 12+ characters, with special symbols, to prevent brute-force attacks."
```

For a **Female, O/L, School** user with same answer:
```
"Nangi, thinking a short password is fine is risky. It's like using 
a tiny lock on your school bag — anyone can break it. Use at least 
8+ characters with mix of letters and numbers."
```

## API Usage

### Submit Assessment with Profile

```bash
POST /api/assess
Content-Type: application/json

{
  "user_profile": {
    "email": "student@university.lk",
    "name": "Kamal Silva",
    "organization": "University of Ruhuna",
    "gender": "Male",
    "education_level": "Degree",
    "proficiency": "High"
  },
  "answers": [
    {
      "question_id": "map1",
      "question_text": "What does 'permission' mean in mobile apps?",
      "selected_option": "An app to access specific parts of your phone",
      "selected_option_index": 0
    }
  ]
}
```

### Response with ML Insights

```json
{
  "timestamp": "2025-11-14T10:30:00",
  "user_profile": {...},
  "total_score": 8,
  "max_score": 10,
  "percentage": 80.0,
  "overall_knowledge_level": "Advanced",
  
  "ml_awareness_level": "High Awareness",
  "ml_confidence": 0.8542,
  "ml_recommendations": [
    "Excellent! Your awareness is high (confidence: 85.4%). Continue staying updated with latest security practices.",
    "Explore advanced topics like permission groups, special permissions, and security auditing.",
    "Share your knowledge with others and consider contributing to mobile security awareness."
  ],
  
  "detailed_feedback": [
    {
      "question_id": "map1",
      "question_text": "What does 'permission' mean in mobile apps?",
      "selected_option": "An app to access specific parts of your phone",
      "score": 4,
      "level": "advanced",
      "explanation": "Aiyaa, you got it right! Permissions are like keys that apps ask for to access phone features...",
      "enhancement_advice": "Excellent! Stay updated with latest mobile security best practices."
    }
  ],
  
  "saved_to_database": true,
  "message": "Assessment completed successfully with ML-based analysis!"
}
```

## Explanation Bank Structure

The system has **480 personalized explanations** covering:
- **10 Questions** (Q1-Q10)
- **4 Options per question** (A, B, C, D)
- **2 Genders** (Male, Female)
- **4 Education Levels** (O/L, A/L, HND, Degree)
- **2 Proficiency Levels** (School, High)

Total: 10 × 4 × 2 × 2 × 2 = 320 combinations (with additional variations = 480 total)

## Model Components

### 1. Trained Model
- **Algorithm**: Logistic Regression
- **Training Data**: Mobile app permission survey responses
- **Features**: 41 question-answer combinations
- **Output**: 3 classes (Low/Moderate/High Awareness)
- **Location**: `models/app_permissions_model.pkl`

### 2. Feature Scaler
- **Type**: StandardScaler
- **Purpose**: Normalizes input features
- **Location**: `models/app_permissions_scaler.pkl`

### 3. Feature Names
- **Count**: 41 features
- **Format**: `Q_X_option_text`
- **Location**: `models/app_permissions_feature_names.pkl`

### 4. Explanation Bank
- **Count**: 480 personalized explanations
- **Format**: JSON with profile matching
- **Location**: `data/ExplanationBankappper.json`

## Integration Requirements

### Frontend Integration

```typescript
// 1. Collect user profile during registration
interface UserProfile {
  email: string;
  name: string;
  organization?: string;
  gender: 'Male' | 'Female';
  education_level: 'O/L' | 'A/L' | 'HND' | 'Degree';
  proficiency: 'School' | 'High';
}

// 2. Submit assessment with profile
const submitAssessment = async (
  userProfile: UserProfile,
  answers: Answer[]
) => {
  const response = await fetch('http://localhost:8000/api/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_profile: userProfile,
      answers: answers
    })
  });
  
  const result = await response.json();
  
  // 3. Display ML insights
  console.log('ML Awareness:', result.ml_awareness_level);
  console.log('Confidence:', result.ml_confidence);
  console.log('Recommendations:', result.ml_recommendations);
  
  // 4. Show personalized feedback per question
  result.detailed_feedback.forEach(feedback => {
    console.log(feedback.explanation); // Personalized to user's profile
  });
};
```

## Benefits of ML-Powered Personalization

### 1. **Demographic Adaptation**
- Language style adapted to education level
- Technical depth matches proficiency
- Cultural references appropriate to user background

### 2. **Predictive Insights**
- ML model predicts overall awareness beyond simple scoring
- Identifies knowledge gaps
- Provides confidence metrics

### 3. **Targeted Recommendations**
- Specific learning paths based on awareness level
- Resources matched to education background
- Action items personalized to proficiency

### 4. **Engagement**
- Relatable explanations increase understanding
- Personalized tone improves connection
- Demographic-specific examples resonate better

## Example Personalization

### Question: "What is a strong password?"
**User Answer**: Short password (Wrong)

#### For Male, O/L, School:
```
"Machan, thinking a short password is fine because you remember it easily 
is risky. It's like using a tiny lock on your school bag — anyone can 
break it. Use at least 8+ characters with mix of letters and numbers."
```

#### For Female, Degree, High:
```
"Akki, at degree level you should understand password entropy. Short 
passwords have low entropy making them vulnerable to brute-force attacks. 
Use 12+ characters with special symbols and consider a password manager."
```

#### For Male, HND, High:
```
"Machan, short passwords may feel easy, but hackers crack them in seconds 
with tools. It's like using a one-digit PIN for your ATM. Use longer, 
complex ones or a manager app to handle them."
```

## Troubleshooting

### ML Prediction Returns "Unknown"
- Check if model, scaler, and feature_names are loaded
- Verify answer format matches expected structure
- Check logs for error messages

### Explanation Not Found
- Verify profile values match exactly: "Male"/"Female", "O/L"/"A/L"/"HND"/"Degree", "School"/"High"
- Check ExplanationBankappper.json for available combinations
- Fallback explanations will be used if no match found

### Low Confidence Scores
- Normal for ambiguous answer patterns
- Consider collecting more training data
- May indicate user needs additional assessment

## Best Practices

1. **Always collect complete user profiles** - Required for full personalization
2. **Validate profile values** - Use exact values expected by the system
3. **Display ML confidence** - Help users understand prediction reliability
4. **Show personalized recommendations** - Guide users to appropriate resources
5. **Save profile data** - Enable tracking of user progress over time

## Future Enhancements

- [ ] Add more demographic factors (age, location)
- [ ] Expand explanation bank with more variations
- [ ] Implement adaptive testing based on ML predictions
- [ ] Add multilingual support for explanations
- [ ] Track learning progress over multiple assessments
