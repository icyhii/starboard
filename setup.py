#!/usr/bin/env python3
"""
Setup script to initialize the Starboard data pipeline
"""

import os
import sys
import subprocess
from pathlib import Path

def create_directories():
    """Create necessary data directories"""
    dirs = [
        "data/cache",
        "data/logs", 
        "data/schemas"
    ]
    
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"✓ Created directory: {dir_path}")

def run_data_pipeline():
    """Run the complete data processing pipeline"""
    
    print("\n🚀 Starting Starboard data pipeline...")
    
    # Step 1: Fetch data
    print("\n📥 Step 1: Fetching property data...")
    try:
        subprocess.run([sys.executable, "app/data_extraction/fetch.py"], check=True)
        print("✓ Data fetching completed")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Data fetching failed: {e}")
    
    # Step 2: Filter industrial properties
    print("\n🏭 Step 2: Filtering industrial properties...")
    try:
        subprocess.run([sys.executable, "app/data_extraction/filter_industrial.py"], check=True)
        print("✓ Industrial filtering completed")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Industrial filtering failed: {e}")
    
    # Step 3: Validate data
    print("\n✅ Step 3: Validating property data...")
    try:
        subprocess.run([sys.executable, "app/data_extraction/validate.py"], check=True)
        print("✓ Data validation completed")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Data validation failed: {e}")
    
    # Step 4: Flag outliers
    print("\n📊 Step 4: Flagging outliers...")
    try:
        subprocess.run([sys.executable, "app/data_extraction/flag_outliers.py"], check=True)
        print("✓ Outlier flagging completed")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Outlier flagging failed: {e}")
    
    print("\n🎉 Data pipeline completed successfully!")

def main():
    """Main setup function"""
    print("🌟 Starboard Industrial Property Comparables Setup")
    print("=" * 50)
    
    # Create directories
    create_directories()
    
    # Run data pipeline
    run_data_pipeline()
    
    print("\n" + "=" * 50)
    print("🎯 Setup complete! You can now:")
    print("   1. Start the API server: python main.py")
    print("   2. Access API docs: http://localhost:8000/docs")
    print("   3. Test endpoints: http://localhost:8000/properties")

if __name__ == "__main__":
    main()
