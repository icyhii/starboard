#!/bin/bash

# Deployment script for Starboard backend to Vercel

echo "🚀 Deploying Starboard Backend to Vercel..."

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Deploy to Vercel
echo "📦 Starting Vercel deployment..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your API will be available at the URL provided by Vercel"
echo "📝 Update your frontend to use the new API endpoint"
