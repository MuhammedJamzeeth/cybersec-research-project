# Gaming System Setup Guide

## Step 1: Install Dependencies

```powershell
cd c:\Users\Muhammedj\Desktop\UoR\gamification-next
npm install @radix-ui/react-progress
```

## Step 2: Update Prisma Schema

```powershell
npm run db:generate
npm run db:push
```

## Step 3: Start the Application

**Terminal 1 - FastAPI Backend:**
```powershell
cd c:\Users\Muhammedj\Desktop\UoR\ModelAppPer
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Next.js Frontend:**
```powershell
cd c:\Users\Muhammedj\Desktop\UoR\gamification-next
npm run dev
```

## Step 4: Access the Games

Visit: http://localhost:3000/games

---

## What Was Built

### 🎮 **Personalized Learning Games System**

#### **Features:**

1. **Games Hub** (`/games`)
   - Browse all available games
   - Games organized by category
   - Personalized recommendations based on assessment scores
   - Skill level badges (Beginner/Intermediate/Advanced)

2. **Individual Game Pages** (`/games/[category]/[gameSlug]`)
   - **Pre-Assessment**: 3 questions to measure current knowledge
   - **Interactive Game**: 5 scenario-based challenges
   - **Post-Assessment**: 3 questions to measure improvement
   - **Results Dashboard**: Shows improvement percentage

3. **Game Types Created:**

   **Mobile App Permissions:**
   - 🔍 Permission Detective (Beginner)
   - 🏗️ Secure App Builder (Intermediate)
   - 🛡️ Privacy Defender (Advanced)

   **Password Management:**
   - 💪 Password Strength Trainer (Beginner)
   - 🔒 Breach Defense (Intermediate)

   **Phishing Awareness:**
   - 📧 Email Detective (Beginner)
   - 🚫 Scam Buster (Intermediate)

   **Social Media Privacy:**
   - ⚙️ Privacy Settings Master (Beginner)

   **Safe Browsing:**
   - 🧭 Web Safety Navigator (Beginner)

#### **How It Works:**

**Phase 1: Pre-Assessment**
- User takes 3 quick questions
- System measures baseline knowledge
- Score recorded (0-30 points possible)

**Phase 2: Interactive Game**
- 5 real-world scenarios
- Multiple choice decisions
- Immediate feedback on choices
- Learning points after each scenario
- Points awarded based on decisions (0-20 per scenario)

**Phase 3: Post-Assessment**
- Same 3 questions as pre-assessment
- Measures knowledge gained
- Score recorded (0-30 points possible)

**Phase 4: Results**
- Shows improvement percentage
- Displays all scores
- Calculates gamification points (1.5x multiplier)
- Adds points to leaderboard
- Saves to database

#### **Personalization Features:**

1. **Skill-Based Recommendations**
   - Beginner (<60% avg): Recommended beginner games
   - Intermediate (60-79% avg): Recommended intermediate games
   - Advanced (80%+ avg): Recommended advanced games

2. **Adaptive Content**
   - Scenarios difficulty matches user level
   - Learning points tailored to knowledge gaps
   - Progressive unlock system ready

3. **Progress Tracking**
   - Pre/post scores saved
   - Improvement rate calculated
   - Game history maintained
   - Points contribute to leaderboard

#### **Database Schema:**

```prisma
model GameResult {
  id          String   @id @default(auto())
  userId      String
  category    String
  gameSlug    String
  preScore    Int      // Pre-assessment score
  gameScore   Int      // Game scenario points
  postScore   Int      // Post-assessment score
  improvement Int      // Percentage improvement
  completedAt DateTime
  user        User     @relation
}
```

#### **Points System:**

- Pre-assessment: 10 points per correct answer (max 30)
- Game scenarios: 20 points for correct choice per scenario (max 100)
- Post-assessment: 10 points per correct answer (max 30)
- **Total Gamification Points = (Pre + Game + Post) × 1.5**
- Maximum possible: 240 points per game

#### **Sample Scenarios:**

**Example: Permission Detective Game**

1. **Suspicious Calculator App**
   - App requests SMS, contacts, camera
   - Correct: Deny and don't install
   - Learning: Verify permissions match function

2. **Social Media Update**
   - Requests administrator rights
   - Correct: Research before accepting
   - Learning: Admin rights are powerful

3. **Photo Editor**
   - Requests camera, storage, location
   - Correct: Only camera and storage
   - Learning: Evaluate each permission

4. **Game with Ads**
   - Requests phone calls and SMS for ads
   - Correct: This is invasive collection
   - Learning: Ad apps shouldn't need calls/SMS

5. **Fitness Tracker**
   - Requests location, sensors, health data
   - Correct: All are legitimate
   - Learning: Context matters

#### **UI Components:**

- Progress bars for navigation
- Color-coded feedback (green/red/orange)
- Emoji icons for engagement
- Gradient cards for visual appeal
- Badge system for achievements
- Point counters
- Learning point callouts

#### **Integration:**

- ✅ Links in header navigation
- ✅ Personalized recommendations
- ✅ Points added to leaderboard
- ✅ Results saved to MongoDB
- ✅ Tracks improvement over time
- ✅ Mobile responsive design

#### **Research Value:**

This system directly addresses your research topic:

**"Enhancing Cybersecurity Knowledge of Gen Z Using Gamification"**

1. **Pre/Post Assessment**: Measures knowledge improvement scientifically
2. **Personalization**: Adapts to individual skill levels
3. **Engagement**: Interactive scenarios > traditional quizzes
4. **Immediate Feedback**: Reinforces learning instantly
5. **Progress Tracking**: Shows growth over time
6. **Competition**: Leaderboard motivates continued learning
7. **Real-World Scenarios**: Practical application of concepts
8. **Micro-Learning**: 10-15 minute sessions for Gen Z attention spans

#### **Data Collection for Research:**

- Baseline knowledge (pre-scores)
- Learning effectiveness (improvement %)
- Engagement time per game
- Decision patterns in scenarios
- Knowledge retention (post-scores)
- Skill progression over multiple games
- Category-specific strengths/weaknesses

---

## Future Enhancements (Ready to Implement)

1. **Adaptive Difficulty**
   - Scenarios adjust based on user decisions
   - Dynamic feedback based on mistakes

2. **Multiplayer Challenges**
   - Head-to-head scenario battles
   - Team competitions

3. **Daily Challenges**
   - Special scenarios with bonus points
   - Time-limited events

4. **Achievement Badges**
   - "Perfect Score" - 100% improvement
   - "Quick Learner" - Complete in under 10 min
   - "Scenario Master" - All scenarios correct

5. **Story Mode**
   - Progressive narrative across games
   - Character progression
   - Unlock new categories

---

## Technical Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: FastAPI (Python), Next.js API Routes
- **Database**: MongoDB with Prisma ORM
- **UI**: Radix UI, Tailwind CSS, Lucide Icons
- **State Management**: React Hooks
- **Authentication**: Custom JWT auth

---

Ready to revolutionize cybersecurity education for Gen Z! 🚀
