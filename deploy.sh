#!/bin/bash

echo "🚀 Deploying TrumpDonald app to Vercel..."

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
vercel --prod

echo "✅ Deployment completed!"
echo "Your app should now be live on Vercel."
