"""
Configuration settings for the Device Security Assessment Service
"""
import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Base paths
    BASE_DIR: Path = Path(__file__).parent.parent
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8004
    
    # CORS Settings
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    # MongoDB Configuration
    MONGO_URI: str = "mongodb://localhost:27017/gamification?replicaSet=rs0"
    
    # Model Files
    MODEL_PATH: str = "models/device_security_model.pkl"
    SCALER_PATH: str = "models/device_security_scaler.pkl"
    FEATURE_NAMES_PATH: str = "models/device_security_feature_names.pkl"
    
    # Data Files
    ANSWER_SHEET_PATH: str = "data/answer_sheet_device.json"
    EXPLANATION_BANK_PATH: str = "data/explanation_bank_device.json"
    ASSESSMENT_DB_PATH: str = "data/device_security_assessment_database.json"
    ASSESSMENT_RESULTS_PATH: str = "data/device_security_assessment_results.json"
    
    # Dataset
    DATASET_CSV: str = "data/device_security_dataset.csv"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        
    def get_absolute_path(self, relative_path: str) -> Path:
        """Convert relative path to absolute path from BASE_DIR"""
        return self.BASE_DIR / relative_path


settings = Settings()
