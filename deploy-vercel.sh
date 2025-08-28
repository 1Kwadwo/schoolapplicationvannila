#!/bin/bash

echo "🚀 Deploying to Vercel..."
echo "=========================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Add all files to git
echo "📁 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Prepare for Vercel deployment - Full stack application"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🌐 Your full-stack application will be available at the Vercel URL"
echo "📋 Features available:"
echo "   - Complete CRUD operations"
echo "   - Authentication system"
echo "   - Database functionality"
echo "   - API endpoints"
echo ""
echo "🔐 Login credentials:"
echo "   Username: admin"
echo "   Password: admin123"
