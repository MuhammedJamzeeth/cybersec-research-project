# ML Model Training Guide

## Overview

This guide explains how to train ML models for all cybersecurity assessment services using your existing training data.

## Available Training Data

### ✅ Services with Training Data

1. **Phishing Detection Service**
   - Dataset: `phishing_detection.csv` (1,122 rows)
   - Answer Sheet: `answer_sheet_phishing.json` (10 questions)
2. **Password Security Service**
   - Dataset: `password.csv` (1,256 rows)
   - Answer Sheet: `answer_sheet_password.json` (10 questions)
3. **Social Engineering Service**
   - Dataset: `social-eng.csv` (1,347 rows)
   - Answer Sheet: `answer_sheet_social.json` (10 questions)

### ❌ Services without Training Data

4. **Device Security Service** - No CSV file (only answer sheet and explanations)
5. **App Permission Service** - Already has trained models ✅

## Quick Start - Train All Models

### Option 1: Train All Services at Once

```powershell
.\train-all-models.ps1
```

This script will:

- Train models for Phishing, Password, and Social Engineering services
- Show progress for each service
- Display summary with success/failure count
- Save models to each service's `models/` directory

### Option 2: Train Individual Services

#### Phishing Detection

```powershell
cd phishing-detection-service
python train_model.py
```

#### Password Security

```powershell
cd password-security-service
python train_model.py
```

#### Social Engineering

```powershell
cd social-engineering-service
python train_model.py
```

## What the Training Process Does

1. **Loads Answer Sheet** - Reads correct answers and scoring weights
2. **Loads Training Data** - Reads CSV with user responses
3. **Calculates Scores** - Scores each response based on answer sheet
4. **Classifies Awareness** - Categorizes users into:
   - **High Awareness** (80%+)
   - **Moderate Awareness** (60-79%)
   - **Low Awareness** (<60%)
5. **Prepares Features** - Converts responses to ML features
6. **Trains Model** - Uses Logistic Regression
7. **Evaluates Accuracy** - Tests on holdout data
8. **Saves Models** - Creates 3 files:
   - `{service}_model.pkl` - Trained model
   - `{service}_scaler.pkl` - Feature scaler
   - `{service}_feature_names.pkl` - Feature mappings

## Output Files

After training, each service will have in its `models/` directory:

### Phishing Detection

```
phishing-detection-service/models/
├── phishing_model.pkl
├── phishing_scaler.pkl
└── phishing_feature_names.pkl
```

### Password Security

```
password-security-service/models/
├── password_model.pkl
├── password_scaler.pkl
└── password_feature_names.pkl
```

### Social Engineering

```
social-engineering-service/models/
├── social_model.pkl
├── social_scaler.pkl
└── social_feature_names.pkl
```

## Expected Results

Based on the training data size and quality, you should see:

- **Accuracy**: 75-95% (varies by dataset)
- **Training Time**: 5-30 seconds per service
- **Model Size**: ~50-200 KB per service

## After Training

Once models are trained, the services will:

1. **Load Models on Startup** ✅

   - Services automatically detect and load `.pkl` files
   - Shows "✅ Loaded trained ML model" in logs

2. **Provide ML Predictions** ✅

   - `ml_awareness_level`: High/Moderate/Low Awareness
   - `ml_confidence`: Prediction confidence (0-1)
   - `ml_recommendations`: Personalized advice

3. **Display in Frontend** ✅
   - ML section appears after assessment
   - Shows awareness level with confidence
   - Displays personalized recommendations

## Troubleshooting

### Issue: "No questions from answer sheet match dataset columns"

**Solution**: Check that question text in `answer_sheet_*.json` exactly matches column names in CSV

### Issue: "Cannot train model with only one class"

**Solution**: Dataset needs variety - requires samples in at least 2 awareness levels

### Issue: "ModuleNotFoundError: No module named 'sklearn'"

**Solution**: Install dependencies:

```powershell
pip install scikit-learn pandas numpy joblib
```

### Issue: Model accuracy is very low (<50%)

**Possible causes**:

- Mismatched questions between answer sheet and CSV
- Inconsistent answer text (case sensitivity, extra spaces)
- Poor quality training data

## Collecting More Training Data

### From Live Assessments

Services automatically save assessment results to MongoDB:

- Collection: `{service}_assessments`
- Contains: user responses, scores, awareness levels

To export and use for retraining:

1. Export from MongoDB to CSV
2. Combine with existing CSV
3. Retrain models

### Manual Data Collection

You can also manually create CSV files with:

- Columns: gender, proficiency, education, [question columns]
- Rows: One per user response
- Format: Exact match to answer sheet text

## Model Performance Monitoring

After deploying trained models:

1. **Check Logs** - Services log ML predictions
2. **Monitor Accuracy** - Compare ML vs rule-based scores
3. **Collect Feedback** - User satisfaction with recommendations
4. **Retrain Periodically** - Add new data and retrain monthly

## Advanced: Custom Training

To modify training parameters, edit the trainer files:

```python
# In src/utils/{service}_model_trainer.py

# Change model parameters
self.model = LogisticRegression(
    solver='lbfgs',
    multi_class='multinomial',
    max_iter=1000,      # Increase for better convergence
    C=1.0,              # Regularization strength
    random_state=42
)

# Change awareness level thresholds
def get_level(percentage):
    if percentage >= 85:  # Change from 80
        return 'High Awareness'
    elif percentage >= 65:  # Change from 60
        return 'Moderate Awareness'
    else:
        return 'Low Awareness'
```

## Next Steps

1. ✅ Run `.\train-all-models.ps1`
2. ✅ Check that model files are created
3. ✅ Restart services to load new models
4. ✅ Take assessments and verify ML predictions appear
5. ✅ Monitor model performance
6. 🔄 Retrain periodically with new data

---

## Summary

| Service            | Training Data       | Status            | Command                                                |
| ------------------ | ------------------- | ----------------- | ------------------------------------------------------ |
| App Permission     | ✅ CSV (existing)   | ✅ Models trained | Already done                                           |
| Phishing           | ✅ CSV (1,122 rows) | 🔄 Ready to train | `cd phishing-detection-service; python train_model.py` |
| Password           | ✅ CSV (1,256 rows) | 🔄 Ready to train | `cd password-security-service; python train_model.py`  |
| Social Engineering | ✅ CSV (1,347 rows) | 🔄 Ready to train | `cd social-engineering-service; python train_model.py` |
| Device Security    | ❌ No CSV           | ❌ Need data      | Collect assessment data first                          |

**Quick command to train all at once:**

```powershell
.\train-all-models.ps1
```
