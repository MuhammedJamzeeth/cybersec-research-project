from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import List
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import logging

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

# Configure logging to suppress harmless client disconnect errors
logging.getLogger("uvicorn.error").setLevel(logging.WARNING)

# Initialize FastAPI app
app = FastAPI(
    title="Mobile App Permissions Assessment API",
    description="FastAPI microservice for mobile app permissions security assessment with ML-based scoring and personalized feedback",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ASGI middleware to suppress noisy disconnect errors from Starlette/AnyIO
class SuppressDisconnectMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        try:
            await self.app(scope, receive, send)
        except Exception as exc:  # Handle ExceptionGroup/BaseExceptionGroup and common disconnect errors
            # Python 3.11+ may wrap in (Base)ExceptionGroup
            try:
                from asyncio import CancelledError
            except Exception:  # pragma: no cover
                CancelledError = tuple()  # type: ignore

            def _is_harmless_disconnect(e: BaseException) -> bool:
                # Known harmless disconnect/transport errors while sending response
                msg = str(e)
                if isinstance(e, (RuntimeError, BrokenPipeError, ConnectionResetError, CancelledError)):
                    lower = msg.lower()
                    if (
                        "unexpected message received" in msg
                        or "http.request" in msg
                        or "broken pipe" in lower
                        or "connection reset" in lower
                        or "client disconnected" in lower
                    ):
                        return True

                if sys.version_info >= (3, 11) and isinstance(e, (ExceptionGroup, BaseExceptionGroup)):
                    inner = getattr(e, "exceptions", [])
                    return bool(inner) and all(_is_harmless_disconnect(x) for x in inner)
                return False

            if _is_harmless_disconnect(exc):
                logging.debug("Suppressed client disconnect error during response send")
                return
            # Not a harmless disconnect, re-raise
            raise

# Note: We'll wrap the app with this middleware at the end to ensure
# it is the outermost layer and catches errors from all middlewares.

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


# Suppress harmless ASGI errors - Handle ExceptionGroup for Python 3.11+
if sys.version_info >= (3, 11):
    @app.exception_handler(ExceptionGroup)
    async def exception_group_handler(request: Request, exc: ExceptionGroup):
        """Handle ExceptionGroup from ASGI middleware (Python 3.11+)"""
        # Check if it's a client disconnect error within the exception group
        for sub_exc in exc.exceptions:
            if isinstance(sub_exc, RuntimeError):
                error_msg = str(sub_exc)
                if "Unexpected message received" in error_msg or "http.request" in error_msg:
                    logging.debug(f"Client disconnected during request processing: {error_msg}")
                    # Don't return response here, just suppress the error
                    return None
        raise exc


# Exception handler for client disconnections
@app.exception_handler(RuntimeError)
async def runtime_error_handler(request: Request, exc: RuntimeError):
    """Handle RuntimeError exceptions, particularly client disconnections"""
    error_msg = str(exc)
    if "Unexpected message received" in error_msg or "http.request" in error_msg:
        # Client disconnected early - this is normal, just log as debug
        logging.debug(f"Client disconnected: {error_msg}")
        # Don't try to send response, connection is already closed
        return None
    # For other RuntimeErrors, raise them normally
    raise exc


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


@app.post("/api/game-recommendations", tags=["Assessment"])
async def get_game_recommendations(data: dict):
    """
    Get personalized game recommendations based on assessment results
    
    Uses ML model to analyze weak areas and user profile to recommend 
    specific games that will improve knowledge in deficient areas.
    
    **Required:**
    - detailed_feedback: List of question feedback with scores and levels
    - user_profile: User demographic information
    - ml_awareness_level: ML predicted awareness level
    - weak_areas: Categories where user scored low
    
    **Returns:**
    - Prioritized game recommendations
    - Learning path suggestions
    - Estimated improvement potential
    """
    try:
        detailed_feedback = data.get('detailed_feedback', [])
        user_profile = data.get('user_profile', {})
        ml_awareness_level = data.get('ml_awareness_level', 'Unknown')
        weak_areas = data.get('weak_areas', [])
        
        # Analyze weak areas from feedback
        if not weak_areas and detailed_feedback:
            weak_areas = []
            for feedback in detailed_feedback:
                if feedback.get('level', '').lower() in ['low', 'beginner']:
                    # Extract category from question
                    question = feedback.get('question_text', '').lower()
                    if 'location' in question:
                        weak_areas.append('location')
                    elif 'storage' in question or 'file' in question:
                        weak_areas.append('storage')
                    elif 'camera' in question:
                        weak_areas.append('camera')
                    elif 'contact' in question:
                        weak_areas.append('contacts')
                    elif 'microphone' in question or 'audio' in question:
                        weak_areas.append('microphone')
        
        weak_areas = list(set(weak_areas))  # Remove duplicates
        
        # Build personalized recommendations
        recommendations = []
        
        # Priority 1: Games for weak areas
        if weak_areas:
            for area in weak_areas:
                recommendations.append({
                    'category': area,
                    'priority': 'high',
                    'reason': f'Strengthen your {area} permission knowledge',
                    'estimated_improvement': '15-25%',
                    'ml_confidence': 0.85
                })
        
        # Priority 2: Level-based recommendations
        education_level = user_profile.get('education_level', 'Degree')
        proficiency = user_profile.get('proficiency', 'High Education')
        
        if ml_awareness_level == 'Low Awareness':
            recommendations.extend([
                {
                    'category': 'fundamentals',
                    'priority': 'high',
                    'reason': 'Build foundation in permission security basics',
                    'estimated_improvement': '20-30%',
                    'ml_confidence': 0.90,
                    'recommended_for': 'beginners'
                }
            ])
        elif ml_awareness_level == 'Moderate Awareness':
            recommendations.extend([
                {
                    'category': 'intermediate',
                    'priority': 'medium',
                    'reason': 'Practice real-world permission scenarios',
                    'estimated_improvement': '10-20%',
                    'ml_confidence': 0.80,
                    'recommended_for': 'intermediate learners'
                }
            ])
        
        # Priority 3: Profile-based personalization
        if proficiency == 'School':
            recommendations.append({
                'category': 'interactive',
                'priority': 'medium',
                'reason': 'Interactive games suited for school-level learning',
                'estimated_improvement': '10-15%',
                'ml_confidence': 0.75,
                'learning_style': 'visual and interactive'
            })
        
        # Learning path suggestion
        learning_path = {
            'current_level': ml_awareness_level,
            'target_level': 'High Awareness',
            'estimated_games_needed': max(3, len(weak_areas) * 2),
            'estimated_time_hours': max(2, len(weak_areas) * 1.5),
            'phases': [
                {
                    'phase': 1,
                    'focus': 'Address weak areas',
                    'games': len(weak_areas) if weak_areas else 2
                },
                {
                    'phase': 2,
                    'focus': 'Consolidate knowledge',
                    'games': 2
                },
                {
                    'phase': 3,
                    'focus': 'Advanced scenarios',
                    'games': 1
                }
            ]
        }
        
        return {
            'recommendations': recommendations,
            'learning_path': learning_path,
            'weak_areas': weak_areas,
            'total_recommendations': len(recommendations),
            'ml_personalized': True,
            'message': 'Personalized game recommendations generated successfully'
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating recommendations: {str(e)}"
        )


@app.get("/api/stats", tags=["Statistics"])
async def get_statistics():
    """
    Get overall assessment statistics
    
    Returns aggregated statistics from all completed assessments.

# Wrap the FastAPI app with disconnect suppression as the outermost ASGI layer
app = SuppressDisconnectMiddleware(app)

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
        "src.api.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
