import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from config.settings import settings


class ModelService:
    """Service for loading and managing the ML model and data with ML-based predictions"""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.answer_sheet = {}
        self.questions_data = []
        self.explanation_bank = []
        self.mongo_client = None
        self.db = None
        self.assessments_collection = None
        self._init_mongodb()
    
    def _init_mongodb(self):
        """Initialize MongoDB connection"""
        try:
            mongo_uri = settings.MONGO_URI
            self.mongo_client = MongoClient(mongo_uri)
            self.mongo_client.admin.command('ping')
            self.db = self.mongo_client.get_default_database()
            self.assessments_collection = self.db['device_assessments']
            print(f"✅ Connected to MongoDB: {self.db.name}")
        except ConnectionFailure as e:
            print(f"⚠️ MongoDB connection failed: {e}")
        except Exception as e:
            print(f"⚠️ MongoDB initialization error: {e}")
        
    def load_components(self):
        """Load all required components"""
        try:
            answer_sheet_path = settings.get_absolute_path(settings.ANSWER_SHEET_PATH)
            try:
                with open(answer_sheet_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                if 'questions' in data and isinstance(data['questions'], list):
                    for q_item in data['questions']:
                        question_text = q_item.get('question')
                        options_dict = {}
                        
                        for option in q_item.get('options', []):
                            options_dict[option.get('text')] = {
                                'weight': option.get('marks'),
                                'level': option.get('level')
                            }
                        
                        if question_text:
                            self.answer_sheet[question_text] = options_dict
                            self.questions_data.append(q_item)
                
                print(f"✅ Loaded {len(self.questions_data)} questions from answer sheet")
            except FileNotFoundError:
                print("⚠️ Answer sheet not found - service running with empty questions")
            
            try:
                explanation_path = settings.get_absolute_path(settings.EXPLANATION_BANK_PATH)
                with open(explanation_path, 'r', encoding='utf-8') as f:
                    self.explanation_bank = json.load(f)
                print(f"✅ Loaded {len(self.explanation_bank)} explanations")
            except FileNotFoundError:
                print("⚠️ Explanation bank not found, using fallback explanations")
                self.explanation_bank = []
            
            try:
                model_path = settings.get_absolute_path(settings.MODEL_PATH)
                self.model = joblib.load(model_path)
                print("✅ Loaded trained ML model")
            except Exception as e:
                print(f"⚠️ Could not load model: {e}")
                self.model = None
            
            try:
                scaler_path = settings.get_absolute_path(settings.SCALER_PATH)
                self.scaler = joblib.load(scaler_path)
                print("✅ Loaded feature scaler")
            except Exception as e:
                print(f"⚠️ Could not load scaler: {e}")
                self.scaler = None
            
            try:
                feature_names_path = settings.get_absolute_path(settings.FEATURE_NAMES_PATH)
                self.feature_names = joblib.load(feature_names_path)
                print(f"✅ Loaded {len(self.feature_names)} feature names")
            except Exception as e:
                print(f"⚠️ Could not load feature names: {e}")
                self.feature_names = None
            
            return True
            
        except Exception as e:
            print(f"❌ Error loading components: {e}")
            return False
    
    def get_questions(self) -> List[Dict]:
        """Get all questions with options"""
        questions = []
        for idx, q_item in enumerate(self.questions_data, 1):
            question_id = q_item.get('questionId', f"Q{idx:02d}")
            questions.append({
                'id': question_id,
                'question': q_item.get('question'),
                'options': [
                    {
                        'text': opt.get('text'),
                        'weight': opt.get('marks'),
                        'level': opt.get('level')
                    }
                    for opt in q_item.get('options', [])
                ],
                'category': 'Device Security'
            })
        return questions
    
    def calculate_score(self, question_text: str, selected_option: str) -> Dict:
        """Calculate score for a single answer"""
        if question_text in self.answer_sheet:
            options = self.answer_sheet[question_text]
            if selected_option in options:
                return {
                    'score': options[selected_option]['weight'],
                    'level': options[selected_option]['level']
                }
        return {'score': 0, 'level': 'wrong'}
    
    def get_explanation(self, question_id: str, option: str, user_profile: Dict) -> str:
        """Get fully personalized explanation based on user demographics"""
        gender = user_profile.get('gender', 'Male')
        education = user_profile.get('education_level', 'Degree')
        proficiency = user_profile.get('proficiency', 'High')
        
        normalized_qid = question_id
        if question_id.startswith('Q0'):
            normalized_qid = question_id.replace('Q0', 'Q')
        
        if proficiency in ['School', 'school']:
            proficiency = 'School'
        elif proficiency in ['High', 'High Education', 'high', 'high education']:
            proficiency = 'High'
        
        for exp in self.explanation_bank:
            if (exp.get('questionId') == normalized_qid and 
                exp.get('option') == option):
                profile = exp.get('profile', {})
                if (profile.get('gender') == gender and
                    profile.get('education') == education and
                    profile.get('proficiency') == proficiency):
                    return exp.get('explanation', '')
        
        for exp in self.explanation_bank:
            if (exp.get('questionId') == normalized_qid and 
                exp.get('option') == option):
                profile = exp.get('profile', {})
                if (profile.get('gender') == gender and
                    profile.get('education') == education):
                    return exp.get('explanation', '')
        
        for exp in self.explanation_bank:
            if (exp.get('questionId') == normalized_qid and 
                exp.get('option') == option):
                return exp.get('explanation', '')
        
        return f"Consider reviewing your understanding of device security. Focus on best practices."
    
    def get_enhancement_advice(self, question_text: str, level: str) -> str:
        """Get enhancement advice based on performance level"""
        level_lower = level.lower()
        advice_map = {
            'wrong': 'Review the fundamentals of device security and protection measures.',
            'beginner': 'Good start! Deepen your understanding of device security.',
            'basic': 'Good start! Deepen your understanding of device security.',
            'intermediate': 'Well done! Consider exploring advanced device protection techniques.',
            'advanced': 'Excellent! Stay updated with latest device security practices.'
        }
        return advice_map.get(level_lower, 'Continue learning about device security.')
    
    def save_assessment(self, result: Dict) -> bool:
        """Save assessment result to MongoDB"""
        try:
            if self.assessments_collection is None:
                return False
            
            assessment_doc = {
                'timestamp': result.get('timestamp'),
                'user_profile': result.get('user_profile', {}),
                'total_score': result.get('total_score', 0),
                'max_score': result.get('max_score', 0),
                'percentage': result.get('percentage', 0),
                'overall_knowledge_level': result.get('overall_knowledge_level', 'Beginner'),
                'detailed_feedback': result.get('detailed_feedback', []),
                'category': 'device-security',
                'created_at': datetime.now()
            }
            
            insert_result = self.assessments_collection.insert_one(assessment_doc)
            return True
            
        except Exception as e:
            print(f"❌ Error saving assessment to MongoDB: {e}")
            return False
    
    def get_overall_level(self, percentage: float) -> str:
        """Determine overall knowledge level based on percentage"""
        if percentage >= 80:
            return "Advanced"
        elif percentage >= 60:
            return "Intermediate"
        elif percentage >= 40:
            return "Basic"
        else:
            return "Beginner"
    
    def prepare_features(self, answers: List[Dict], user_profile: Dict) -> Optional[np.ndarray]:
        """Prepare feature vector from user answers for ML model prediction"""
        if not self.feature_names or not self.model:
            return None
        
        try:
            features = {feature: 0 for feature in self.feature_names}
            
            for idx, answer in enumerate(answers):
                selected_option = answer.get('selected_option', '')
                feature_name = f"Q_{idx}_{selected_option}"
                
                if feature_name in features:
                    features[feature_name] = 1
            
            feature_vector = np.array([features[f] for f in self.feature_names]).reshape(1, -1)
            return feature_vector
            
        except Exception as e:
            return None
    
    def predict_awareness_level(self, answers: List[Dict], user_profile: Dict) -> Tuple[str, float]:
        """Use ML model to predict user's awareness level"""
        if not self.model or not self.scaler:
            return "Unknown", 0.0
        
        try:
            features = self.prepare_features(answers, user_profile)
            if features is None:
                return "Unknown", 0.0
            
            features_scaled = self.scaler.transform(features)
            prediction = self.model.predict(features_scaled)[0]
            prediction_proba = self.model.predict_proba(features_scaled)[0]
            confidence = max(prediction_proba)
            
            if isinstance(prediction, str):
                awareness_map_str = {
                    'Beginner': "Low Awareness",
                    'Basic': "Low Awareness",
                    'Intermediate': "Moderate Awareness",
                    'Advanced': "High Awareness",
                    'Expert': "High Awareness"
                }
                awareness_level = awareness_map_str.get(prediction, "Unknown")
            else:
                awareness_map_num = {
                    0: "Low Awareness",
                    1: "Moderate Awareness",
                    2: "High Awareness"
                }
                awareness_level = awareness_map_num.get(prediction, "Unknown")
            
            return awareness_level, confidence
            
        except Exception as e:
            return "Unknown", 0.0
    
    def get_ml_based_recommendations(self, awareness_level: str, confidence: float, 
                                     user_profile: Dict) -> List[str]:
        """Generate personalized recommendations based on ML prediction and user profile"""
        recommendations = []
        
        education = user_profile.get('education_level', 'Degree')
        
        if awareness_level == "Low Awareness":
            recommendations.append(
                "Your assessment indicates you need to strengthen your safe browsing knowledge. "
                "Start with basic online safety concepts."
            )
            if education in ['O/L', 'A/L']:
                recommendations.append("Consider taking online courses on safe browsing and internet security.")
            else:
                recommendations.append("Review documentation on safe browsing policies and best practices.")
                
        elif awareness_level == "Moderate Awareness":
            recommendations.append(
                f"You have a moderate understanding (confidence: {confidence:.1%}). "
                "Focus on advanced safe browsing techniques."
            )
            recommendations.append("Study VPN usage, secure connections, and browser security settings.")
            
        elif awareness_level == "High Awareness":
            recommendations.append(
                f"Excellent! Your awareness is high (confidence: {confidence:.1%}). "
                "Continue staying updated with latest browsing security practices."
            )
            recommendations.append("Explore advanced topics like browser hardening and privacy tools.")
        
        return recommendations
    
    def get_score_based_recommendations(self, percentage: float, user_profile: Dict) -> List[str]:
        """Generate recommendations based on score when ML model is not available"""
        recommendations = []
        
        education = user_profile.get('education_level', 'Degree')
        
        if percentage < 50:
            recommendations.append(
                f"Your score of {percentage:.1f}% indicates you need to strengthen your safe browsing knowledge. "
                "Focus on understanding HTTPS, secure downloads, and recognizing unsafe websites."
            )
            recommendations.append("Start with the basics: learn about secure connections, verify links before clicking, and use trusted sources for downloads.")
            if education in ['O/L', 'A/L', 'School O/L', 'School A/L']:
                recommendations.append("Consider taking beginner-friendly online courses on internet safety.")
            
        elif percentage < 70:
            recommendations.append(
                f"Your score of {percentage:.1f}% shows moderate understanding. "
                "Improve your knowledge of VPNs, browser security, and safe browsing habits."
            )
            recommendations.append("Focus on advanced topics like zero-day vulnerabilities, browser cookies, and secure Wi-Fi usage.")
            
        elif percentage < 90:
            recommendations.append(
                f"Good performance at {percentage:.1f}%! "
                "Enhance your skills by learning about advanced browser security features and privacy tools."
            )
            recommendations.append("Explore browser extensions for security, privacy-focused browsers, and advanced threat detection.")
            
        else:
            recommendations.append(
                f"Excellent score of {percentage:.1f}%! "
                "Your safe browsing knowledge is strong. Stay updated with emerging threats and new security features."
            )
            recommendations.append("Keep learning about the latest cybersecurity trends, zero-day exploits, and advanced privacy protection techniques.")
        
        return recommendations
    
    def check_status(self) -> Dict:
        """Check status of all components"""
        return {
            'model_loaded': self.model is not None,
            'scaler_loaded': self.scaler is not None,
            'feature_names_loaded': self.feature_names is not None,
            'answer_sheet_loaded': len(self.answer_sheet) > 0,
            'questions_loaded': len(self.questions_data) > 0,
            'explanation_bank_loaded': len(self.explanation_bank) > 0,
        }


model_service = ModelService()
