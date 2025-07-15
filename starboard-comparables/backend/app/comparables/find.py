import json
import os
from score import score

data_path = os.path.join(os.path.dirname(__file__), '../../../data/cache/outlier_flags.json')

def load_properties():
    with open(data_path, 'r') as f:
        return json.load(f)

def get_minmax(records):
    sizes = [r.get('square_feet', 0) for r in records]
    years = [r.get('year_built', 0) for r in records]
    return {
        'min_size': min(sizes) if sizes else 0,
        'max_size': max(sizes) if sizes else 0,
        'min_year': min(years) if years else 1900,
        'max_year': max(years) if years else 2025
    }

def find_reference(records, ref):
    if isinstance(ref, dict):
        return ref
    for r in records:
        if r.get('id') == ref:
            return r
    raise ValueError('Reference property not found')

def comparable_search(ref, records, N=5):
    minmax = get_minmax(records)
    scored = []
    for candidate in records:
        if candidate.get('id') == ref.get('id'):
            continue
        s = score(ref, candidate, minmax)
        breakdown = {
            'location': score.location_similarity(
                ref.get('latitude'), ref.get('longitude'),
                candidate.get('latitude'), candidate.get('longitude')
            ),
            'size': score.size_similarity(
                ref.get('square_feet', 0), candidate.get('square_feet', 0),
                minmax['min_size'], minmax['max_size']
            ),
            'year_built': score.age_similarity(
                ref.get('year_built', 0), candidate.get('year_built', 0),
                minmax['min_year'], minmax['max_year']
            ),
            'zoning': score.zoning_match(
                ref.get('zoning'), candidate.get('zoning')
            )
        }
        scored.append({
            'id': candidate.get('id'),
            'score': s,
            'breakdown': breakdown,
            'property': candidate
        })
    scored.sort(key=lambda x: x['score'], reverse=True)
    return scored[:N]

def main():
    import sys
    if len(sys.argv) < 2:
        print('Usage: python find.py <property_id or JSON> [N]')
        return
    records = load_properties()
    ref_arg = sys.argv[1]
    try:
        ref = json.loads(ref_arg)
    except Exception:
        ref = find_reference(records, ref_arg)
    N = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    results = comparable_search(ref, records, N)
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
