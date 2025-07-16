# 🚀 Starboard Backend Deployment Guide

## Deploy Backend to Vercel

### Step 1: Login to Vercel
```bash
cd /workspaces/startboard/starboard-comparables/backend
vercel login
```
Follow the authentication process in your browser.

### Step 2: Deploy to Production
```bash
vercel --prod
```

### Step 3: Configure Project (if prompted)
- Project name: `starboard-backend` (or your preferred name)
- Framework: `Other` 
- Source code location: `./` (current directory)
- Build command: (leave empty or use default)
- Output directory: (leave empty or use default)

## Expected Output
After successful deployment, you'll get a URL like:
```
https://starboard-backend-[random-id].vercel.app
```

## API Endpoints Available
- **GET** `/` - Health check
- **GET** `/health` - Detailed health status  
- **GET** `/properties` - Get all properties
- **POST** `/comparable` - Find comparable properties

### Example API Usage
```javascript
// Find comparables
const response = await fetch('https://your-deployment-url.vercel.app/comparable', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    latitude: 34.0522,
    longitude: -118.2437,
    square_feet: 50000,
    year_built: 2010,
    zoning: "Industrial"
  })
});
const comparables = await response.json();
```

## Files Configured for Deployment
- ✅ `vercel.json` - Deployment configuration
- ✅ `requirements.txt` - Python dependencies
- ✅ `main.py` - FastAPI app with CORS configured
- ✅ All API endpoints ready

## Next: Frontend with Lovable.ai
Once deployed, use the Vercel URL in your Lovable.ai frontend project.
