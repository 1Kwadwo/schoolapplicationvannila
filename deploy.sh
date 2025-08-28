#!/bin/bash

# School Management App - GitHub Deployment Script

echo "🚀 School Management App - GitHub Deployment"
echo "=============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit: School Management Application"
    echo "✅ Git repository initialized"
fi

# Check current status
echo "📊 Current Git Status:"
git status --porcelain

# Add all files
echo "📁 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Update: School Management Application $(date)"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🌐 No remote repository found."
    echo "Please create a GitHub repository and run:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to your GitHub repository"
echo "2. Go to Settings → Pages"
echo "3. Set Source to 'Deploy from a branch'"
echo "4. Select branch: 'gh-pages' (will be created by GitHub Actions)"
echo "5. Save"
echo ""
echo "🌐 Your app will be available at:"
echo "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME"
echo ""
echo "🔧 For full-stack deployment (Render/Heroku):"
echo "Check the DEPLOYMENT.md file for detailed instructions"
