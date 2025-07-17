import json
import os
import re

RAW_PATH = os.path.join(os.path.dirname(__file__), '../../data/cache/raw_records.json')
OUT_PATH = os.path.join(os.path.dirname(__file__), '../../data/cache/industrial_properties.json')
INDUSTRIAL_CODES = [r"^M1$", r"^M2$", r"^I-1$", r"^I-2$"]


def load_records():
    with open(RAW_PATH, "r") as f:
        return json.load(f)


def is_industrial(zoning):
    if not zoning:
        return False
    zoning = str(zoning).strip().upper()
    for code in INDUSTRIAL_CODES:
        if re.match(code, zoning):
            return True
    return False


def filter_industrial(records):
    filtered = []
    for rec in records:
        zoning = rec.get("zoning") or rec.get("normalized_zoning")
        if is_industrial(zoning):
            filtered.append(rec)
    return filtered


def save_records(records):
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump(records, f, indent=2)


def main():
    records = load_records()
    industrial = filter_industrial(records)
    save_records(industrial)
    print(f"Saved {len(industrial)} industrial properties to {OUT_PATH}")


if __name__ == "__main__":
    main()
