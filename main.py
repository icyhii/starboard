
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Any
import json
import os
import uvicorn

app = FastAPI(title="Starboard Industrial Property Comparables API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data/cache/industrial_properties.json")
OUTLIER_PATH = os.path.join(os.path.dirname(__file__), "data/cache/outlier_flags.json")

def load_properties():
    """Load property data, preferring outlier-flagged data if available"""
    path = OUTLIER_PATH if os.path.exists(OUTLIER_PATH) else DATA_PATH
    if not os.path.exists(path):
        # Return sample data if no data files exist
        return [
            {
                "id": "1001",
                "address": "123 Industrial Ave, Chicago, IL",
                "latitude": 41.8781,
                "longitude": -87.6298,
                "square_feet": 50000,
                "year_built": 1995,
                "zoning": "M1",
                "property_type": "Industrial"
            }
        ]
    with open(path, "r") as f:
        return json.load(f)

class PropertyInput(BaseModel):
    latitude: float
    longitude: float
    square_feet: float
    year_built: int
    zoning: str

@app.get("/")
def root():
    return {"message": "Starboard Industrial Property Comparables API", "version": "1.0.0"}

@app.get("/properties")
def get_properties():
    """Get all available industrial properties"""
    try:
        properties = load_properties()
        return {"count": len(properties), "properties": properties}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading properties: {str(e)}")

@app.post("/comparable")
def find_comparables(input: PropertyInput, n: int = 5):
    """Find comparable properties for a given input property"""
    try:
        from app.comparables.score import score, location_similarity, size_similarity, age_similarity, zoning_match, weights
        
        records = load_properties()
        if not records:
            raise HTTPException(status_code=404, detail="No property data available")
        
        minmax = {
            "min_size": min([r.get("square_feet", 0) for r in records]),
            "max_size": max([r.get("square_feet", 0) for r in records]),
            "min_year": min([r.get("year_built", 0) for r in records]),
            "max_year": max([r.get("year_built", 0) for r in records])
        }
        
        subject = input.dict()
        scored = []
        
        for candidate in records:
            s = score(subject, candidate, minmax)
            breakdown = {
                "location": location_similarity(
                    subject.get("latitude"), subject.get("longitude"),
                    candidate.get("latitude"), candidate.get("longitude")
                ),
                "size": size_similarity(
                    subject.get("square_feet", 0), candidate.get("square_feet", 0),
                    minmax["min_size"], minmax["max_size"]
                ),
                "year_built": age_similarity(
                    subject.get("year_built", 0), candidate.get("year_built", 0),
                    minmax["min_year"], minmax["max_year"]
                ),
                "zoning": zoning_match(
                    subject.get("zoning"), candidate.get("zoning")
                )
            }
            scored.append({
                "id": candidate.get("id"),
                "score": s,
                "breakdown": breakdown,
                "property": candidate
            })
        
        scored.sort(key=lambda x: x["score"], reverse=True)
        return {
            "subject": subject,
            "comparables": scored[:n],
            "weights": weights,
            "total_found": len(scored)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding comparables: {str(e)}")

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "starboard-api"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
