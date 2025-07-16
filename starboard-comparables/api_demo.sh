#!/bin/bash
# Simple API Demo Script for Starboard Comparables
# Shows raw API interaction using curl

echo "🏭 STARBOARD COMPARABLES - API DEMO"
echo "=================================="
echo

# Check if server is running
echo "1️⃣ Checking if FastAPI server is running..."
if curl -s http://localhost:8000/properties > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Please start it with: python backend/main.py"
    exit 1
fi

echo
echo "2️⃣ Fetching available properties..."
echo "GET /properties"
echo "----------------------------------------"
curl -s http://localhost:8000/properties | jq '.'

echo
echo "3️⃣ Finding comparables for an industrial property..."
echo "POST /comparable"
echo "----------------------------------------"
echo "Input Property:"
cat << EOF | tee /tmp/sample_property.json
{
  "latitude": 41.8781,
  "longitude": -87.6298,
  "square_feet": 5100,
  "year_built": 1982,
  "zoning": "M1"
}
EOF

echo
echo "Response:"
curl -s -X POST http://localhost:8000/comparable \
  -H "Content-Type: application/json" \
  -d @/tmp/sample_property.json | jq '.'

echo
echo "🎯 API Demo completed!"
echo "The /comparable endpoint returns scored matches with detailed breakdowns."
