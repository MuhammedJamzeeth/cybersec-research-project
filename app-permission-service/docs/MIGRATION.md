# Migration Guide

## Overview
This guide helps you update from the old flat structure to the new organized structure.

## Changes Summary

### File Relocations

| Old Location | New Location | Status |
|-------------|--------------|---------|
| `main_app_permissions.py` | `src/main_app_permissions.py` | ✅ Moved |
| `example-integration.tsx` | `docs/examples/example-integration.tsx` | ✅ Moved |
| `app_permissions_model.pkl` | `models/app_permissions_model.pkl` | ✅ Moved |
| `app_permissions_scaler.pkl` | `models/app_permissions_scaler.pkl` | ✅ Moved |
| `app_permissions_feature_names.pkl` | `models/app_permissions_feature_names.pkl` | ✅ Moved |
| `*.png` files | `docs/images/*.png` | ✅ Moved |
| `src/api/main.py` | `src/api/main.py` | ✅ Updated imports |
| `src/core/service.py` | `src/core/service.py` | ✅ Updated imports |

### New Files Created

- `config/settings.py` - Centralized configuration management
- `config/__init__.py` - Package initialization
- `src/__init__.py` - Package initialization
- `src/api/__init__.py` - API package initialization
- `src/core/__init__.py` - Core package initialization
- `src/utils/__init__.py` - Utils package initialization
- `.env.example` - Environment configuration template
- `docs/PROJECT_STRUCTURE.md` - Detailed structure documentation
- `docs/QUICKSTART.md` - Quick start guide
- `docs/MIGRATION.md` - This file

### Updated Files

- `.env` - Updated with new paths
- `README.md` - Updated architecture section
- `requirements.txt` - Added `pydantic-settings`

## Import Changes

### Before (Old Structure)
```python
from models import Question
from service import model_service
from request_logger import setup_request_logger
```

### After (New Structure)
```python
from src.api.models import Question
from src.core.service import model_service
from src.utils.request_logger import setup_request_logger
from config.settings import settings
```

## Configuration Changes

### Before (Old Structure)
```python
# Direct environment variable access
model_path = os.getenv('MODEL_PATH', 'app_permissions_model.pkl')
answer_sheet_path = os.getenv('ANSWER_SHEET_PATH', 'answer_sheetappper.json')
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
```

### After (New Structure)
```python
# Using centralized settings
from config.settings import settings

model_path = settings.get_absolute_path(settings.MODEL_PATH)
answer_sheet_path = settings.get_absolute_path(settings.ANSWER_SHEET_PATH)
cors_origins = settings.cors_origins_list
```

## Running the Application

### Before (Old Structure)
```bash
python main.py
# or
uvicorn main:app --reload
```

### After (New Structure)
```bash
# From project root (recommended)
python -m uvicorn src.api.main:app --reload

# Or from src/api directory
cd src/api
python main.py
```

## Environment Variables

### Updated .env File
The `.env` file now uses new paths:

```env
# Old paths (no longer valid)
MODEL_PATH=app_permissions_model.pkl
ANSWER_SHEET_PATH=answer_sheetappper.json

# New paths (organized structure)
MODEL_PATH=models/app_permissions_model.pkl
ANSWER_SHEET_PATH=data/answer_sheetappper.json
```

Full example in `.env.example`:
```bash
cp .env.example .env
```

## Benefits of New Structure

### 1. Better Organization
- **config/** - All configuration in one place
- **models/** - ML artifacts separated from code
- **data/** - Data files organized together
- **docs/** - Documentation and examples together

### 2. Proper Python Packaging
- All directories have `__init__.py`
- Cleaner imports
- Better IDE support

### 3. Scalability
- Easy to add new modules
- Clear separation of concerns
- Modular architecture

### 4. Professional Standards
- Follows Python best practices
- Industry-standard project layout
- Easier for new developers to understand

## Verification Steps

After migration, verify everything works:

### 1. Check File Locations
```bash
# Verify model files
ls models/

# Verify data files
ls data/

# Verify source structure
ls src/api/
ls src/core/
ls src/utils/
```

### 2. Install Updated Dependencies
```bash
pip install -r requirements.txt
```

### 3. Test Configuration
```bash
python -c "from config.settings import settings; print(settings.MODEL_PATH)"
```

### 4. Start the Server
```bash
python -m uvicorn src.api.main:app --reload
```

### 5. Test Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Get questions
curl http://localhost:8000/api/questions
```

## Troubleshooting

### Import Errors
**Problem**: `ModuleNotFoundError: No module named 'config'`

**Solution**: Run from project root:
```bash
cd app-permission-service
python -m uvicorn src.api.main:app --reload
```

### File Not Found Errors
**Problem**: Model or data files not found

**Solution**: Check `.env` file has correct paths:
```env
MODEL_PATH=models/app_permissions_model.pkl
ANSWER_SHEET_PATH=data/answer_sheetappper.json
```

### Pydantic Settings Error
**Problem**: `ImportError: cannot import name 'BaseSettings'`

**Solution**: Install pydantic-settings:
```bash
pip install pydantic-settings
```

## Rollback (If Needed)

If you need to revert to the old structure temporarily:

1. **Stop the server**
2. **Checkout the previous commit**:
   ```bash
   git log --oneline  # Find the commit before migration
   git checkout <commit-hash>
   ```
3. **Or manually revert using git**:
   ```bash
   git revert HEAD
   ```

## Questions?

- Check [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed structure
- Review [QUICKSTART.md](QUICKSTART.md) for running instructions
- See [README.md](../README.md) for general information

## Next Steps

1. Update any external integrations to use new import paths
2. Review the new configuration system in `config/settings.py`
3. Explore the organized documentation in `docs/`
4. Consider adding tests in the `tests/` directory
