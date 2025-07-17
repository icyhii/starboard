#!/usr/bin/env python3
"""
Simple test script to validate Starboard functionality
"""

import os
import json
import requests
import subprocess
import sys
import time

def test_file_structure():
    """Test that all required files and directories exist"""
    print("🔍 Testing file structure...")
    
    required_files = [
        "main.py",
        "requirements.txt",
        "setup.py",
        "cli.py",
        "README.md",
        "app/__init__.py",
        "app/api_discovery/__init__.py",
        "app/api_discovery/discover.py",
        "app/data_extraction/__init__.py",
        "app/data_extraction/fetch.py",
        "app/data_extraction/filter_industrial.py", 
        "app/data_extraction/validate.py",
        "app/data_extraction/flag_outliers.py",
        "app/comparables/__init__.py",
        "app/comparables/discovery.py",
        "app/comparables/find.py",
        "app/comparables/score.py"
    ]
    
    required_dirs = [
        "data/cache",
        "data/logs",
        "data/schemas"
    ]
    
    missing = []
    
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing.append(file_path)
    
    for dir_path in required_dirs:
        if not os.path.exists(dir_path):
            missing.append(dir_path)
    
    if missing:
        print(f"❌ Missing files/directories: {missing}")
        return False
    
    print("✅ All required files and directories exist")
    return True

def test_data_pipeline():
    """Test the data processing pipeline"""
    print("\n🔄 Testing data pipeline...")
    
    # Check if data files exist
    data_files = [
        "data/cache/raw_records.json",
        "data/cache/industrial_properties.json", 
        "data/cache/outlier_flags.json"
    ]
    
    for file_path in data_files:
        if not os.path.exists(file_path):
            print(f"❌ Data file missing: {file_path}")
            return False
        
        # Check if file has content
        with open(file_path, 'r') as f:
            data = json.load(f)
            if not data:
                print(f"❌ Data file empty: {file_path}")
                return False
    
    print("✅ Data pipeline generated all required files")
    return True

def test_api_server():
    """Test API server functionality"""
    print("\n🌐 Testing API server...")
    
    # Test if server is running
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code != 200:
            print("❌ Server health check failed")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API server at http://localhost:8000")
        print("   Make sure the server is running with: python main.py")
        return False
    
    # Test properties endpoint
    try:
        response = requests.get("http://localhost:8000/properties", timeout=5)
        if response.status_code != 200:
            print("❌ Properties endpoint failed")
            return False
        
        data = response.json()
        if not data.get('properties'):
            print("❌ No properties returned")
            return False
            
        print(f"✅ API server running, found {data['count']} properties")
    except Exception as e:
        print(f"❌ Properties endpoint error: {e}")
        return False
    
    # Test comparables endpoint
    try:
        test_property = {
            "latitude": 41.8781,
            "longitude": -87.6298,
            "square_feet": 50000,
            "year_built": 1995,
            "zoning": "M1"
        }
        
        response = requests.post(
            "http://localhost:8000/comparable",
            json=test_property,
            timeout=5
        )
        
        if response.status_code != 200:
            print("❌ Comparables endpoint failed")
            return False
        
        data = response.json()
        if not data.get('comparables'):
            print("❌ No comparables returned")
            return False
            
        print(f"✅ Comparables endpoint working, found {len(data['comparables'])} matches")
    except Exception as e:
        print(f"❌ Comparables endpoint error: {e}")
        return False
    
    return True

def test_cli():
    """Test CLI functionality"""
    print("\n💻 Testing CLI...")
    
    try:
        # Test health command
        result = subprocess.run([sys.executable, "cli.py", "health"], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode != 0:
            print(f"❌ CLI health command failed: {result.stderr}")
            return False
        
        # Test list command
        result = subprocess.run([sys.executable, "cli.py", "list"], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode != 0:
            print(f"❌ CLI list command failed: {result.stderr}")
            return False
        
        # Test compare command
        result = subprocess.run([
            sys.executable, "cli.py", "compare",
            "--latitude", "41.8781",
            "--longitude", "-87.6298", 
            "--square-feet", "50000",
            "--year-built", "1995",
            "--zoning", "M1",
            "--count", "3"
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode != 0:
            print(f"❌ CLI compare command failed: {result.stderr}")
            return False
        
        print("✅ CLI commands working correctly")
    except Exception as e:
        print(f"❌ CLI test error: {e}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("🧪 Starboard System Tests")
    print("=" * 40)
    
    tests = [
        ("File Structure", test_file_structure),
        ("Data Pipeline", test_data_pipeline),
        ("API Server", test_api_server),
        ("CLI Interface", test_cli)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} test failed")
        except Exception as e:
            print(f"❌ {test_name} test error: {e}")
    
    print("\n" + "=" * 40)
    print(f"📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! Starboard is fully functional.")
        return 0
    else:
        print("⚠️ Some tests failed. Please check the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
