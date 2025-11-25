from pydantic import BaseModel, Field, EmailStr
from typing import List, Dict, Optional, Any
from datetime import datetime


class UserProfile(BaseModel):
    """User profile information for personalized feedback"""
    email: EmailStr
    name: str
    organization: Optional[str] = None
    gender: str = Field(..., description="Male or Female")
    education_level: str = Field(..., description="O/L, A/L, HND, or Degree")
    proficiency: str = Field(..., description="School or High Education")


class QuestionOption(BaseModel):
    """Individual question option"""
    text: str
    weight: int = Field(..., description="Score/marks for this option")
    level: str = Field(..., description="Knowledge level: basic, intermediate, advanced, wrong")


class Question(BaseModel):
    """Question structure"""
    id: str
    question: str
    options: List[QuestionOption]
    category: str = "Social Engineering"


class UserAnswer(BaseModel):
    """User's answer to a single question"""
    question_id: str
    question_text: str
    selected_option: str
    selected_option_index: int


class AssessmentSubmission(BaseModel):
    """Complete assessment submission"""
    user_profile: UserProfile
    answers: List[UserAnswer]


class QuestionFeedback(BaseModel):
    """Feedback for a single question"""
    question_id: str
    question_text: str
    selected_option: str
    score: int
    max_score: int
    level: str
    explanation: str
    enhancement_advice: str


class AssessmentResult(BaseModel):
    """Complete assessment result with feedback"""
    timestamp: str
    user_profile: UserProfile
    total_score: int
    max_score: int
    percentage: float
    overall_knowledge_level: str
    detailed_feedback: List[QuestionFeedback]
    ml_awareness_level: Optional[str] = None
    ml_confidence: Optional[float] = None
    ml_recommendations: Optional[List[str]] = None
    saved_to_database: bool
    message: str


class HealthCheck(BaseModel):
    """Health check response"""
    status: str
    timestamp: str
    model_loaded: bool
    components_status: Dict[str, bool]
