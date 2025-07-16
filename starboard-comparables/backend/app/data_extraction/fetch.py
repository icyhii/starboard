import requests
import json
import csv
import os
from tenacity import retry, stop_after_attempt, wait_exponential
from typing import List, Dict, Any

CACHE_PATH = os.path.join(os.path.dirname(__file__), '../../../data/cache/raw_records.json')
DATASET_ID = "abcd-1234"  # Replace with actual dataset id
BASE_URL = f"https://datacatalog.cookcountyil.gov/resource/{DATASET_ID}"
BATCH_SIZE = 1000
MAX_RECORDS = 10000  # Set a reasonable limit for demo

# Supported formats
SUPPORTED_FORMATS = {
    'json': '.json',
    'csv': '.csv',
    'geojson': '.geojson'
}

@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=2, max=10))
def fetch_batch(offset: int, limit: int, format_type: str = 'json') -> List[Dict[str, Any]]:
    """Fetch a batch of records in the specified format"""
    if format_type not in SUPPORTED_FORMATS:
        raise ValueError(f"Unsupported format: {format_type}")
    
    api_url = f"{BASE_URL}{SUPPORTED_FORMATS[format_type]}"
    params = {"$limit": limit, "$offset": offset}
    
    response = requests.get(api_url, params=params)
    response.raise_for_status()
    
    if format_type == 'json':
        return response.json()
    elif format_type == 'csv':
        return parse_csv_response(response.text)
    elif format_type == 'geojson':
        return parse_geojson_response(response.json())
    
    return []

def parse_csv_response(csv_text: str) -> List[Dict[str, Any]]:
    """Parse CSV response into list of dictionaries"""
    lines = csv_text.strip().split('\n')
    if not lines:
        return []
    
    reader = csv.DictReader(lines)
    return [dict(row) for row in reader]

def parse_geojson_response(geojson_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse GeoJSON response into list of property dictionaries"""
    records = []
    features = geojson_data.get('features', [])
    
    for feature in features:
        properties = feature.get('properties', {})
        geometry = feature.get('geometry', {})
        
        # Extract coordinates if available
        if geometry.get('type') == 'Point':
            coords = geometry.get('coordinates', [])
            if len(coords) >= 2:
                properties['longitude'] = coords[0]
                properties['latitude'] = coords[1]
        
        records.append(properties)
    
    return records

def fetch_all(format_type: str = 'json'):
    """Fetch all records in the specified format"""
    all_records = []
    offset = 0
    while True:
        batch = fetch_batch(offset, BATCH_SIZE, format_type)
        if not batch:
            break
        all_records.extend(batch)
        offset += BATCH_SIZE
        if len(all_records) >= MAX_RECORDS:
            break
    return all_records

def save_records(records):
    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
    with open(CACHE_PATH, "w") as f:
        json.dump(records, f, indent=2)

def main():
    import sys
    format_type = sys.argv[1] if len(sys.argv) > 1 else 'json'
    
    print(f"Fetching data in {format_type} format...")
    records = fetch_all(format_type)
    save_records(records)
    print(f"Saved {len(records)} records to {CACHE_PATH}")

if __name__ == "__main__":
    main()
