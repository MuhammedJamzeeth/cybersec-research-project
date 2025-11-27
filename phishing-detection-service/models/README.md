# ML Models Directory

This directory should contain the trained ML models for the Phishing Detection Assessment service.

## Required Files:

- `phishing_detection_model.pkl` - Trained ML model for awareness prediction
- `phishing_detection_scaler.pkl` - Feature scaler for input normalization
- `phishing_detection_feature_names.pkl` - Feature names for the model

## Note:

Currently, these models are not present. The service will function without them, but ML-powered awareness predictions will not be available. The service will fall back to rule-based assessment.

## To Train Models:

You would need to:

1. Collect assessment data from multiple users
2. Label the data with awareness levels
3. Train a classification model (e.g., Random Forest, XGBoost)
4. Save the model, scaler, and feature names using joblib

Until then, the service provides:

- ✅ Score calculation
- ✅ Personalized explanations based on demographics
- ✅ Enhancement advice
- ❌ ML-based awareness level prediction (will show "Unknown")
