"""
Train ML Model for Safe Browsing Service
Run this script from the service directory
"""

import sys
import os
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from src.utils.safe_browsing_model_trainer import SafeBrowsingModelTrainer

def main():
    print("="*70)
    print("🚀 SAFE BROWSING MODEL TRAINING")
    print("="*70)
    
    # Define paths
    data_dir = project_root / 'data'
    dataset_path = data_dir / 'mobile_app_permission.csv'
    answer_sheet_path = data_dir / 'answer_sheet_device.json'
    
    # Check if files exist
    if not dataset_path.exists():
        print(f"❌ Dataset not found: {dataset_path}")
        print("\nAvailable files in data directory:")
        if data_dir.exists():
            for file in data_dir.iterdir():
                print(f"   - {file.name}")
        return 1
    
    if not answer_sheet_path.exists():
        print(f"❌ Answer sheet not found: {answer_sheet_path}")
        return 1
    
    print(f"📁 Dataset: {dataset_path}")
    print(f"📁 Answer Sheet: {answer_sheet_path}")
    print()
    
    # Train model
    try:
        trainer = SafeBrowsingModelTrainer(
            dataset_path=str(dataset_path),
            answer_sheet_path=str(answer_sheet_path)
        )
        
        model, accuracy = trainer.train_model()
        
        print("\n" + "="*70)
        print(f"✅ SUCCESS! Model accuracy: {accuracy:.2%}")
        print("="*70)
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
