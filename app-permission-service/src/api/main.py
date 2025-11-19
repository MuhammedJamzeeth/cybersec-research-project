from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import List
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.api.models import (
    Question, AssessmentSubmission, AssessmentResult,
    QuestionFeedback, HealthCheck, UserProfile
)
from src.core.service import model_service
from src.utils.request_logger import setup_request_logger
from config.settings import settings

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Mobile App Permissions Assessment API",
    description="FastAPI microservice for mobile app permissions security assessment with ML-based scoring and personalized feedback",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Setup Request Logger (Morgan-style) - Add this before CORS
# Available formats: 'dev', 'combined', 'short', 'detailed'
log_format = os.getenv("LOG_FORMAT", "dev")
setup_request_logger(app, format=log_format)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Load ML model and data on startup"""
    print("🚀 Starting Mobile App Permissions Assessment API...")
    success = model_service.load_components()
    if not success:
        print("⚠️ Warning: Some components failed to load")
    else:
        print("✅ All components loaded successfully")


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Mobile App Permissions Assessment API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthCheck, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    status_info = model_service.check_status()
    
    return HealthCheck(
        status="healthy" if all(status_info.values()) else "degraded",
        timestamp=datetime.now().isoformat(),
        model_loaded=status_info['model_loaded'],
        components_status=status_info
    )


@app.get("/api/questions", response_model=List[Question], tags=["Assessment"])
async def get_questions():
    """
    Get all mobile app permissions assessment questions
    
    Returns a list of questions with multiple choice options, scores, and difficulty levels.
    """
    try:
        questions = model_service.get_questions()
        
        if not questions:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Questions not available. Please ensure answer sheet is loaded."
            )
        
        return questions
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving questions: {str(e)}"
        )


@app.post("/api/assess", response_model=AssessmentResult, tags=["Assessment"])
async def submit_assessment(submission: AssessmentSubmission):
    """
    Submit assessment answers and get detailed results with ML-powered personalized feedback
    
    **User Profile Required (for ML predictions & personalized explanations):**
    - **email**: User's email address
    - **name**: User's full name
    - **gender**: Male or Female (used for personalized explanations)
    - **education_level**: O/L, A/L, HND, or Degree (tailors explanation complexity)
    - **proficiency**: School or High (adjusts technical depth)
    - **organization**: Optional organization name
    
    **Answers**: List of user's answers to the assessment questions
    
    **Returns ML-Enhanced Results:**
    - **Total score** and **percentage**
    - **Overall knowledge level** (rule-based)
    - **ML Awareness Level**: Low/Moderate/High Awareness (ML model prediction)
    - **ML Confidence**: Prediction confidence score
    - **Per-question feedback** with demographically personalized explanations
    - **Enhancement advice** tailored to user's profile
    - **ML-based recommendations** specific to awareness level and education
    """
    try:
        # Calculate scores and generate feedback
        detailed_feedback = []
        total_score = 0
        max_score = 0
        
        for answer in submission.answers:
            # Calculate score
            result = model_service.calculate_score(
                answer.question_text,
                answer.selected_option
            )
            
            score = result['score']
            level = result['level']
            total_score += score
            
            # Get max possible score for this question
            question_options = model_service.answer_sheet.get(answer.question_text, {})
            if question_options:
                max_score += max(opt['weight'] for opt in question_options.values())
            
            # Get personalized explanation
            explanation = model_service.get_explanation(
                answer.question_id,
                chr(65 + answer.selected_option_index),  # Convert to A, B, C, D
                submission.user_profile.dict()
            )
            
            # Get enhancement advice
            enhancement = model_service.get_enhancement_advice(
                answer.question_text,
                level
            )
            
            detailed_feedback.append(
                QuestionFeedback(
                    question_id=answer.question_id,
                    question_text=answer.question_text,
                    selected_option=answer.selected_option,
                    score=score,
                    level=level,
                    explanation=explanation,
                    enhancement_advice=enhancement
                )
            )
        
        # Calculate percentage and overall level
        percentage = (total_score / max_score * 100) if max_score > 0 else 0
        overall_level = model_service.get_overall_level(percentage)
        
        # Use ML model for awareness prediction
        ml_awareness_level = None
        ml_confidence = None
        ml_recommendations = None
        
        try:
            # Prepare answers for ML model
            answers_for_ml = [
                {
                    'question_text': ans.question_text,
                    'selected_option': ans.selected_option
                }
                for ans in submission.answers
            ]
            
            # Get ML prediction
            ml_awareness_level, ml_confidence = model_service.predict_awareness_level(
                answers_for_ml,
                submission.user_profile.dict()
            )
            
            # Get ML-based recommendations
            if ml_awareness_level != "Unknown":
                ml_recommendations = model_service.get_ml_based_recommendations(
                    ml_awareness_level,
                    ml_confidence,
                    submission.user_profile.dict()
                )
        except Exception as e:
            print(f"⚠️ ML prediction failed: {e}")
        
        # Prepare result for database
        db_record = {
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "email": submission.user_profile.email,
            "name": submission.user_profile.name,
            "organization": submission.user_profile.organization,
            "gender": submission.user_profile.gender,
            "education_level": submission.user_profile.education_level,
            "proficiency": submission.user_profile.proficiency,
            "total_score": total_score,
            "max_score": max_score,
            "percentage": round(percentage, 2),
            "overall_knowledge_level": overall_level,
            "ml_awareness_level": ml_awareness_level,
            "ml_confidence": round(ml_confidence, 4) if ml_confidence else None,
            "category": "App Permissions"
        }
        
        # Save to database
        saved = model_service.save_assessment(db_record)
        
        # Create result response
        result = AssessmentResult(
            timestamp=datetime.now().isoformat(),
            user_profile=submission.user_profile,
            total_score=total_score,
            max_score=max_score,
            percentage=round(percentage, 2),
            overall_knowledge_level=overall_level,
            detailed_feedback=detailed_feedback,
            ml_awareness_level=ml_awareness_level,
            ml_confidence=round(ml_confidence, 4) if ml_confidence else None,
            ml_recommendations=ml_recommendations,
            saved_to_database=saved,
            message="Assessment completed successfully with ML-based analysis!"
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing assessment: {str(e)}"
        )


@app.get("/api/stats", tags=["Statistics"])
async def get_statistics():
    """
    Get overall assessment statistics
    
    Returns aggregated statistics from all completed assessments.
    """
    try:
        import json
        
        db_path = model_service.assessment_db_path
        if not os.path.exists(db_path):
            return {
                "total_assessments": 0,
                "average_score": 0,
                "message": "No assessments found"
            }
        
        with open(db_path, 'r', encoding='utf-8') as f:
            database = json.load(f)
        
        assessments = database.get('assessments', [])
        
        if not assessments:
            return {
                "total_assessments": 0,
                "average_score": 0,
                "message": "No assessments found"
            }
        
        total = len(assessments)
        avg_score = sum(a.get('percentage', 0) for a in assessments) / total
        
        # Level distribution
        levels = {}
        for a in assessments:
            level = a.get('overall_knowledge_level', 'Unknown')
            levels[level] = levels.get(level, 0) + 1
        
        return {
            "total_assessments": total,
            "average_score": round(avg_score, 2),
            "level_distribution": levels,
            "message": "Statistics retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving statistics: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
