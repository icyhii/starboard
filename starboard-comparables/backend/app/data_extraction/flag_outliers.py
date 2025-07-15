import json
import os
import numpy as np

IN_PATH = os.path.join(os.path.dirname(__file__), '../../../data/cache/industrial_properties.json')
OUT_PATH = os.path.join(os.path.dirname(__file__), '../../../data/cache/outlier_flags.json')


def load_records():
    with open(IN_PATH, "r") as f:
        return json.load(f)


def zscore_outliers(values, threshold=3):
    arr = np.array(values, dtype=float)
    mean = np.mean(arr)
    std = np.std(arr)
    return [abs((v - mean) / std) > threshold if std > 0 else False for v in arr]


def iqr_outliers(values):
    arr = np.array(values, dtype=float)
    q1 = np.percentile(arr, 25)
    q3 = np.percentile(arr, 75)
    iqr = q3 - q1
    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr
    return [(v < lower or v > upper) for v in arr]


def flag_outliers(records):
    sizes = [rec.get("square_feet", 0) for rec in records]
    ages = [rec.get("year_built", 0) for rec in records]
    size_flags = zscore_outliers(sizes)
    age_flags = iqr_outliers(ages)
    for i, rec in enumerate(records):
        rec["size_outlier"] = bool(size_flags[i])
        rec["age_outlier"] = bool(age_flags[i])
    return records


def save_records(records):
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump(records, f, indent=2)


def main():
    records = load_records()
    flagged = flag_outliers(records)
    save_records(flagged)
    print(f"Flagged outliers and saved to {OUT_PATH}")


if __name__ == "__main__":
    main()
