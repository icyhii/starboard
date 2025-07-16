import numpy as np
from geopy.distance import geodesic

def min_max_normalize(val, min_val, max_val):
    if max_val == min_val:
        return 0.0
    return (val - min_val) / (max_val - min_val)

def zscore_normalize(val, mean, std):
    if std == 0:
        return 0.0
    return (val - mean) / std

def location_similarity(lat1, lon1, lat2, lon2):
    if None in [lat1, lon1, lat2, lon2]:
        return 0.0
    dist = geodesic((lat1, lon1), (lat2, lon2)).meters
    # Assume max relevant distance is 10km
    return max(0.0, 1.0 - min(dist, 10000) / 10000)

def size_similarity(size1, size2, min_size, max_size):
    n1 = min_max_normalize(size1, min_size, max_size)
    n2 = min_max_normalize(size2, min_size, max_size)
    return 1.0 - abs(n1 - n2)

def age_similarity(year1, year2, min_year, max_year):
    n1 = min_max_normalize(year1, min_year, max_year)
    n2 = min_max_normalize(year2, min_year, max_year)
    return 1.0 - abs(n1 - n2)

def zoning_match(z1, z2):
    """
    Calculate zoning compatibility score.
    Returns 1.0 for exact match, partial scores for compatible zones.
    """
    if not z1 or not z2:
        return 0.0
    
    z1 = str(z1).upper().strip()
    z2 = str(z2).upper().strip()
    
    # Exact match
    if z1 == z2:
        return 1.0
    
    # Define compatible zoning groups
    industrial_zones = {'M1', 'M2', 'I-1', 'I-2', 'INDUSTRIAL', 'MANUFACTURING'}
    mixed_use_zones = {'MIXED-USE', 'MIXED USE', 'MU', 'M-U'}
    commercial_zones = {'C1', 'C2', 'COMMERCIAL', 'RETAIL'}
    
    # Normalize common variations
    z1_normalized = z1.replace('-', '').replace(' ', '')
    z2_normalized = z2.replace('-', '').replace(' ', '')
    
    # Check if both are in the same compatible group
    if (z1 in industrial_zones and z2 in industrial_zones) or \
       (z1_normalized in [z.replace('-', '').replace(' ', '') for z in industrial_zones] and 
        z2_normalized in [z.replace('-', '').replace(' ', '') for z in industrial_zones]):
        return 0.9  # High compatibility within industrial
    
    if (z1 in mixed_use_zones and z2 in mixed_use_zones) or \
       (z1_normalized in [z.replace('-', '').replace(' ', '') for z in mixed_use_zones] and 
        z2_normalized in [z.replace('-', '').replace(' ', '') for z in mixed_use_zones]):
        return 0.9  # High compatibility within mixed-use
    
    # Mixed-use is somewhat compatible with industrial
    if ((z1 in mixed_use_zones or z1_normalized == 'MIXEDUSE') and 
        (z2 in industrial_zones or z2_normalized in [z.replace('-', '').replace(' ', '') for z in industrial_zones])) or \
       ((z2 in mixed_use_zones or z2_normalized == 'MIXEDUSE') and 
        (z1 in industrial_zones or z1_normalized in [z.replace('-', '').replace(' ', '') for z in industrial_zones])):
        return 0.6  # Moderate compatibility
    
    # Commercial and mixed-use compatibility
    if ((z1 in commercial_zones and z2 in mixed_use_zones) or 
        (z2 in commercial_zones and z1 in mixed_use_zones)):
        return 0.5  # Some compatibility
    
    # No compatibility
    return 0.0

weights = {
    "location": 0.4,
    "size": 0.3,
    "year_built": 0.2,
    "zoning": 0.1
}

def score(subject, candidate, minmax):
    loc_sim = location_similarity(
        subject.get("latitude"), subject.get("longitude"),
        candidate.get("latitude"), candidate.get("longitude")
    )
    size_sim = size_similarity(
        subject.get("square_feet", 0), candidate.get("square_feet", 0),
        minmax["min_size"], minmax["max_size"]
    )
    age_sim = age_similarity(
        subject.get("year_built", 0), candidate.get("year_built", 0),
        minmax["min_year"], minmax["max_year"]
    )
    zone_sim = zoning_match(
        subject.get("zoning"), candidate.get("zoning")
    )
    final_score = (
        weights["location"] * loc_sim +
        weights["size"] * size_sim +
        weights["year_built"] * age_sim +
        weights["zoning"] * zone_sim
    )
    return final_score

# Example usage:
# minmax = {"min_size": 1000, "max_size": 10000, "min_year": 1900, "max_year": 2025}
# score(subject, candidate, minmax)
