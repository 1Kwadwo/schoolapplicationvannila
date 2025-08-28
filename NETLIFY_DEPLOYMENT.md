# Netlify Deployment Guide

## Prerequisites
- GitHub account with your school management application repository
- Netlify account (free at netlify.com)

## Deployment Steps

### 1. Connect to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with your GitHub account
3. Click "New site from Git"

### 2. Connect Repository
1. Choose "GitHub" as your Git provider
2. Select your school management application repository
3. Click "Connect"

### 3. Configure Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `frontend`
- **Base directory**: (leave empty)

### 4. Environment Variables (Optional)
Add these environment variables in Netlify dashboard:
- `SESSION_SECRET`: Your session secret (optional, has default)
- `NODE_ENV`: `production`

### 5. Deploy
1. Click "Deploy site"
2. Wait for the build to complete
3. Your site will be live at a Netlify URL

## Features
- ✅ Automatic deployments from GitHub
- ✅ Serverless functions for API
- ✅ SQLite database support
- ✅ Session management
- ✅ CORS enabled
- ✅ Modern admin dashboard

## Troubleshooting
- If you see build errors, check the build logs in Netlify dashboard
- Make sure all dependencies are in package.json
- Verify the netlify.toml configuration

## Custom Domain
You can add a custom domain in the Netlify dashboard under "Domain settings".
