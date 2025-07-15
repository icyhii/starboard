
# Starboard Comparables

## Overview
Starboard Comparables is a property analytics platform for discovering and scoring industrial property comparables in Cook County using open data and AI-powered normalization.

## How to Run Backend
1. Ensure Python 3.11+ and install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Set your OpenAI API key in `.env`.
3. Start the FastAPI server:
   ```bash
   python backend/main.py
   ```
4. The API will be available at `http://localhost:8000`.

## How to Run Frontend
1. Navigate to `frontend/nextjs-app`:
   ```bash
   cd frontend/nextjs-app
   npm install
   npm run dev
   ```
2. Access the app at `http://localhost:3000`.

## Sample Request/Response
### POST /comparable
**Request:**
```json
{
  "latitude": 41.8781,
  "longitude": -87.6298,
  "square_feet": 5000,
  "year_built": 1980,
  "zoning": "M1"
}
```
**Response:**
```json
[
  {
    "id": "123",
    "score": 0.92,
    "breakdown": {
      "location": 0.95,
      "size": 0.90,
      "year_built": 0.85,
      "zoning": 1.0
    },
    "property": {
      "address": "123 Industrial Ave",
      "square_feet": 5100,
      "year_built": 1982,
      "zoning": "M1"
    }
  }
]
```

## Demo Video
[Demo Video](demo.mp4)
