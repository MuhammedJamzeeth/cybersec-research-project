import pandas as pd
import json
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import warnings
import os
warnings.filterwarnings('ignore')


class SafeBrowsingModelTrainer:
    def __init__(self, dataset_path, answer_sheet_path):
        self.dataset_path = dataset_path
        self.answer_sheet_path = answer_sheet_path
        self.model = None
        self.answer_weights = None
        self.questions = None

    def load_answer_sheet(self):
        """Load weighted answers from JSON file"""
        try:
            with open(self.answer_sheet_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            raise FileNotFoundError(f"Could not open answer sheet '{self.answer_sheet_path}': {e}")

        self.answer_weights = {}

        if 'questions' in data and isinstance(data['questions'], list):
            for q_item in data['questions']:
                question_text = q_item.get('question')
                if not question_text:
                    continue
                options_dict = {}

                for option in q_item.get('options', []):
                    text = option.get('text', '')
                    marks = option.get('marks', 0)
                    level = option.get('level', 'basic')
                    options_dict[text] = {
                        'weight': marks,
                        'level': level
                    }

                self.answer_weights[question_text] = options_dict

        self.questions = list(self.answer_weights.keys())
        print(f"✅ Loaded {len(self.questions)} safe browsing questions from answer sheet")

    def load_dataset(self):
        """Load and preprocess the dataset"""
        self.df = pd.read_csv(self.dataset_path)
        print(f"\nOriginal dataset shape: {self.df.shape}")
        print(f"Columns: {list(self.df.columns)}")
        
        # Remove demographic columns (keep gender, proficiency, education for features)
        columns_to_remove = []
        for col in ['Respondent_ID', 'Timestamp']:
            if col in self.df.columns:
                self.df = self.df.drop(columns=[col])
                columns_to_remove.append(col)
        
        if columns_to_remove:
            print(f"Removed columns: {columns_to_remove}")
        
        print(f"Filtered dataset shape: {self.df.shape}")
        return self.df

    def calculate_user_scores(self):
        """Calculate scores for each user based on weighted answers"""
        scores = []
        matched_questions = []

        # Identify which questions exist in the dataset
        for question in self.questions:
            if question in self.df.columns:
                matched_questions.append(question)

        print(f"\nUsing {len(matched_questions)} matched questions for scoring")

        if len(matched_questions) == 0:
            raise ValueError("No questions from answer sheet match dataset columns!")

        for index, row in self.df.iterrows():
            user_score = 0

            for question in matched_questions:
                user_answer = str(row[question]).strip()
                question_weights = self.answer_weights[question]

                # Find matching weight for user's answer
                for answer_option, weight_info in question_weights.items():
                    if user_answer.lower() == answer_option.lower():
                        user_score += weight_info['weight']
                        break

            scores.append(user_score)

        self.df['total_score'] = scores

        # Calculate max possible score
        max_possible_score = 0
        for question in matched_questions:
            question_weights = self.answer_weights[question]
            max_weight = max(info['weight'] for info in question_weights.values())
            max_possible_score += max_weight

        print(f"Max possible score: {max_possible_score}")

        self.df['percentage'] = (np.array(scores) / max_possible_score) * 100 if max_possible_score > 0 else 0
        return scores

    def classify_awareness_level(self):
        """Classify users into safe browsing awareness levels"""
        def get_level(percentage):
            if percentage >= 80:
                return 'High Awareness'
            elif percentage >= 60:
                return 'Moderate Awareness'
            else:
                return 'Low Awareness'

        self.df['awareness_level'] = self.df['percentage'].apply(get_level)

        print("\nSafe Browsing Awareness level distribution:")
        print(self.df['awareness_level'].value_counts())

        return self.df['awareness_level']

    def prepare_features(self):
        """Prepare features for ML training"""
        feature_columns = []
        matched_questions = [q for q in self.questions if q in self.df.columns]

        print(f"\nPreparing features from {len(matched_questions)} questions...")

        for question in matched_questions:
            dummies = pd.get_dummies(self.df[question], prefix=f"Q_{len(feature_columns)}")
            feature_columns.extend(dummies.columns)
            self.df = pd.concat([self.df, dummies], axis=1)

        print(f"Total features created: {len(feature_columns)}")

        if len(feature_columns) == 0:
            raise ValueError("No features could be created!")

        X = self.df[feature_columns]
        y = self.df['awareness_level']

        return X, y, feature_columns

    def train_model(self):
        """Train Logistic Regression model for safe browsing awareness classification"""
        print("\n" + "="*70)
        print("🚀 TRAINING SAFE BROWSING AWARENESS MODEL")
        print("="*70)

        # Load answer sheet
        self.load_answer_sheet()

        # Load dataset
        self.load_dataset()

        # Calculate scores
        self.calculate_user_scores()

        # Classify awareness levels
        self.classify_awareness_level()

        # Prepare features
        X, y, feature_columns = self.prepare_features()

        # Split dataset
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        print(f"\nTraining set size: {X_train.shape[0]}")
        print(f"Testing set size: {X_test.shape[0]}")

        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Train Logistic Regression model
        print("\nTraining Logistic Regression model...")
        model = LogisticRegression(max_iter=1000, random_state=42, multi_class='ovr')
        model.fit(X_train_scaled, y_train)

        # Evaluate model
        y_pred = model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)

        print("\n" + "="*70)
        print("📊 MODEL EVALUATION")
        print("="*70)
        print(f"Accuracy: {accuracy:.2%}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))

        # Save model, scaler, and feature names
        models_dir = 'models'
        os.makedirs(models_dir, exist_ok=True)

        model_path = os.path.join(models_dir, 'safe_browsing_model.pkl')
        scaler_path = os.path.join(models_dir, 'safe_browsing_scaler.pkl')
        feature_names_path = os.path.join(models_dir, 'safe_browsing_feature_names.pkl')

        joblib.dump(model, model_path)
        joblib.dump(scaler, scaler_path)
        joblib.dump(feature_columns, feature_names_path)

        print("\n" + "="*70)
        print("💾 MODEL SAVED")
        print("="*70)
        print(f"Model: {model_path}")
        print(f"Scaler: {scaler_path}")
        print(f"Features: {feature_names_path}")

        self.model = model
        return model, accuracy
