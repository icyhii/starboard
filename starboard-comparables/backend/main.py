
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Any
import json
import os
import uvicorn

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "app/data_extraction/industrial_properties.json")
OUTLIER_PATH = os.path.join(os.path.dirname(__file__), "app/data_extraction/outlier_flags.json")

def load_properties():
    path = OUTLIER_PATH if os.path.exists(OUTLIER_PATH) else DATA_PATH
    with open(path, "r") as f:
        return json.load(f)

class PropertyInput(BaseModel):
    latitude: float
    longitude: float
    square_feet: float
    year_built: int
    zoning: str

@app.get("/properties")
def get_properties():
    return load_properties()

@app.post("/comparable")
def find_comparables(input: PropertyInput, n: int = 5):
    from app.comparables.score import score, location_similarity, size_similarity, age_similarity, zoning_match, weights
    records = load_properties()
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
    return scored[:n]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
