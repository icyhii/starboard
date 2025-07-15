import json
import os
from datetime import datetime

IN_PATH = os.path.join(os.path.dirname(__file__), '../../../data/cache/industrial_properties.json')
LOG_PATH = os.path.join(os.path.dirname(__file__), '../../../data/logs/validation_errors.log')
CURRENT_YEAR = datetime.now().year


def load_records():
    with open(IN_PATH, "r") as f:
        return json.load(f)


def validate_record(rec):
    errors = []
    sf = rec.get("square_feet")
    year = rec.get("year_built")
    address = rec.get("address")
    if sf is None or not isinstance(sf, (int, float)) or sf <= 1000:
        errors.append(f"Invalid square_feet: {sf}")
    if year is None or not isinstance(year, int) or year < 1900 or year > CURRENT_YEAR:
        errors.append(f"Invalid year_built: {year}")
    if not address or not str(address).strip():
        errors.append(f"Empty address: {address}")
    return errors


def log_errors(errors):
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    with open(LOG_PATH, "w") as f:
        for err in errors:
            f.write(err + "\n")


def main():
    records = load_records()
    all_errors = []
    for i, rec in enumerate(records):
        errs = validate_record(rec)
        for err in errs:
            all_errors.append(f"Record {i}: {err}")
    log_errors(all_errors)
    print(f"Logged {len(all_errors)} validation errors to {LOG_PATH}")


if __name__ == "__main__":
    main()
