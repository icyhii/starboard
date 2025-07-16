#!/usr/bin/env python3
"""
Starboard Comparables Demo Script
=================================

This script demonstrates the complete workflow of:
1. Inputting an industrial property
2. Finding and scoring the best comparables
3. Displaying results with detailed breakdown

Usage: python demo.py
"""

import requests
import json
import time
from typing import Dict, Any, List

# Configuration
BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}

def print_banner():
    """Print demo banner"""
    print("=" * 60)
    print("🏭 STARBOARD COMPARABLES DEMO")
    print("=" * 60)
    print("Demonstrating: Input Industrial Property → Output Best Comparables")
    print()

def check_server():
    """Check if the FastAPI server is running"""
    try:
        response = requests.get(f"{BASE_URL}/properties", timeout=5)
        if response.status_code == 200:
            print("✅ FastAPI server is running")
            return True
        else:
            print(f"❌ Server responded with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to FastAPI server. Make sure it's running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error checking server: {e}")
        return False

def get_sample_properties():
    """Get available properties from the database"""
    try:
        response = requests.get(f"{BASE_URL}/properties")
        if response.status_code == 200:
            properties = response.json()
            print(f"📊 Found {len(properties)} properties in database")
            return properties
        else:
            print(f"❌ Failed to fetch properties: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error fetching properties: {e}")
        return []

def display_property_input(property_data: Dict[str, Any]):
    """Display the input property details"""
    print("\n" + "=" * 40)
    print("🏢 INPUT PROPERTY")
    print("=" * 40)
    print(f"📍 Location: ({property_data['latitude']}, {property_data['longitude']})")
    print(f"📐 Square Feet: {property_data['square_feet']:,}")
    print(f"🏗️  Year Built: {property_data['year_built']}")
    print(f"🏙️  Zoning: {property_data['zoning']}")
    print()

def find_comparables(property_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Find comparable properties using the API"""
    try:
        print("🔍 Searching for comparable properties...")
        response = requests.post(
            f"{BASE_URL}/comparable",
            headers=HEADERS,
            json=property_data,
            timeout=30
        )
        
        if response.status_code == 200:
            comparables = response.json()
            print(f"✅ Found {len(comparables)} comparable properties")
            return comparables
        else:
            print(f"❌ Failed to find comparables: {response.status_code}")
            print(f"Response: {response.text}")
            return []
    except Exception as e:
        print(f"❌ Error finding comparables: {e}")
        return []

def display_comparables(comparables: List[Dict[str, Any]]):
    """Display the comparable properties with detailed scoring"""
    print("\n" + "=" * 60)
    print("🎯 BEST COMPARABLE PROPERTIES")
    print("=" * 60)
    
    if not comparables:
        print("❌ No comparable properties found")
        return
    
    for i, comp in enumerate(comparables[:5], 1):  # Show top 5
        print(f"\n🏭 COMPARABLE #{i}")
        print("-" * 30)
        
        # Overall score
        score = comp.get('score', 0)
        print(f"⭐ Overall Score: {score:.3f} ({score*100:.1f}%)")
        
        # Property details
        prop = comp.get('property', {})
        print(f"📍 Address: {prop.get('address', 'N/A')}")
        print(f"📐 Square Feet: {prop.get('square_feet', 'N/A'):,}" if prop.get('square_feet') else "📐 Square Feet: N/A")
        print(f"🏗️  Year Built: {prop.get('year_built', 'N/A')}")
        print(f"🏙️  Zoning: {prop.get('zoning', 'N/A')}")
        
        # Detailed scoring breakdown
        breakdown = comp.get('breakdown', {})
        if breakdown:
            print("\n📊 Scoring Breakdown:")
            for factor, factor_score in breakdown.items():
                bar_length = int(factor_score * 20)  # Scale to 20 chars
                bar = "█" * bar_length + "░" * (20 - bar_length)
                print(f"   {factor.capitalize():12} {bar} {factor_score:.3f}")
        
        print()

def run_demo():
    """Run the complete demo"""
    print_banner()
    
    # Step 1: Check server
    if not check_server():
        return
    
    # Step 2: Get sample properties
    properties = get_sample_properties()
    if not properties:
        print("❌ No properties available for demo")
        return
    
    # Step 3: Select a sample industrial property
    # Use the first property or find one with industrial characteristics
    sample_property = None
    for prop in properties:
        if prop.get('zoning', '').startswith('M') or 'industrial' in prop.get('zoning', '').lower():
            sample_property = prop
            break
    
    if not sample_property:
        # Use the first property as fallback
        sample_property = properties[0]
    
    # Prepare input data
    input_data = {
        "latitude": sample_property.get('latitude', 41.8781),
        "longitude": sample_property.get('longitude', -87.6298),
        "square_feet": sample_property.get('square_feet', 5000),
        "year_built": sample_property.get('year_built', 1980),
        "zoning": sample_property.get('zoning', 'M1')
    }
    
    # Step 4: Display input
    display_property_input(input_data)
    
    # Step 5: Find comparables
    comparables = find_comparables(input_data)
    
    # Step 6: Display results
    display_comparables(comparables)
    
    # Step 7: Summary
    print("\n" + "=" * 60)
    print("📈 DEMO SUMMARY")
    print("=" * 60)
    print("✅ Successfully demonstrated the complete workflow:")
    print("   1. Input industrial property characteristics")
    print("   2. Search for comparable properties")
    print("   3. Score comparables using multiple factors")
    print("   4. Display ranked results with detailed breakdown")
    print()
    print("🎯 The system uses weighted scoring based on:")
    print("   • Geographic proximity (location)")
    print("   • Size similarity (square footage)")
    print("   • Age similarity (year built)")
    print("   • Zoning compatibility")
    print()
    print("Demo completed successfully! 🎉")

if __name__ == "__main__":
    run_demo()
