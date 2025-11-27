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

# Add project root to path
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
            # Test connection
            self.mongo_client.admin.command('ping')
            self.db = self.mongo_client.get_default_database()
            self.assessments_collection = self.db['appperm_assessments']
            print(f"✅ Connected to MongoDB: {self.db.name}")
        except ConnectionFailure as e:
            print(f"⚠️ MongoDB connection failed: {e}")
            print("   Assessment results will not be saved to database")
        except Exception as e:
            print(f"⚠️ MongoDB initialization error: {e}")
        
    def load_components(self):
        """Load all required components"""
        try:
            # Load answer sheet
            answer_sheet_path = settings.get_absolute_path(settings.ANSWER_SHEET_PATH)
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
            
            # Load explanation bank
            try:
                explanation_path = settings.get_absolute_path(settings.EXPLANATION_BANK_PATH)
                with open(explanation_path, 'r', encoding='utf-8') as f:
                    self.explanation_bank = json.load(f)
                print(f"✅ Loaded {len(self.explanation_bank)} explanations")
            except FileNotFoundError:
                print("⚠️ Explanation bank not found, using fallback explanations")
                self.explanation_bank = []
            
            # Load trained ML model
            try:
                model_path = settings.get_absolute_path(settings.MODEL_PATH)
                self.model = joblib.load(model_path)
                print("✅ Loaded trained ML model")
            except Exception as e:
                print(f"⚠️ Could not load model: {e}")
                self.model = None
            
            # Load scaler
            try:
                scaler_path = settings.get_absolute_path(settings.SCALER_PATH)
                self.scaler = joblib.load(scaler_path)
                print("✅ Loaded feature scaler")
            except Exception as e:
                print(f"⚠️ Could not load scaler: {e}")
                self.scaler = None
            
            # Load feature names
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
            # Use questionId from answer sheet if available, otherwise generate
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
                'category': 'App Permissions'
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
        """Get fully personalized explanation based on user demographics.
        Guarantees a non-empty string by skipping empty exp records and using a
        sensible default when no suitable match is found.
        """
        # Extract user profile details
        gender = user_profile.get('gender', 'Male')
        education = user_profile.get('education_level', 'Degree')
        proficiency = user_profile.get('proficiency', 'High')
        
        # Normalize question ID: Q01 -> Q1, map1 -> Q1, etc.
        normalized_qid = question_id
        if question_id.startswith('map'):
            # Convert map1 -> Q1, map10 -> Q10
            num = question_id.replace('map', '')
            normalized_qid = f"Q{num}"
        elif question_id.startswith('Q0'):
            # Convert Q01 -> Q1
            normalized_qid = question_id.replace('Q0', 'Q')
        
        # Normalize proficiency values to match explanation bank
        if proficiency in ['School', 'school']:
            proficiency = 'School'
        elif proficiency in ['High', 'High Education', 'high', 'high education']:
            proficiency = 'High'
        
        print(f"🔍 Looking for explanation: Q={normalized_qid}, Option={option}, Gender={gender}, Edu={education}, Prof={proficiency}")
        
        # Helper to extract explanation text safely (non-empty)
        def _get_text(exp_obj: Dict) -> Optional[str]:
            text = exp_obj.get('explanation')
            if isinstance(text, str) and text.strip():
                return text
            return None

        # Search explanation bank for exact match
        for exp in self.explanation_bank:
            if (exp.get('questionId') == normalized_qid and 
                exp.get('option') == option):
                profile = exp.get('profile', {})
                if (profile.get('gender') == gender and
                    profile.get('education') == education and
                    profile.get('proficiency') == proficiency):
                    txt = _get_text(exp)
                    if txt:
                        print(f"✅ Found exact match!")
                        return txt
        
        # Fallback: Try without proficiency match
        for exp in self.explanation_bank:
            if (exp.get('questionId') == normalized_qid and 
                exp.get('option') == option):
                profile = exp.get('profile', {})
                if (profile.get('gender') == gender and
                    profile.get('education') == education):
                    txt = _get_text(exp)
                    if txt:
                        print(f"⚠️ Found partial match (no proficiency match)")
                        return txt
        
        # Try just question and option match
        for exp in self.explanation_bank:
            if (exp.get('questionId') == normalized_qid and 
                exp.get('option') == option):
                txt = _get_text(exp)
                if txt:
                    print(f"⚠️ Found basic match (question + option only)")
                    return txt
        
        # Final fallback
        print(f"❌ No explanation found or explanation text empty for Q={normalized_qid}, Option={option}")
        return (
            "Consider reviewing your understanding of app permissions. "
            "Focus on why apps request specific permissions and how to grant only what's necessary."
        )
    
    def get_enhancement_advice(self, question_text: str, level: str) -> str:
        """Get enhancement advice based on performance level"""
        # Normalize level to lowercase for matching
        level_lower = level.lower()
        advice_map = {
            'wrong': 'Review the fundamentals of app permissions and their importance for mobile security.',
            'beginner': 'Good start! Deepen your understanding of permission types and their implications.',
            'basic': 'Good start! Deepen your understanding of permission types and their implications.',
            'intermediate': 'Well done! Consider exploring advanced permission management techniques.',
            'advanced': 'Excellent! Stay updated with latest mobile security best practices.'
        }
        return advice_map.get(level_lower, 'Continue learning about mobile app security.')
    
    def save_assessment(self, result: Dict) -> bool:
        """Save assessment result to MongoDB"""
        try:
            if self.assessments_collection is None:
                print("⚠️ MongoDB not connected, assessment not saved")
                return False
            
            # Prepare document for MongoDB
            assessment_doc = {
                'timestamp': result.get('timestamp'),
                'user_profile': result.get('user_profile', {}),
                'total_score': result.get('total_score', 0),
                'max_score': result.get('max_score', 0),
                'percentage': result.get('percentage', 0),
                'overall_knowledge_level': result.get('overall_knowledge_level', 'Beginner'),
                'detailed_feedback': result.get('detailed_feedback', []),
                'category': 'mobile-app-permissions',
                'created_at': datetime.now()
            }
            
            # Insert into MongoDB
            insert_result = self.assessments_collection.insert_one(assessment_doc)
            print(f"✅ Assessment saved to MongoDB: {insert_result.inserted_id}")
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
            print("⚠️ Model or feature names not loaded")
            return None
        
        try:
            # Create feature dictionary - all zeros initially
            features = {feature: 0 for feature in self.feature_names}
            
            print(f"📊 Preparing features for {len(answers)} answers...")
            
            # Encode user answers
            for idx, answer in enumerate(answers):
                selected_option = answer.get('selected_option', '')
                
                # The feature format is: Q_<index>_<option_text>
                # Questions are indexed as: 0, 4, 8, 12, 16, 21, 25, 29, 33, 37
                # which corresponds to question 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
                question_indices = [0, 4, 8, 12, 16, 21, 25, 29, 33, 37]
                
                if idx < len(question_indices):
                    q_index = question_indices[idx]
                    
                    # Build the expected feature name
                    feature_name = f"Q_{q_index}_{selected_option}"
                    
                    # Set this feature to 1
                    if feature_name in features:
                        features[feature_name] = 1
                        print(f"  ✅ Q{idx+1}: Matched feature '{feature_name}'")
                    else:
                        print(f"  ⚠️ Q{idx+1}: Feature '{feature_name}' not found in feature list")
                        # Try fuzzy matching
                        for feat in self.feature_names:
                            if f"Q_{q_index}_" in feat and selected_option in feat:
                                features[feat] = 1
                                print(f"    ↪️ Used fuzzy match: '{feat}'")
                                break
            
            # Convert to numpy array in correct order
            feature_vector = np.array([features[f] for f in self.feature_names]).reshape(1, -1)
            active_features = sum(feature_vector[0])
            print(f"📈 Feature vector created: {len(self.feature_names)} features, {int(active_features)} active")
            
            return feature_vector
            
        except Exception as e:
            print(f"❌ Error preparing features: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def predict_awareness_level(self, answers: List[Dict], user_profile: Dict) -> Tuple[str, float]:
        """Use ML model to predict user's awareness level"""
        if not self.model or not self.scaler:
            print("⚠️ ML model or scaler not loaded")
            return "Unknown", 0.0
        
        try:
            print(f"\n🤖 Starting ML Prediction...")
            print(f"   User: {user_profile.get('gender')}, {user_profile.get('education_level')}, {user_profile.get('proficiency')}")
            
            # Prepare features
            features = self.prepare_features(answers, user_profile)
            if features is None:
                print("❌ Feature preparation failed")
                return "Unknown", 0.0
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            print(f"✅ Features scaled successfully")
            
            # Predict
            prediction = self.model.predict(features_scaled)[0]
            prediction_proba = self.model.predict_proba(features_scaled)[0]
            confidence = max(prediction_proba)
            
            # Get model classes to understand the prediction format
            model_classes = self.model.classes_ if hasattr(self.model, 'classes_') else None
            print(f"🔍 Model classes: {model_classes}")
            print(f"🔍 Raw prediction: {prediction} (type: {type(prediction).__name__})")
            
            # Map prediction to awareness level
            # Handle both string and numeric predictions
            if isinstance(prediction, str):
                # Model was trained with string labels
                awareness_map_str = {
                    'Beginner': "Low Awareness",
                    'Basic': "Low Awareness",
                    'Intermediate': "Moderate Awareness",
                    'Advanced': "High Awareness",
                    'Expert': "High Awareness"  # Added mapping for perfect scores (100%)
                }
                awareness_level = awareness_map_str.get(prediction, "Unknown")
            else:
                # Model was trained with numeric labels
                awareness_map_num = {
                    0: "Low Awareness",
                    1: "Moderate Awareness",
                    2: "High Awareness"
                }
                awareness_level = awareness_map_num.get(prediction, "Unknown")
            
            print(f"🎯 Prediction: {awareness_level} (raw: {prediction})")
            print(f"📊 Probabilities: {[f'{prob:.3f}' for prob in prediction_proba]}")
            print(f"✨ Confidence: {confidence:.3f}")
            
            return awareness_level, confidence
            
        except Exception as e:
            print(f"❌ Error in ML prediction: {e}")
            import traceback
            traceback.print_exc()
            return "Unknown", 0.0
    
    def get_ml_based_recommendations(self, awareness_level: str, confidence: float, 
                                     user_profile: Dict) -> List[str]:
        """Generate personalized recommendations based on ML prediction and user profile"""
        recommendations = []
        
        education = user_profile.get('education_level', 'Degree')
        proficiency = user_profile.get('proficiency', 'High')
        gender = user_profile.get('gender', 'Male')
        
        # Base recommendations on awareness level
        if awareness_level == "Low Awareness":
            recommendations.append(
                "Your assessment indicates you need to strengthen your understanding of app permissions. "
                "Start with basic security concepts."
            )
            if education in ['O/L', 'A/L']:
                recommendations.append(
                    "Consider taking online courses on mobile security basics. "
                    "Focus on understanding why apps need permissions."
                )
            else:
                recommendations.append(
                    "Review documentation on Android and iOS permission models. "
                    "Practice analyzing real app permission requests."
                )
                
        elif awareness_level == "Moderate Awareness":
            recommendations.append(
                f"You have a moderate understanding (confidence: {confidence:.1%}). "
                "Focus on advanced permission scenarios."
            )
            recommendations.append(
                "Study runtime permissions, dangerous permissions, and privacy implications."
            )
            
        elif awareness_level == "High Awareness":
            recommendations.append(
                f"Excellent! Your awareness is high (confidence: {confidence:.1%}). "
                "Continue staying updated with latest security practices."
            )
            recommendations.append(
                "Explore advanced topics like permission groups, special permissions, and security auditing."
            )
        
        # Add proficiency-specific advice
        if proficiency in ['School', 'school']:
            recommendations.append(
                "Keep learning! Mobile security is an important skill for your digital safety."
            )
        else:
            recommendations.append(
                "Share your knowledge with others and consider contributing to mobile security awareness."
            )
        
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


# Singleton instance
model_service = ModelService()
