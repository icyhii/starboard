import requests
import json
import os
from typing import List, Dict, Any

COOK_COUNTY_API_URL = "https://datacatalog.cookcountyil.gov/api/views/metadata/v1"
KEYWORDS = ["industrial", "property", "zoning"]
FIELDS_OF_INTEREST = ["PIN", "property id", "zoning", "square footage", "construction year", "address"]
SCHEMA_DIR = os.path.join(os.path.dirname(__file__), '../../data/schemas')
os.makedirs(SCHEMA_DIR, exist_ok=True)

def query_api_catalog() -> List[Dict[str, Any]]:
    response = requests.get(COOK_COUNTY_API_URL)
    response.raise_for_status()
    return response.json()

def extract_datasets(catalog: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    datasets = []
    for dataset in catalog:
        name = dataset.get('name', '').lower()
        description = dataset.get('description', '').lower()
        if any(kw in name or kw in description for kw in KEYWORDS):
            datasets.append(dataset)
    return datasets

def parse_schema(dataset: Dict[str, Any]) -> List[Dict[str, str]]:
    fields = []
    columns = dataset.get('columns', [])
    for col in columns:
        field_name = col.get('fieldName', '')
        field_type = col.get('dataTypeName', '')
        normalized = normalize_field(field_name)
        fields.append({"original": field_name, "normalized": normalized, "type": field_type})
    return fields

def normalize_field(field_name: str) -> str:
    name = field_name.lower()
    # Local rules
    if "pin" in name or "property_id" in name:
        return "property_id"
    if "zoning" in name:
        return "zoning"
    if any(kw in name for kw in ["sqft", "square_feet", "bldg_area", "sq_ft", "square", "area"]):
        return "square_feet"
    if "year" in name and ("built" in name or "construct" in name):
        return "construction_year"
    if "address" in name:
        return "address"
    if "lat" in name:
        return "latitude"
    if "lon" in name or "lng" in name:
        return "longitude"
    
    # Use OpenAI API for advanced normalization
    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        prompt = f"Normalize the field name '{field_name}' to a standard property schema field (e.g., square_feet, property_id, zoning, construction_year, address, latitude, longitude). Return only the normalized field name."
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=10
        )
        normalized = response.choices[0].message.content.strip()
        if normalized:
            return normalized
    except Exception as e:
        print(f"OpenAI normalization failed: {e}")
        pass
    return field_name

def detect_fields_of_interest(fields: List[Dict[str, str]]) -> List[Dict[str, str]]:
    return [f for f in fields if f["normalized"] in ["property_id", "zoning", "square_feet", "construction_year", "address", "latitude", "longitude"]]

def detect_response_format(dataset: Dict[str, Any]) -> str:
    return dataset.get('viewType', 'json')

def check_auth_required(dataset: Dict[str, Any]) -> bool:
    return dataset.get('requiresApiKey', False)

def detect_rate_limits(dataset_id: str) -> Dict[str, Any]:
    # Try a sample request to the dataset endpoint
    sample_url = f"https://datacatalog.cookcountyil.gov/resource/{dataset_id}.json?$limit=1"
    try:
        resp = requests.get(sample_url)
        if resp.status_code == 429:
            limit = resp.headers.get('X-RateLimit-Limit', None)
            return {"requests_per_minute": int(limit) if limit else None}
    except Exception:
        pass
    return {"requests_per_minute": 60}  # Default assumption

def save_metadata(dataset_id: str, metadata: Dict[str, Any]):
    path = os.path.join(SCHEMA_DIR, f"{dataset_id}.json")
    with open(path, "w") as f:
        json.dump(metadata, f, indent=2)

def main():
    try:
        catalog = query_api_catalog()
        datasets = extract_datasets(catalog)
        print(f"Found {len(datasets)} relevant datasets")
        
        for dataset in datasets:
            dataset_id = dataset.get('id', 'unknown')
            fields = parse_schema(dataset)
            fields_of_interest = detect_fields_of_interest(fields)
            response_format = detect_response_format(dataset)
            auth_required = check_auth_required(dataset)
            rate_limits = detect_rate_limits(dataset_id)
            
            metadata = {
                "dataset_id": dataset_id,
                "name": dataset.get('name', ''),
                "description": dataset.get('description', ''),
                "fields": fields,
                "fields_of_interest": fields_of_interest,
                "response_format": response_format,
                "auth_required": auth_required,
                "rate_limits": rate_limits
            }
            
            save_metadata(dataset_id, metadata)
            print(f"Processed dataset: {dataset_id}")
            
    except Exception as e:
        print(f"API discovery failed: {e}")

if __name__ == "__main__":
    main()
        rate_limit = detect_rate_limits(dataset_id)
        metadata = {
            "dataset_id": dataset_id,
            "fields": fields_of_interest,
            "auth_required": auth_required,
            "rate_limit": rate_limit,
            "response_format": response_format
        }
        save_metadata(dataset_id, metadata)
        print(f"Saved metadata for dataset {dataset_id}")

if __name__ == "__main__":
    main()
