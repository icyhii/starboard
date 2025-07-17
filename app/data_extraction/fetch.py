import requests
import json
import os
from tenacity import retry, stop_after_attempt, wait_exponential

CACHE_PATH = os.path.join(os.path.dirname(__file__), '../../data/cache/raw_records.json')
DATASET_ID = "abcd-1234"  # Replace with actual dataset id
API_URL = f"https://datacatalog.cookcountyil.gov/resource/{DATASET_ID}.json"
BATCH_SIZE = 1000
MAX_RECORDS = 10000  # Set a reasonable limit for demo

@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=2, max=10))
def fetch_batch(offset: int, limit: int) -> list:
    params = {"$limit": limit, "$offset": offset}
    response = requests.get(API_URL, params=params)
    response.raise_for_status()
    return response.json()

def fetch_all():
    all_records = []
    offset = 0
    while True:
        try:
            batch = fetch_batch(offset, BATCH_SIZE)
            if not batch:
                break
            all_records.extend(batch)
            offset += BATCH_SIZE
            if len(all_records) >= MAX_RECORDS:
                break
        except Exception as e:
            print(f"Error fetching batch at offset {offset}: {e}")
            break
    return all_records

def save_records(records):
    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
    with open(CACHE_PATH, "w") as f:
        json.dump(records, f, indent=2)

def create_sample_data():
    """Create sample industrial property data for demo purposes"""
    sample_data = [
        {
            "id": "1001",
            "address": "123 Industrial Ave, Chicago, IL",
            "latitude": 41.8781,
            "longitude": -87.6298,
            "square_feet": 50000,
            "year_built": 1995,
            "zoning": "M1",
            "property_type": "Industrial"
        },
        {
            "id": "1002", 
            "address": "456 Manufacturing Blvd, Chicago, IL",
            "latitude": 41.8825,
            "longitude": -87.6230,
            "square_feet": 75000,
            "year_built": 2005,
            "zoning": "M2",
            "property_type": "Industrial"
        },
        {
            "id": "1003",
            "address": "789 Factory St, Chicago, IL", 
            "latitude": 41.8711,
            "longitude": -87.6350,
            "square_feet": 35000,
            "year_built": 1988,
            "zoning": "I-1",
            "property_type": "Industrial"
        },
        {
            "id": "1004",
            "address": "321 Warehouse Way, Chicago, IL",
            "latitude": 41.8650,
            "longitude": -87.6180,
            "square_feet": 120000,
            "year_built": 2010,
            "zoning": "I-2", 
            "property_type": "Industrial"
        },
        {
            "id": "1005",
            "address": "654 Distribution Dr, Chicago, IL",
            "latitude": 41.8590,
            "longitude": -87.6420,
            "square_feet": 85000,
            "year_built": 1992,
            "zoning": "M1",
            "property_type": "Industrial"
        }
    ]
    return sample_data

def main():
    try:
        # Try to fetch real data first
        records = fetch_all()
        if not records:
            print("No data fetched from API, using sample data")
            records = create_sample_data()
    except Exception as e:
        print(f"Failed to fetch from API: {e}, using sample data")
        records = create_sample_data()
    
    save_records(records)
    print(f"Saved {len(records)} records to {CACHE_PATH}")

if __name__ == "__main__":
    main()
