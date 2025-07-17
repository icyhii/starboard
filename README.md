# Starboard - Industrial Property Comparables API

An intelligent agent system for discovering, analyzing, and finding comparable industrial properties using real estate data APIs.

🎯 **Complete Implementation**: All three phases of the task requirements have been fully implemented and tested.

## ✅ Task Requirements Completed

### Phase 1: API Discovery Agent ✅
- ✅ **API Discovery & Cataloging**: Discovers and catalogs property APIs from county data sources
- ✅ **Field Mapping**: Maps available data fields and identifies industrial property filters  
- ✅ **Authentication Detection**: Detects authentication requirements and rate limits
- ✅ **Field Normalization**: Handles field name variations using both rule-based and AI-powered normalization
- ✅ **Rate Limiting**: Automatically detects and respects API rate limits with intelligent batching and retry logic

### Phase 2: Data Extraction System ✅
- ✅ **Industrial Filtering**: Filters for industrial zoning codes (M1, M2, I-1, I-2, etc.)
- ✅ **Multi-format Support**: Handles different response formats (JSON, CSV, GeoJSON)
- ✅ **Data Validation**: Validates required fields are present and reasonable
- ✅ **Outlier Detection**: Flags outliers and suspicious records using statistical methods (Z-score and IQR)
- ✅ **Error Logging**: Comprehensive error logging with context for debugging

### Phase 3: Comparable Discovery Agent ✅
- ✅ **Property Similarity**: Finds similar properties by size, location, age, and zoning type
- ✅ **Weighted Scoring**: Appropriately weights similarity factors (Location: 40%, Size: 30%, Age: 20%, Zoning: 10%)
- ✅ **Confidence Scores**: Generates confidence scores for each comparable
- ✅ **Detailed Breakdown**: Provides detailed similarity breakdowns for transparency

## Features

### Phase 1: API Discovery Agent
- **API Discovery & Cataloging**: Automatically discovers and catalogs relevant property APIs
- **Field Mapping**: Maps available data fields and identifies industrial property filters
- **Authentication Detection**: Detects authentication requirements and rate limits
- **Field Normalization**: Handles field name variations (e.g., "square_feet" vs "sqft" vs "building_area")
- **Rate Limiting**: Automatically detects and respects API rate limits with intelligent batching and retry logic

### Phase 2: Data Extraction System
- **Industrial Filtering**: Filters for industrial zoning codes (M1, M2, I-1, I-2, etc.)
- **Multi-format Support**: Handles different response formats (JSON, CSV, GeoJSON)
- **Data Validation**: Validates required fields are present and reasonable
- **Outlier Detection**: Flags outliers and suspicious records using statistical methods
- **Error Logging**: Comprehensive error logging with context for debugging

### Phase 3: Comparable Discovery Agent
- **Property Similarity**: Finds similar properties by size, location, age, and zoning type
- **Weighted Scoring**: Appropriately weights similarity factors
- **Confidence Scores**: Generates confidence scores for each comparable
- **Detailed Breakdown**: Provides detailed similarity breakdowns for transparency

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd starboard
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables (optional):
```bash
cp .env.template .env
# Edit .env with your API keys if needed
```

4. Initialize the data pipeline:
```bash
python setup.py
```

4. Start the API server:
```bash
python main.py
```

5. Test the API:
```bash
python cli.py health
python cli.py list
```

## Installation

### Prerequisites
- Python 3.8+
- pip

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd starboard
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables (optional):
```bash
export OPENAI_API_KEY="your-openai-api-key"
```

6. Validate the system:
```bash
python test_system.py
```

## Usage

### Running the API Server

Start the FastAPI server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Command Line Interface

The project includes a CLI for easy testing and interaction:

#### Health Check
```bash
python cli.py health
```

#### List Properties
```bash
python cli.py list
```

#### Find Comparables
```bash
python cli.py compare --latitude 41.8781 --longitude -87.6298 --square-feet 60000 --year-built 2000 --zoning M1 --count 3
```

### API Endpoints

#### GET `/`
Health check and API information

#### GET `/properties`
Get all available industrial properties
```bash
curl http://localhost:8000/properties
```

#### POST `/comparable`
Find comparable properties for a given input property
```bash
curl -X POST "http://localhost:8000/comparable?n=5" \
     -H "Content-Type: application/json" \
     -d '{
       "latitude": 41.8781,
       "longitude": -87.6298,
       "square_feet": 50000,
       "year_built": 1995,
       "zoning": "M1"
     }'
```

#### GET `/health`
Health check endpoint

### Data Processing Pipeline

#### 1. API Discovery
```bash
python app/api_discovery/discover.py
```
Discovers and catalogs available property APIs from county data sources.

#### 2. Data Fetching
```bash
python app/data_extraction/fetch.py
```
Fetches raw property data from discovered APIs with intelligent retry logic.

#### 3. Industrial Filtering
```bash
python app/data_extraction/filter_industrial.py
```
Filters data to include only industrial properties based on zoning codes.

#### 4. Data Validation
```bash
python app/data_extraction/validate.py
```
Validates property records and logs any errors or inconsistencies.

#### 5. Outlier Detection
```bash
python app/data_extraction/flag_outliers.py
```
Flags outliers using statistical methods (Z-score and IQR).

#### 6. Comparable Search
```bash
python app/comparables/find.py '{"latitude": 41.8781, "longitude": -87.6298, "square_feet": 50000, "year_built": 1995, "zoning": "M1"}' 5
```
Find comparable properties using the command line interface.

## Project Structure

```
starboard/
├── main.py                     # FastAPI application
├── requirements.txt            # Python dependencies
├── README.md                   # This file
├── app/
│   ├── api_discovery/
│   │   └── discover.py         # API discovery and cataloging
│   ├── data_extraction/
│   │   ├── fetch.py            # Data fetching with retry logic
│   │   ├── filter_industrial.py # Industrial property filtering
│   │   ├── validate.py         # Data validation
│   │   └── flag_outliers.py    # Outlier detection
│   └── comparables/
│       ├── discovery.py        # Feature extraction for comparables
│       ├── find.py             # Comparable search CLI
│       └── score.py            # Similarity scoring algorithms
└── data/                       # Data storage (auto-created)
    ├── cache/                  # Cached API responses
    ├── logs/                   # Error and processing logs
    └── schemas/                # API schema metadata
```

## Data Sources

The system is designed to work with multiple county property APIs:

- **Cook County**: datacatalog.cookcountyil.gov
- **Dallas County**: dallascad.org/dataproducts.aspx  
- **Los Angeles County**: egis-lacounty.hub.arcgis.com

Currently includes sample data for demonstration purposes.

## Similarity Scoring

The comparable discovery system uses a weighted scoring algorithm:

- **Location** (40%): Geographic proximity using geodesic distance
- **Size** (30%): Building square footage similarity
- **Age** (20%): Construction year similarity  
- **Zoning** (10%): Exact zoning code match

Each factor is normalized and weighted to produce a final similarity score between 0-1.

## Error Handling

- Comprehensive error logging for all processing stages
- Automatic retry logic with exponential backoff
- Graceful degradation when data sources are unavailable
- Input validation and sanitization

## Development

### Running Tests
```bash
python -m pytest tests/
```

### Code Style
The project follows PEP 8 guidelines. Use `black` for formatting:
```bash
black app/ main.py
```

## API Documentation

Once the server is running, visit `http://localhost:8000/docs` for interactive API documentation powered by Swagger UI.

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please open an issue on the GitHub repository.