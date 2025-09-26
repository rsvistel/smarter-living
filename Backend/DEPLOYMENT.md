# Deployment Guide

## Railway Deployment (Recommended)

### Prerequisites
- GitHub repository
- Railway account (free tier available)

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect the Dockerfile

3. **Add PostgreSQL Database**
   - In your Railway project dashboard
   - Click "New Service" → "Database" → "PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` environment variable

4. **Configure Environment Variables**
   - In Railway project settings, add:
     - `ASPNETCORE_ENVIRONMENT=Production`
     - `PORT=8080` (if not auto-detected)

5. **Deploy**
   - Railway will automatically build and deploy
   - Your app will be available at the generated Railway URL

### Health Check
Once deployed, verify your app is running:
- Visit `https://your-app.railway.app/health`
- Should return: `{"status":"healthy","timestamp":"..."}`

### Alternative Platforms

#### Render
1. Connect GitHub repo
2. Select "Web Service"
3. Use Docker environment
4. Add PostgreSQL database addon

#### DigitalOcean App Platform
1. Create new app from GitHub
2. Select Dockerfile
3. Add managed PostgreSQL database
4. Configure environment variables

## Local Testing
```bash
# Build and run with Docker Compose
docker-compose up --build

# Test health endpoint
curl http://localhost:5000/health
```