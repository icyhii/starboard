# 🎨 Starboard Frontend Specification for Lovable.ai

## Project Overview
Create a modern, interactive web application for industrial property comparable analysis using React and TypeScript.

**IMPORTANT**: Replace `YOUR_VERCEL_URL` with your actual Vercel deployment URL after backend deployment.

## API Integration Setup
**Base URL**: `https://YOUR_VERCEL_URL.vercel.app`

**Key Endpoints**:
- `GET /health` - Health check
- `GET /properties` - Get all properties  
- `POST /comparable` - Find comparables (main endpoint)

**Sample API Call**:
```javascript
fetch('https://YOUR_VERCEL_URL.vercel.app/comparable', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    latitude: 34.0522,
    longitude: -118.2437,
    square_feet: 25000,
    year_built: 2010,
    zoning: "M1"
  })
})
```

## Design Requirements

### Brand & Style
- **Name**: Starboard
- **Color Scheme**: 
  - Primary: Deep blue (#1e40af) / Navy (#0f172a)
  - Secondary: Cyan/Teal (#06b6d4) / (#0d9488)
  - Accent: Orange (#f97316) / Yellow (#fbbf24)
  - Background: Dark gradients, glass morphism effects
- **Typography**: Modern, clean sans-serif (Inter, Poppins, or similar)
- **Style**: Dark theme with glassmorphism, subtle animations, professional

### Layout & Navigation
- **Header**: Logo, navigation menu, dark theme
- **Pages**: 
  1. Home (landing page)
  2. Property Search (main application)
  3. Results (comparable properties display)

## Page Specifications

### 1. Home Page
**Hero Section:**
- Large heading: "Find Comparable Industrial Properties with AI"
- Subtitle: "Discover the best property matches using advanced algorithms and market data"
- CTA Button: "Start Property Search" → links to search page
- Background: Animated gradient with floating geometric shapes

**Features Section:**
- 3-4 feature cards with icons:
  - 🏭 "Industrial Focus" - Specialized for industrial properties
  - 📊 "AI-Powered Scoring" - Advanced algorithmic matching
  - 🗺️ "Location Intelligence" - Geographic proximity analysis
  - 📈 "Market Insights" - Comprehensive property analytics

**Statistics Section:**
- Display impressive numbers (can be placeholder):
  - "10,000+ Properties Analyzed"
  - "95% Accuracy Rate"
  - "50+ Cities Covered"

### 2. Property Search Page
**Search Form (Left Panel):**
- **Property Location:**
  - Latitude input (number, placeholder: "34.0522")
  - Longitude input (number, placeholder: "-118.2437")
  - Address search (optional, converts to lat/lng)
- **Property Details:**
  - Square Feet (number input, placeholder: "50000")
  - Year Built (number input, placeholder: "2010")
  - Zoning (dropdown: Industrial, Mixed-Use, Commercial, Other)
- **Search Options:**
  - Number of comparables (slider: 1-10, default: 5)
- **Search Button**: Large, prominent "Find Comparables"

**Map Preview (Right Panel):**
- Interactive map showing the input location
- Pin/marker for the subject property
- Zoom controls, modern map styling

### 3. Results Page
**Results Header:**
- "Found X Comparable Properties"
- Filters: Sort by score, distance, size, year
- View toggle: Cards / Table / Map

**Property Cards (Grid Layout):**
Each card shows:
- **Property Image** (placeholder or default industrial image)
- **Compatibility Score** (large percentage badge)
- **Key Details:**
  - Address/Location
  - Square Feet
  - Year Built
  - Zoning
  - Distance from subject property
- **Score Breakdown** (expandable):
  - Location Match: X%
  - Size Match: X%
  - Age Match: X%
  - Zoning Match: X%
- **View Details** button

**Interactive Map:**
- Shows all comparable properties as markers
- Subject property highlighted differently
- Click markers to see property details popup
- Legend for different score ranges

**Analytics Dashboard:**
- **Score Distribution Chart** (bar chart)
- **Geographic Distribution** (scatter plot on map)
- **Property Characteristics** (comparison table)

## Technical Integration

### API Integration
**Base URL**: `YOUR_VERCEL_DEPLOYMENT_URL` (to be provided after deployment)

**Endpoints:**
1. **Health Check**: `GET /health`
2. **Find Comparables**: `POST /comparable`

**Example API Call:**
```javascript
const findComparables = async (propertyData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/comparable?n=5`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
        square_feet: propertyData.square_feet,
        year_built: propertyData.year_built,
        zoning: propertyData.zoning
      })
    });
    
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
  } catch (error) {
    console.error('Error finding comparables:', error);
    throw error;
  }
};
```

**Expected Response Format:**
```json
[
  {
    "id": "property_123",
    "score": 0.85,
    "breakdown": {
      "location": 0.9,
      "size": 0.8,
      "year_built": 0.85,
      "zoning": 1.0
    },
    "property": {
      "id": "property_123",
      "latitude": 34.0522,
      "longitude": -118.2437,
      "square_feet": 48000,
      "year_built": 2012,
      "zoning": "Industrial",
      "address": "123 Industrial Way, Los Angeles, CA"
    }
  }
]
```

## Interactive Features

### Search Experience
- **Real-time validation** of form inputs
- **Loading states** with skeleton screens
- **Error handling** with user-friendly messages
- **Search history** (optional enhancement)

### Results Experience
- **Smooth transitions** between search and results
- **Expandable score breakdowns** on card hover/click
- **Interactive map** with property details popups
- **Export functionality** (PDF/CSV) for results

### Data Visualization
- **Score visualization**: Progress bars, radial charts
- **Comparison charts**: Side-by-side property comparisons
- **Geographic visualization**: Heatmaps, cluster markers

## Technical Stack Recommendations
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS for rapid development
- **Charts**: Chart.js or Recharts for visualizations
- **Maps**: Mapbox GL JS or Google Maps
- **State Management**: React hooks or Zustand
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios or Fetch API

## Responsive Design
- **Mobile First**: Optimized for mobile screens
- **Tablet**: Adjusted layout for medium screens
- **Desktop**: Full feature experience
- **Key Breakpoints**: 
  - Mobile: < 768px (stacked layout)
  - Tablet: 768px - 1024px (adjusted grid)
  - Desktop: > 1024px (full layout)

## Performance & UX
- **Loading States**: Skeleton screens, progress indicators
- **Error Boundaries**: Graceful error handling
- **Accessibility**: WCAG compliant, keyboard navigation
- **SEO**: Meta tags, semantic HTML
- **Performance**: Code splitting, lazy loading

## Additional Features (Nice to Have)
- **Property comparison tool** (side-by-side comparison)
- **Saved searches** functionality
- **Email/sharing** capabilities
- **Advanced filters** (price range, specific features)
- **Market trends** and analytics
- **PDF report generation**

---

**Ready to build?** Once the backend is deployed to Vercel, replace `YOUR_VERCEL_DEPLOYMENT_URL` with the actual deployment URL and start building this amazing property search application!
