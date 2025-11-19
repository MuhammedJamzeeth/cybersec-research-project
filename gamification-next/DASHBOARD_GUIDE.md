# 🎮 Gamification Dashboard - User Guide

## Overview
The CyberSafe Dashboard is your central hub for tracking cybersecurity learning progress, viewing achievements, and competing with other learners.

## Features

### 📊 **Dashboard** (`/dashboard`)

#### **Overview Tab**
- **Level & Progress Card**
  - Current level (based on total points)
  - Progress bar to next level
  - Total points earned
  - Points needed for next level

- **Stats Grid**
  - **Total Assessments**: Number of completed assessments
  - **Average Score**: Your overall performance percentage
  - **Highest Score**: Your personal best score
  - **Current Streak**: Consecutive assessments completed

- **Achievements Section**
  - Visual badges based on performance:
    - 🥇 Master (90%+)
    - 🥈 Expert (80-89%)
    - 🥉 Advanced (70-79%)
    - ⭐ Intermediate (60-69%)
    - 🛡️ Beginner (<60%)

- **Quick Actions**
  - Browse all categories
  - View detailed progress

#### **History Tab**
- Complete assessment history
- Timestamp of each completion
- Score and badge for each assessment
- Categories completed

#### **Leaderboard Tab**
- Global ranking of all users
- Top 100 performers
- Your position highlighted
- Statistics:
  - Rank number
  - Total points
  - Average score
  - Number of assessments completed

### 🏠 **Home Page Enhancement**
- Quick stats banner for logged-in users
- Shows level, points, completed assessments, and average score
- Quick access to full dashboard

### 🎯 **Gamification Elements**

#### **Points System**
- **10 points per percentage point** earned on assessments
- Example: 85% score = 850 points

#### **Level System**
- **500 points per level**
- Level 1: 0-499 points
- Level 2: 500-999 points
- Level 3: 1000-1499 points
- And so on...

#### **Badges**
Each assessment earns a badge based on score:
- **Master** 👑 - 90%+ (Yellow)
- **Expert** 🏅 - 80-89% (Purple)
- **Advanced** 🎖️ - 70-79% (Blue)
- **Intermediate** ⭐ - 60-69% (Green)
- **Beginner** 🛡️ - <60% (Gray)

#### **Streak System**
- Tracks consecutive assessment completions
- Encourages consistent learning
- Displayed with ⚡ icon

### 📈 **Progress Tracking**

#### **Individual Stats**
- Total assessments completed
- Average score across all categories
- Highest score achieved
- Categories completed (out of 5)

#### **Category Completion**
- Track which cybersecurity topics you've mastered
- See your score for each category
- View completion dates

### 🏆 **Leaderboard**

#### **Ranking System**
Users are ranked by:
1. **Total Points** (primary)
2. **Average Score** (displayed)
3. **Assessment Count** (displayed)

#### **Visual Hierarchy**
- 🥇 #1: Gold text
- 🥈 #2: Silver text
- 🥉 #3: Bronze text
- Your entry: Blue highlight

#### **Statistics Shown**
- Rank position
- Username
- Total points
- Average score
- Number of assessments

## Future Enhancements 🚀

### Planned Features
1. **Daily Challenges**
   - Special time-limited assessments
   - Bonus points for completion

2. **Achievement System**
   - "First Steps" - Complete first assessment
   - "Perfectionist" - Get 100% on any assessment
   - "Well-Rounded" - Complete all 5 categories
   - "Dedicated Learner" - 7-day streak
   - "Security Expert" - Average score above 85%

3. **Social Features**
   - Friend challenges
   - Team competitions
   - Share achievements

4. **Learning Paths**
   - Recommended assessments based on weak areas
   - Progressive difficulty
   - Certification tracks

5. **Rewards System**
   - Virtual certificates
   - Profile badges
   - Custom avatars
   - Unlock advanced content

6. **Analytics**
   - Performance trends over time
   - Category-specific insights
   - Improvement suggestions
   - Time-based analytics

7. **Mobile App Permissions Enhanced**
   - ML-powered personalized feedback
   - Saved to MongoDB
   - Detailed explanations per question
   - Enhancement advice based on education level

## API Endpoints

### Dashboard Data
```typescript
GET /api/assessments?userId={userId}
// Returns all assessments for a user

GET /api/leaderboard
// Returns top 100 users ranked by points
```

### Assessment Submission
```typescript
POST /api/assessments
Body: {
  userId: string,
  categoryId: string,
  slug: string,
  answers: number[],
  score: number
}
```

## Database Schema

### Assessments Collection
```javascript
{
  id: string,
  userId: string,
  categoryId: string,
  slug: string,
  score: number,
  answers: number[],
  completedAt: DateTime,
  user: {
    username: string
  }
}
```

### App Permissions Assessments (MongoDB)
```javascript
{
  _id: ObjectId,
  timestamp: string,
  user_profile: {
    email: string,
    name: string,
    gender: string,
    education_level: string,
    proficiency: string
  },
  total_score: number,
  percentage: number,
  overall_knowledge_level: string,
  detailed_feedback: [...],
  category: "mobile-app-permissions",
  created_at: Date
}
```

## Navigation

### Header Menu
- **Dashboard** - Quick link in main navigation (logged in users only)
- **Profile Dropdown** - Dashboard option with 🏆 icon

### Quick Access
- Home page banner (when logged in)
- "View Dashboard" button after completing assessments

## Best Practices

### For Users
1. Complete all 5 categories for well-rounded knowledge
2. Aim for consistent scores to maintain good averages
3. Check leaderboard regularly for motivation
4. Review history to track improvement

### For Admins
1. Monitor leaderboard for suspicious activity
2. Track average scores per category
3. Identify commonly missed questions
4. Adjust difficulty based on average scores

## Technical Implementation

### Components Created
- `src/app/dashboard/page.tsx` - Main dashboard page
- `src/components/DashboardQuickView.tsx` - Home page stats banner
- `src/app/api/leaderboard/route.ts` - Leaderboard API endpoint

### Updated Components
- `src/components/Header.tsx` - Added dashboard navigation
- `src/app/page.tsx` - Added quick view banner
- `src/app/profile/page.tsx` - Added dashboard link

### Dependencies
- Lucide React icons
- Existing UI components (Card, Button, etc.)
- Prisma ORM for database queries

## Troubleshooting

### Dashboard Not Loading
- Ensure MongoDB is running
- Check user authentication
- Verify API endpoints are accessible

### Leaderboard Empty
- Need at least one completed assessment
- Check database connection
- Verify assessment saving correctly

### Stats Not Updating
- Refresh page after completing assessment
- Clear browser cache
- Check API response in browser console

---

**Version**: 1.0  
**Last Updated**: November 13, 2025  
**Built for**: CyberSafe Gamification Platform
