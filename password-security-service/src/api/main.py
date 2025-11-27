from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import List
import sys
from pathlib import Path
from dotenv import load_dotenv
import logging

PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Configure logging to suppress harmless client disconnect errors
logging.getLogger("uvicorn.error").setLevel(logging.WARNING)

from src.api.models import (
    Question, AssessmentSubmission, AssessmentResult,
    QuestionFeedback, HealthCheck, UserProfile
)
from src.core.service import model_service
from config.settings import settings

load_dotenv()

app = FastAPI(
    title="Password Security Assessment API",
    description="FastAPI microservice for password security assessment with ML-based scoring and personalized feedback",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Suppress harmless ASGI errors
import sys
if sys.version_info >= (3, 11):
    # Python 3.11+ uses ExceptionGroup
    @app.exception_handler(ExceptionGroup)
    async def exception_group_handler(request: Request, exc: ExceptionGroup):
        """Handle ExceptionGroup from ASGI middleware"""
        # Check if it's a client disconnect error
        for sub_exc in exc.exceptions:
            if isinstance(sub_exc, RuntimeError) and "Unexpected message received" in str(sub_exc):
                logging.debug(f"Client disconnected during request processing")
                return JSONResponse(status_code=200, content={"message": "Request processed"})
        raise exc


# Exception handler for client disconnections
@app.exception_handler(RuntimeError)
async def runtime_error_handler(request: Request, exc: RuntimeError):
    """Handle RuntimeError exceptions, particularly client disconnections"""
    error_msg = str(exc)
    if "Unexpected message received" in error_msg or "http.request" in error_msg:
        logging.debug(f"Client disconnected: {error_msg}")
        return JSONResponse(status_code=200, content={"message": "Request processed"})
    raise exc


@app.on_event("startup")
async def startup_event():
    """Load ML model and data on startup"""
    print("🚀 Starting Password Security Assessment API...")
    success = model_service.load_components()
    if not success:
        print("⚠️ Warning: Some components failed to load")
    else:
        print("✅ All components loaded successfully")


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Password Security Assessment API",
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
    """Get all password security assessment questions"""
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
    """Submit assessment answers and get detailed results with ML-powered personalized feedback"""
    try:
        detailed_feedback = []
        total_score = 0
        max_score = 0
        
        for answer in submission.answers:
            result = model_service.calculate_score(
                answer.question_text,
                answer.selected_option
            )
            
            score = result['score']
            level = result['level']
            total_score += score
            
            question_options = model_service.answer_sheet.get(answer.question_text, {})
            if question_options:
                max_score += max(opt['weight'] for opt in question_options.values())
            
            explanation = model_service.get_explanation(
                answer.question_id,
                chr(65 + answer.selected_option_index),
                submission.user_profile.dict()
            )
            
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
                    max_score=max_score,
                    level=level,
                    explanation=explanation,
                    enhancement_advice=enhancement
                )
            )
        
        percentage = (total_score / max_score * 100) if max_score > 0 else 0
        overall_level = model_service.get_overall_level(percentage)
        
        ml_awareness_level = None
        ml_confidence = None
        ml_recommendations = None
        
        try:
            answers_for_ml = [
                {
                    'question_text': ans.question_text,
                    'selected_option': ans.selected_option
                }
                for ans in submission.answers
            ]
            
            ml_awareness_level, ml_confidence = model_service.predict_awareness_level(
                answers_for_ml,
                submission.user_profile.dict()
            )
            
            if ml_awareness_level != "Unknown":
                ml_recommendations = model_service.get_ml_based_recommendations(
                    ml_awareness_level,
                    ml_confidence,
                    submission.user_profile.dict()
                )
        except Exception as e:
            print(f"⚠️ ML prediction failed: {e}")
        
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
            "category": "Password Security"
        }
        
        saved = model_service.save_assessment(db_record)
        
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


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "src.api.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        log_level="info"
    )
