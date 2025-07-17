#!/usr/bin/env python3
"""
Command Line Interface for Starboard Industrial Property Comparables
"""

import argparse
import json
import requests
import sys
from typing import Dict, Any

def test_api_connection(base_url: str = "http://localhost:8000") -> bool:
    """Test if the API server is running"""
    try:
        response = requests.get(f"{base_url}/health")
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        return False

def get_properties(base_url: str = "http://localhost:8000") -> Dict[str, Any]:
    """Get all available properties"""
    response = requests.get(f"{base_url}/properties")
    response.raise_for_status()
    return response.json()

def find_comparables(property_data: Dict[str, Any], n: int = 5, base_url: str = "http://localhost:8000") -> Dict[str, Any]:
    """Find comparable properties"""
    response = requests.post(
        f"{base_url}/comparable",
        params={"n": n},
        json=property_data
    )
    response.raise_for_status()
    return response.json()

def main():
    parser = argparse.ArgumentParser(description="Starboard Industrial Property Comparables CLI")
    parser.add_argument("--base-url", default="http://localhost:8000", help="API base URL")
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Health check command
    health_parser = subparsers.add_parser("health", help="Check API health")
    
    # List properties command
    list_parser = subparsers.add_parser("list", help="List all properties")
    
    # Find comparables command
    compare_parser = subparsers.add_parser("compare", help="Find comparable properties")
    compare_parser.add_argument("--latitude", type=float, required=True, help="Property latitude")
    compare_parser.add_argument("--longitude", type=float, required=True, help="Property longitude")
    compare_parser.add_argument("--square-feet", type=float, required=True, help="Property square footage")
    compare_parser.add_argument("--year-built", type=int, required=True, help="Year property was built")
    compare_parser.add_argument("--zoning", type=str, required=True, help="Property zoning code")
    compare_parser.add_argument("--count", type=int, default=5, help="Number of comparables to return")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Check API connection
    if not test_api_connection(args.base_url):
        print(f"❌ Error: Cannot connect to API at {args.base_url}")
        print("Make sure the server is running with: python main.py")
        sys.exit(1)
    
    try:
        if args.command == "health":
            response = requests.get(f"{args.base_url}/health")
            result = response.json()
            print(f"✅ API Status: {result['status']}")
            print(f"📍 Service: {result['service']}")
            
        elif args.command == "list":
            result = get_properties(args.base_url)
            print(f"📋 Found {result['count']} industrial properties:")
            print()
            for prop in result['properties']:
                print(f"🏭 ID: {prop['id']}")
                print(f"   Address: {prop['address']}")
                print(f"   Size: {prop['square_feet']:,} sq ft")
                print(f"   Built: {prop['year_built']}")
                print(f"   Zoning: {prop['zoning']}")
                print()
                
        elif args.command == "compare":
            property_data = {
                "latitude": args.latitude,
                "longitude": args.longitude,
                "square_feet": args.square_feet,
                "year_built": args.year_built,
                "zoning": args.zoning
            }
            
            result = find_comparables(property_data, args.count, args.base_url)
            
            print("🎯 Subject Property:")
            subject = result['subject']
            print(f"   Location: ({subject['latitude']}, {subject['longitude']})")
            print(f"   Size: {subject['square_feet']:,.0f} sq ft")
            print(f"   Built: {subject['year_built']}")
            print(f"   Zoning: {subject['zoning']}")
            print()
            
            print(f"🔍 Top {len(result['comparables'])} Comparable Properties:")
            print()
            
            for i, comp in enumerate(result['comparables'], 1):
                prop = comp['property']
                breakdown = comp['breakdown']
                
                print(f"#{i} - Score: {comp['score']:.3f}")
                print(f"   📍 {prop['address']}")
                print(f"   🏭 {prop['square_feet']:,} sq ft, Built: {prop['year_built']}, Zoning: {prop['zoning']}")
                print(f"   📊 Location: {breakdown['location']:.3f}, Size: {breakdown['size']:.3f}, Age: {breakdown['year_built']:.3f}, Zoning: {breakdown['zoning']:.3f}")
                print()
            
            print("⚖️ Scoring Weights:")
            weights = result['weights']
            for factor, weight in weights.items():
                print(f"   {factor.title()}: {weight:.1%}")
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    except KeyError as e:
        print(f"❌ Error: Missing expected field {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
