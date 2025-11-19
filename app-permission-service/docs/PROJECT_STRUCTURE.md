# Project Structure

## Overview
This is a well-organized FastAPI microservice for mobile app permissions security assessment with ML-based scoring and personalized feedback.

## Directory Structure

```
app-permission-service/
├── config/                          # Configuration management
│   ├── __init__.py
│   └── settings.py                  # Centralized settings using Pydantic
│
├── data/                            # Data files
│   ├── answer_sheetappper.json      # Questions and scoring weights
│   ├── app_permissions_assessment_database.json
│   ├── app_permissions_assessment_results.json
│   ├── classification_report.txt
│   ├── ExplanationBankappper.json   # Personalized explanations
│   └── mobile_app_permission.csv    # Dataset
│
├── docs/                            # Documentation
│   ├── examples/                    # Integration examples
│   │   └── example-integration.tsx
│   ├── images/                      # Visualizations and diagrams
│   │   ├── awareness_distribution.png
│   │   ├── classification_metrics.png
│   │   └── confusion_matrix.png
│   ├── ARCHITECTURE.md
│   └── CHECKLIST.md
│
├── models/                          # ML model artifacts
│   ├── app_permissions_model.pkl
│   ├── app_permissions_scaler.pkl
│   └── app_permissions_feature_names.pkl
│
├── src/                             # Source code
│   ├── __init__.py
│   ├── main_app_permissions.py      # Main entry point
│   │
│   ├── api/                         # API layer
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI application
│   │   └── models.py                # Pydantic request/response models
│   │
│   ├── core/                        # Business logic
│   │   ├── __init__.py
│   │   └── service.py               # ML model service
│   │
│   └── utils/                       # Utility modules
│       ├── __init__.py
│       ├── app_permissions_educational_resources.py
│       ├── app_permissions_knowledge_enhancer.py
│       ├── app_permissions_model_trainer.py
│       ├── app_permissions_user_tester.py
│       ├── check_explanations.py
│       └── request_logger.py
│
├── tests/                           # Test files
│
├── .env                             # Environment variables (git-ignored)
├── .env.example                     # Example environment configuration
├── .gitignore
├── README.md
└── requirements.txt                 # Python dependencies
```

## Key Components

### Configuration (`config/`)
- **settings.py**: Centralized configuration using Pydantic Settings
- Automatically loads from `.env` file
- Provides type-safe access to environment variables
- Handles path resolution from project root

### Source Code (`src/`)
- **api/**: REST API endpoints and request/response models
- **core/**: Business logic and ML model service
- **utils/**: Helper modules for training, testing, and logging

### Data Management (`data/`)
- Question bank and answer sheets
- ML training datasets
- Assessment results storage
- Explanation bank for personalized feedback

### Models (`models/`)
- Pre-trained ML models (`.pkl` files)
- Scalers and feature extractors
- All model artifacts in one place

### Documentation (`docs/`)
- API documentation
- Architecture diagrams
- Integration examples
- Performance visualizations

## Module Organization

### Python Package Structure
All source directories include `__init__.py` files making them proper Python packages:
- Enables clean imports
- Supports relative imports within packages
- Better IDE support and autocomplete

### Import Paths
Use absolute imports from project root:
```python
from config.settings import settings
from src.api.models import Question
from src.core.service import model_service
from src.utils.request_logger import setup_request_logger
```

## Running the Application

### Development
```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env

# Run the API server
cd src/api
python main.py
```

### Production
```bash
# Using uvicorn
uvicorn src.api.main:app --host 0.0.0.0 --port 8000

# With workers
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Best Practices Implemented

1. **Separation of Concerns**: Clear separation between API, business logic, and utilities
2. **Configuration Management**: Centralized settings with environment variable support
3. **Type Safety**: Pydantic models for configuration and API contracts
4. **Documentation**: Organized docs with examples and visualizations
5. **Data Organization**: Separate directories for data, models, and code
6. **Python Packaging**: Proper `__init__.py` files for all modules
7. **Environment Templates**: `.env.example` for easy setup

## File Naming Conventions

- **Python modules**: `snake_case.py`
- **Configuration files**: `lowercase.ext`
- **Documentation**: `UPPERCASE.md` for main docs, `lowercase.md` for specific guides
- **Data files**: Descriptive names with underscores
- **Model files**: `model_name_model.pkl`
