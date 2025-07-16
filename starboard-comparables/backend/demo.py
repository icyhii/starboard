import json
import requests

def demo_comparables():
    # Sample industrial property
    sample_property = {
        "latitude": 41.8781,
        "longitude": -87.6298,
        "square_feet": 5000,
        "year_built": 1980,
        "zoning": "M1"
    }
    
    print("🏭 Input Industrial Property:")
    print(json.dumps(sample_property, indent=2))
    print("\n" + "="*50)
    
    # Call API
    try:
        response = requests.post(
            "http://localhost:8000/comparable",
            json=sample_property
        )
        
        if response.status_code == 200:
            comparables = response.json()
            print(f"\n🎯 Top {len(comparables)} Comparable Properties:")
            print("="*50)
            
            for i, comp in enumerate(comparables, 1):
                print(f"\n#{i} - Score: {comp['score']:.3f}")
                print(f"Address: {comp['property'].get('address', 'N/A')}")
                print(f"Size: {comp['property'].get('square_feet', 'N/A')} sq ft")
                print(f"Year: {comp['property'].get('year_built', 'N/A')}")
                print(f"Zoning: {comp['property'].get('zoning', 'N/A')}")
                print(f"Breakdown: Location({comp['breakdown']['location']:.2f}) Size({comp['breakdown']['size']:.2f}) Age({comp['breakdown']['year_built']:.2f}) Zoning({comp['breakdown']['zoning']:.2f})")
        else:
            print(f"Error: {response.status_code} - {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to backend server at http://localhost:8000")
        print("Make sure the FastAPI server is running with: python main.py")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    demo_comparables()
