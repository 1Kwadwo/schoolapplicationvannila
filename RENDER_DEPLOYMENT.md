# Render Deployment Guide

## Prerequisites
- GitHub account with your school management application repository
- Render account (free at render.com)

## Deployment Steps

### 1. Connect to Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with your GitHub account
3. Click "New +" and select "Web Service"

### 2. Connect Repository
1. Choose "GitHub" as your Git provider
2. Select your repository: `1Kwadwo/schoolapplicationvannila`
3. Click "Connect"

### 3. Configure Build Settings
- **Name**: `school-management-app` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Root Directory**: Leave empty (root of repo)

### 4. Environment Variables (Optional)
Add these environment variables in Render dashboard:
- `NODE_ENV`: `production`
- `SESSION_SECRET`: Your session secret (optional, has default)
- `PORT`: Leave empty (Render sets this automatically)

### 5. Deploy
1. Click "Create Web Service"
2. Wait for the build to complete (usually 2-5 minutes)
3. Your site will be live at a Render URL

## Features
- ✅ Full-stack deployment (frontend + backend)
- ✅ SQLite database with sample data
- ✅ Automatic database initialization
- ✅ Session management
- ✅ CORS enabled
- ✅ Modern admin dashboard
- ✅ No authentication required (direct access)

## Advantages of Render over Netlify
- ✅ **Full-stack support** - Both frontend and backend in one service
- ✅ **Persistent database** - SQLite database persists between deployments
- ✅ **Better Node.js support** - Native Node.js environment
- ✅ **No serverless limitations** - No timeout issues
- ✅ **Simpler deployment** - One service instead of frontend + functions

## Troubleshooting
- If you see build errors, check the build logs in Render dashboard
- Make sure all dependencies are in package.json
- Verify the start command is correct: `npm start`

## Custom Domain
You can add a custom domain in the Render dashboard under "Settings" → "Custom Domains".

## Database
The SQLite database will be automatically created and populated with sample data on first deployment.

## Access
- **URL**: Your Render URL (e.g., `https://school-management-app.onrender.com`)
- **No login required** - Direct access to dashboard
- **Sample data included** - 5 students, 5 courses, 10 enrollments
