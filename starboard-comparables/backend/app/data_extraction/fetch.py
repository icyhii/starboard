import requests
import json
import os
from tenacity import retry, stop_after_attempt, wait_exponential

CACHE_PATH = os.path.join(os.path.dirname(__file__), '../../../data/cache/raw_records.json')
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
        batch = fetch_batch(offset, BATCH_SIZE)
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
    records = fetch_all()
    save_records(records)
    print(f"Saved {len(records)} records to {CACHE_PATH}")

if __name__ == "__main__":
    main()
