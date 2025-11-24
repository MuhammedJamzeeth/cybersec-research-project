# 🚀 Deployment Checklist

## Pre-Deployment Checks

### ☐ 1. Database Schema Migration
```bash
cd gamification-next
npx prisma generate
npx prisma db push
```

**Verify:**
- [ ] No migration errors
- [ ] New fields added to Assessment model
- [ ] MongoDB connection successful

---

### ☐ 2. ML Service Health
```bash
cd app-permission-service
python -m uvicorn src.api.main:app --reload --port 8000
```

**Verify:**
- [ ] Service starts without errors
- [ ] Visit: http://localhost:8000/health
- [ ] ML model loaded successfully
- [ ] All components status: true

---

### ☐ 3. Next.js Application
```bash
cd gamification-next
pnpm install  # if dependencies changed
pnpm dev
```

**Verify:**
- [ ] No build errors
- [ ] Application loads: http://localhost:3000
- [ ] No console errors

---

### ☐ 4. Environment Variables

**gamification-next/.env.local**
```env
NEXT_PUBLIC_APPPERM_API_URL=http://localhost:8000
MONGO_URI=mongodb://localhost:27017/gamification
```

**app-permission-service/.env**
```env
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:3000
LOG_FORMAT=dev
```

**Verify:**
- [ ] All variables set
- [ ] MongoDB URI correct
- [ ] CORS origins include frontend URL
- [ ] Ports don't conflict

---

## Integration Testing

### ☐ 5. Test Assessment Submission Flow

**Steps:**
1. [ ] Navigate to a category assessment
2. [ ] Complete all questions
3. [ ] Submit assessment
4. [ ] Verify data saved to MongoDB
5. [ ] Check ML service received request
6. [ ] Verify response includes:
   - [ ] Score and percentage
   - [ ] ML awareness level
   - [ ] ML confidence
   - [ ] Detailed feedback
   - [ ] ML recommendations

**Command to check MongoDB:**
```bash
npx prisma studio
# Look in assessments collection
```

---

### ☐ 6. Test Game Recommendations

**Test API Endpoint:**
```bash
# Replace USER_ID and CATEGORY
curl "http://localhost:3000/api/recommendations?userId=USER_ID&category=CATEGORY"
```

**Verify Response Contains:**
- [ ] assessmentId
- [ ] score, percentage, knowledgeLevel
- [ ] weakAreas array
- [ ] recommendations array with games
- [ ] Each game has: slug, name, category, reason, priority

---

### ☐ 7. Test Improvement Tracking

**Step 1: First Assessment**
- [ ] Complete assessment
- [ ] Note the score

**Step 2: Play Games**
- [ ] Click on 3 recommended games
- [ ] Track which games were "played"

**Step 3: Retake Assessment**
- [ ] Wait 1 hour (or adjust cooldown in code for testing)
- [ ] Retake the same assessment
- [ ] Submit with different answers

**Step 4: Verify Improvement Data**
```bash
curl "http://localhost:3000/api/assessments/improvement?userId=USER_ID&category=CATEGORY"
```

**Response Should Show:**
- [ ] totalAttempts: 2
- [ ] firstAttempt score
- [ ] latestAttempt score
- [ ] totalImprovement calculated
- [ ] improvementData array with both attempts
- [ ] canRetake status

---

### ☐ 8. Test ML Recommendations Endpoint

**Send Request:**
```bash
curl -X POST http://localhost:8000/api/game-recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "detailed_feedback": [],
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

**Verify Response:**
- [ ] recommendations array present
- [ ] learning_path object present
- [ ] weak_areas reflected
- [ ] ml_personalized: true

---

### ☐ 9. Test UI Components

**AssessmentRecommendations Component:**
- [ ] Shows assessment score summary
- [ ] Displays weak areas as badges
- [ ] Lists game recommendations
- [ ] Shows improvement history (if multiple attempts)
- [ ] Displays retake button when eligible
- [ ] Shows cooldown timer when not eligible

**ImprovementJourney Component:**
- [ ] Shows journey overview with first/latest scores
- [ ] Displays total improvement
- [ ] Shows attempt timeline
- [ ] Highlights improvements in green
- [ ] Shows areas improved
- [ ] Displays motivational messages

---

## User Flow Testing

### ☐ 10. Complete User Journey

**Scenario: New User "Test Person"**

1. [ ] **Register/Login**
   - Create account with:
     - Email: test@example.com
     - Education: Degree
     - Proficiency: High Education

2. [ ] **Take Initial Assessment**
   - Navigate to category (e.g., Location)
   - Answer all questions
   - Submit assessment
   - **Expected Result:** Score 60-70% (Beginner/Intermediate)

3. [ ] **View Results Page**
   - Verify redirected to `/assessment-results`
   - See score displayed
   - View weak areas highlighted
   - See game recommendations loaded

4. [ ] **Review Recommendations**
   - At least 2-3 games suggested
   - Games tagged with priority (high/medium)
   - Estimated impact shown
   - Reason for recommendation clear

5. [ ] **Play Recommended Games**
   - Click "Play Game" on 3 games
   - Track that games are marked as played
   - See remaining recommendations update

6. [ ] **Check Retake Eligibility**
   - After playing 3+ games
   - See message suggesting retake
   - Verify cooldown status

7. [ ] **Retake Assessment**
   - Navigate back to category
   - See previous attempt info
   - Complete assessment again
   - **Expected Result:** Higher score (75-85%)

8. [ ] **View Improvement**
   - See improvement percentage
   - View progress timeline
   - See which areas improved
   - Celebrate achievement! 🎉

---

## Edge Cases & Error Handling

### ☐ 11. Test Error Scenarios

**No Assessment Completed:**
```bash
curl "http://localhost:3000/api/recommendations?userId=NEW_USER&category=location"
```
- [ ] Returns 404 or empty recommendations
- [ ] Doesn't crash

**Invalid Category:**
```bash
curl "http://localhost:3000/api/recommendations?userId=USER_ID&category=invalid"
```
- [ ] Returns appropriate error
- [ ] Doesn't crash

**ML Service Down:**
- [ ] Stop ML service
- [ ] Try submitting assessment
- [ ] Verify graceful degradation
- [ ] Assessment still saves to DB

**Missing User Profile:**
- [ ] Try submitting without complete profile
- [ ] Verify validation errors
- [ ] Clear error messages shown

---

## Performance Testing

### ☐ 12. Load Testing

**Test Concurrent Assessments:**
```bash
# Submit 10 assessments simultaneously
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/assessments/improvement \
    -H "Content-Type: application/json" \
    -d '{"userId":"user'$i'", ...}' &
done
wait
```

**Verify:**
- [ ] All requests complete
- [ ] No database conflicts
- [ ] Response times reasonable (<2s)

---

## Data Validation

### ☐ 13. Database Integrity

**Check in Prisma Studio:**
```bash
npx prisma studio
```

**Verify Assessment Records:**
- [ ] All fields populated correctly
- [ ] attemptNumber increments properly
- [ ] previousAttemptId links correctly
- [ ] improvement calculated accurately
- [ ] weakAreas array contains valid categories
- [ ] mlRecommendations saved
- [ ] mlAwarenessLevel present
- [ ] mlConfidence is a number

---

## Security Checks

### ☐ 14. API Security

**Authorization:**
- [ ] User can only access their own data
- [ ] userId validation in place
- [ ] No unauthorized access to other users' assessments

**Input Validation:**
- [ ] Score ranges validated (0-100)
- [ ] Category slugs sanitized
- [ ] User IDs validated
- [ ] SQL injection prevented (using Prisma)

**CORS:**
- [ ] Only allowed origins can access API
- [ ] Credentials handled securely

---

## Documentation Verification

### ☐ 15. Documentation Complete

**Check Files Exist:**
- [ ] ASSESSMENT_GAME_SYSTEM.md
- [ ] QUICKSTART_ASSESSMENT_SYSTEM.md
- [ ] ML_RECOMMENDATIONS_GUIDE.md
- [ ] IMPLEMENTATION_SUMMARY.md
- [ ] This DEPLOYMENT_CHECKLIST.md

**Verify Content:**
- [ ] API endpoints documented
- [ ] Schema changes explained
- [ ] Integration examples provided
- [ ] Configuration options listed

---

## Production Readiness

### ☐ 16. Pre-Production Steps

**Environment:**
- [ ] Production MongoDB URI configured
- [ ] ML service deployed and accessible
- [ ] Next.js app built for production
- [ ] Environment variables set in hosting

**Build Application:**
```bash
cd gamification-next
pnpm build
pnpm start
```
- [ ] Build succeeds
- [ ] No warnings
- [ ] App runs in production mode

**ML Service Production:**
```bash
cd app-permission-service
uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```
- [ ] Service runs without reload flag
- [ ] Handles multiple concurrent requests
- [ ] Logs properly

---

## Monitoring & Analytics

### ☐ 17. Set Up Monitoring

**Track Metrics:**
- [ ] Assessment completion rate
- [ ] Average improvement percentage
- [ ] Game recommendation clicks
- [ ] Retake rate
- [ ] ML prediction accuracy

**Log Important Events:**
- [ ] Assessment submissions
- [ ] Game plays
- [ ] Retakes
- [ ] Improvement milestones
- [ ] Errors

---

## Final Checks

### ☐ 18. System Health

**Overall Verification:**
- [ ] All services running
- [ ] Database accessible
- [ ] ML model loaded
- [ ] Frontend responsive
- [ ] API endpoints functional
- [ ] User authentication working
- [ ] Data persisting correctly
- [ ] Recommendations generating
- [ ] Improvement tracking accurate

**Performance:**
- [ ] Page loads < 3s
- [ ] API responses < 2s
- [ ] ML predictions < 5s
- [ ] No memory leaks
- [ ] No console errors

---

## 🎉 Launch Checklist

### Ready to Launch When:
- ✅ All above checks passed
- ✅ Data validated in database
- ✅ Error handling tested
- ✅ Documentation complete
- ✅ Team trained on system
- ✅ Backup strategy in place
- ✅ Monitoring configured
- ✅ User guide prepared

---

## Post-Launch

### ☐ 19. Monitor First Week

**Daily Checks:**
- [ ] Error logs reviewed
- [ ] User feedback collected
- [ ] Performance metrics tracked
- [ ] ML accuracy measured
- [ ] Database growth monitored

**Week 1 Review:**
- [ ] Average improvement rate
- [ ] Most effective games identified
- [ ] Weak area patterns analyzed
- [ ] ML model accuracy assessed
- [ ] User satisfaction surveyed

---

## Rollback Plan

### ☐ 20. Emergency Rollback

**If Issues Arise:**

1. **Rollback Database:**
```bash
# Revert schema changes
npx prisma migrate reset
```

2. **Rollback Code:**
```bash
git revert <commit-hash>
git push
```

3. **Backup Data:**
```bash
mongodump --db gamification --out backup/
```

---

## Success Criteria

### System is successful when:
✅ Users complete assessments smoothly
✅ Recommendations are relevant and helpful
✅ Users retake and show improvement
✅ ML predictions are accurate (>80%)
✅ No critical bugs reported
✅ Performance is acceptable
✅ Users engage with recommended games
✅ Learning objectives achieved

---

**Deployment Status: [ ] READY  [ ] IN PROGRESS  [ ] COMPLETED**

**Deployed By: ___________________**

**Deployment Date: ___________________**

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

## 🚀 You're Ready to Deploy!

Follow this checklist step-by-step to ensure a smooth deployment.

**Good luck! 🎉**
