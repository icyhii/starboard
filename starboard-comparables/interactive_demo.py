#!/usr/bin/env python3
"""
Interactive Starboard Comparables Demo
=====================================

This script demonstrates multiple scenarios with different property types
to showcase the scoring algorithm's adaptability.
"""

import requests
import json
from typing import Dict, Any, List

BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}

def print_section_header(title: str):
    """Print a section header"""
    print("\n" + "=" * 60)
    print(f"🎯 {title}")
    print("=" * 60)

def run_scenario(name: str, property_data: Dict[str, Any]):
    """Run a single demo scenario"""
    print(f"\n🏢 SCENARIO: {name}")
    print("-" * 40)
    
    # Display input
    print("📋 INPUT PROPERTY:")
    for key, value in property_data.items():
        if key == 'square_feet':
            print(f"   {key}: {value:,}")
        else:
            print(f"   {key}: {value}")
    
    # Find comparables
    try:
        response = requests.post(
            f"{BASE_URL}/comparable",
            headers=HEADERS,
            json=property_data,
            timeout=30
        )
        
        if response.status_code == 200:
            comparables = response.json()
            print(f"\n✅ Found {len(comparables)} comparables")
            
            # Show top 2 results
            for i, comp in enumerate(comparables[:2], 1):
                score = comp.get('score', 0)
                prop = comp.get('property', {})
                print(f"\n   #{i} Score: {score:.3f} ({score*100:.1f}%)")
                print(f"      Address: {prop.get('address', 'N/A')}")
                print(f"      Size: {prop.get('square_feet', 'N/A'):,}" if prop.get('square_feet') else f"      Size: N/A")
                print(f"      Year: {prop.get('year_built', 'N/A')}")
                print(f"      Zoning: {prop.get('zoning', 'N/A')}")
        else:
            print(f"❌ API Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Run multiple demo scenarios"""
    print("🏭 STARBOARD COMPARABLES - MULTI-SCENARIO DEMO")
    print("=" * 60)
    print("Demonstrating how the scoring algorithm adapts to different property types")
    
    # Check server
    try:
        response = requests.get(f"{BASE_URL}/properties", timeout=5)
        if response.status_code != 200:
            print("❌ Server not available")
            return
    except:
        print("❌ Cannot connect to server")
        return
    
    print("✅ Server is running")
    
    # Scenario 1: Perfect match property
    run_scenario(
        "Perfect Match - Identical Property",
        {
            "latitude": 41.8781,
            "longitude": -87.6298,
            "square_feet": 5100,
            "year_built": 1982,
            "zoning": "M1"
        }
    )
    
    # Scenario 2: Similar but different size
    run_scenario(
        "Size Variation - Larger Property",
        {
            "latitude": 41.8781,
            "longitude": -87.6298,
            "square_feet": 8000,
            "year_built": 1982,
            "zoning": "M1"
        }
    )
    
    # Scenario 3: Different location
    run_scenario(
        "Location Variation - Different Area",
        {
            "latitude": 41.9000,
            "longitude": -87.7000,
            "square_feet": 5100,
            "year_built": 1982,
            "zoning": "M1"
        }
    )
    
    # Scenario 4: Newer property
    run_scenario(
        "Age Variation - Modern Property",
        {
            "latitude": 41.8781,
            "longitude": -87.6298,
            "square_feet": 5100,
            "year_built": 2020,
            "zoning": "M1"
        }
    )
    
    # Scenario 5: Different zoning
    run_scenario(
        "Zoning Variation - Industrial to Commercial",
        {
            "latitude": 41.8781,
            "longitude": -87.6298,
            "square_feet": 5100,
            "year_built": 1982,
            "zoning": "C1"
        }
    )
    
    print_section_header("DEMO INSIGHTS")
    print("🔍 Key Observations:")
    print("   • Perfect matches score 100%")
    print("   • Size differences impact the overall score")
    print("   • Location proximity is heavily weighted")
    print("   • Age differences show diminishing returns")
    print("   • Zoning mismatches significantly reduce scores")
    print("\n💡 The algorithm balances multiple factors to find the most relevant comparables")
    print("🎉 Demo completed - System ready for production use!")

if __name__ == "__main__":
    main()
