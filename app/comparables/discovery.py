import json
import os
from typing import List, Dict, Any

IN_PATH = os.path.join(os.path.dirname(__file__), '../../data/cache/outlier_flags.json')

SIMILARITY_FEATURES = [
    "latitude",
    "longitude", 
    "square_feet",
    "year_built",
    "zoning"
]

def load_records() -> List[Dict[str, Any]]:
    with open(IN_PATH, "r") as f:
        return json.load(f)

def extract_features(record: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "latitude": record.get("latitude"),
        "longitude": record.get("longitude"),
        "square_feet": record.get("square_feet"),
        "year_built": record.get("year_built"),
        "zoning": record.get("zoning") or record.get("normalized_zoning")
    }

def main():
    records = load_records()
    features = [extract_features(rec) for rec in records]
    print(f"Extracted {len(features)} comparable features.")
    # Further logic for similarity search can be added here

if __name__ == "__main__":
    main()
