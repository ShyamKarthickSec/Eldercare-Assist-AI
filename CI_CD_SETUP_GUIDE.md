# CI/CD Setup Guide - ElderCare Assist AI

## 📋 Table of Contents

- [Overview](#overview)
- [Local Development with Docker](#local-development-with-docker)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Fly.io Deployment](#flyio-deployment)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## 🎯 Overview

This project includes a complete CI/CD pipeline with:

- **Dockerization**: Multi-stage builds for frontend and backend
- **GitHub Actions**: Automated testing and deployment
- **Fly.io**: Cloud hosting with persistent SQLite storage

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ├─── Push to main/develop
                      │
        ┌─────────────▼──────────────┐
        │    GitHub Actions          │
        │  ┌──────────────────────┐  │
        │  │  Frontend CI         │  │
        │  │  - Build & Test      │  │
        │  │  - Docker Image      │  │
        │  └──────────────────────┘  │
        │  ┌──────────────────────┐  │
        │  │  Backend CI          │  │
        │  │  - Build & Test      │  │
        │  │  - Prisma Generate   │  │
        │  │  - Docker Image      │  │
        │  └──────────────────────┘  │
        │  ┌──────────────────────┐  │
        │  │  Deploy to Fly.io    │  │
        │  │  - Push Docker       │  │
        │  │  - Health Check      │  │
        │  └──────────────────────┘  │
        └─────────────┬──────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │       Fly.io Cloud          │
        │  ┌──────────────────────┐   │
        │  │  Backend Container   │   │
        │  │  + SQLite Volume     │   │
        │  └──────────────────────┘   │
        └─────────────────────────────┘
```

---

## 🐳 Local Development with Docker

### Prerequisites

- Docker Desktop installed and running
- Docker Compose v2+

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd <project-root>
   ```

2. **Create environment file** (backend):
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start all services**:
   ```bash
   # From project root
   docker-compose up
   ```

4. **Access the application**:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3001
   - API Docs: http://localhost:3001/api/docs

### Development Mode (Hot Reload)

For development with hot reload:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This mounts your source code and runs `npm run dev` for both services.

- Frontend: http://localhost:5173 (Vite dev server)
- Backend: http://localhost:3001 (ts-node-dev)

### Docker Commands

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose build

# Clean everything (including volumes)
docker-compose down -v

# Run backend shell
docker-compose exec backend sh

# Run database migrations
docker-compose exec backend npx prisma migrate dev

# Seed database
docker-compose exec backend npm run seed
```

### File Structure

```
project-root/
├── frontend/
│   ├── Dockerfile              # Multi-stage build (Node + Nginx)
│   ├── .dockerignore           # Exclude node_modules, etc.
│   └── ...
├── server/
│   ├── Dockerfile              # TypeScript + Prisma + Puppeteer
│   ├── .dockerignore           # Exclude dev files
│   └── ...
├── docker-compose.yml          # Production-like setup
├── docker-compose.dev.yml      # Development overrides
└── fly.toml                    # Fly.io configuration
```

---

## ⚙️ GitHub Actions CI/CD

### Workflows

Three workflows are configured in `.github/workflows/`:

#### 1. Frontend CI (`frontend-ci.yml`)

**Triggers**: Push/PR to `main` or `develop` (only if frontend files change)

**Jobs**:
- **Build and Test**:
  - Tests on Node 18.x and 20.x
  - Runs `npm ci`, `npm run lint`, `npm run build`
  - Uploads build artifacts
- **Docker Build**:
  - Builds Docker image
  - Uses GitHub Actions cache

**Badge**:
```markdown
[![Frontend CI](https://github.com/<your-org>/<your-repo>/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/<your-org>/<your-repo>/actions/workflows/frontend-ci.yml)
```

#### 2. Backend CI (`backend-ci.yml`)

**Triggers**: Push/PR to `main` or `develop` (only if server files change)

**Jobs**:
- **Build and Test**:
  - Tests on Node 18.x and 20.x
  - Generates Prisma Client
  - Builds TypeScript
  - Runs database migrations (test DB)
  - Uploads build artifacts
- **Docker Build**:
  - Builds Docker image with Prisma support
  - Uses GitHub Actions cache
- **Security Scan**:
  - Runs `npm audit`

**Badge**:
```markdown
[![Backend CI](https://github.com/<your-org>/<your-repo>/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/<your-org>/<your-repo>/actions/workflows/backend-ci.yml)
```

#### 3. Deploy to Fly.io (`deploy-fly.yml`)

**Triggers**: 
- Push to `main` branch
- Manual trigger via GitHub UI

**Jobs**:
- **Deploy**:
  - Checks out code
  - Sets up Fly CLI
  - Deploys backend to Fly.io
  - Reports status

**Badge**:
```markdown
[![Deploy](https://github.com/<your-org>/<your-repo>/actions/workflows/deploy-fly.yml/badge.svg)](https://github.com/<your-org>/<your-repo>/actions/workflows/deploy-fly.yml)
```

### Setup GitHub Actions

1. **Push workflows to GitHub**:
   ```bash
   git add .github/
   git commit -m "Add CI/CD workflows"
   git push
   ```

2. **Add Fly.io token to GitHub Secrets**:
   - Go to: `Settings` → `Secrets and variables` → `Actions`
   - Click `New repository secret`
   - Name: `FLY_API_TOKEN`
   - Value: Your Fly.io API token (see Fly.io section)

3. **Verify workflows**:
   - Go to: `Actions` tab in GitHub
   - Ensure all workflows are enabled
   - Make a test commit to trigger CI

---

## ☁️ Fly.io Deployment

### Prerequisites

- Fly.io account (free tier available)
- Fly CLI installed: https://fly.io/docs/hands-on/install-flyctl/

### Initial Setup

1. **Login to Fly.io**:
   ```bash
   flyctl auth login
   ```

2. **Create Fly.io app** (one-time):
   ```bash
   flyctl apps create eldercare-assist-ai
   ```

3. **Create persistent volume for SQLite**:
   ```bash
   flyctl volumes create eldercare_data --region syd --size 1
   ```

4. **Set secrets**:
   ```bash
   flyctl secrets set JWT_SECRET=your-super-secret-jwt-key
   flyctl secrets set OPENAI_API_KEY=sk-your-openai-key
   ```

5. **Deploy manually** (first time):
   ```bash
   cd server
   flyctl deploy --config ../fly.toml
   ```

6. **Get API token for GitHub Actions**:
   ```bash
   flyctl auth token
   ```
   Copy the token and add it to GitHub Secrets as `FLY_API_TOKEN`.

### Configuration (`fly.toml`)

```toml
app = "eldercare-assist-ai"
primary_region = "syd"  # Sydney, Australia

[build]
  dockerfile = "./server/Dockerfile"

[env]
  PORT = "3001"
  NODE_ENV = "production"
  DATABASE_URL = "file:/data/production.db"

[mounts]
  source = "eldercare_data"
  destination = "/data"
  initial_size = "1GB"

[[services]]
  internal_port = 3001
  protocol = "tcp"
  
  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
  
  [[services.ports]]
    handlers = ["http"]
    port = 80
    force_https = true
  
  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

### Fly.io Commands

```bash
# Deploy app
flyctl deploy

# View logs
flyctl logs

# SSH into container
flyctl ssh console

# Check app status
flyctl status

# Scale resources
flyctl scale vm shared-cpu-1x --memory 512

# View secrets
flyctl secrets list

# Set secret
flyctl secrets set KEY=value

# Restart app
flyctl restart

# Destroy app (careful!)
flyctl apps destroy eldercare-assist-ai
```

### Database Management on Fly.io

```bash
# SSH into the app
flyctl ssh console

# Inside the container:
cd /data
ls -lh production.db

# Run Prisma migrations
cd /app
npx prisma migrate deploy

# Seed database
npm run seed
```

### Accessing Your App

- **Production URL**: https://eldercare-assist-ai.fly.dev
- **API Docs**: https://eldercare-assist-ai.fly.dev/api/docs
- **Health Check**: https://eldercare-assist-ai.fly.dev/health

---

## 🔒 Security & Secrets

### Local Development

Create a `.env` file in the `server/` directory:

```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=local-dev-secret
OPENAI_API_KEY=sk-your-key
```

**⚠️ Never commit `.env` to version control!**

### Production (Fly.io)

Set secrets using Fly CLI:

```bash
flyctl secrets set JWT_SECRET=production-secret-key-here
flyctl secrets set OPENAI_API_KEY=sk-prod-key-here
```

### GitHub Actions

Add secrets in GitHub:

1. Go to: `Settings` → `Secrets and variables` → `Actions`
2. Add required secrets:
   - `FLY_API_TOKEN`: For Fly.io deployment

---

## 🐛 Troubleshooting

### Docker Issues

**Issue**: "Cannot connect to Docker daemon"

```bash
# Start Docker Desktop
# Or on Linux:
sudo systemctl start docker
```

**Issue**: "Port already in use"

```bash
# Find process using port
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill process or change port in docker-compose.yml
```

**Issue**: "Volume mount not working"

```bash
# Ensure Docker Desktop has file sharing enabled
# Settings → Resources → File Sharing
```

### GitHub Actions Issues

**Issue**: "FLY_API_TOKEN not found"

- Ensure secret is added: `Settings` → `Secrets and variables` → `Actions`
- Secret name must match exactly: `FLY_API_TOKEN`

**Issue**: "Build failing on Prisma generate"

- Ensure `package.json` has `prisma generate` in build script
- Check Dockerfile copies `prisma/` directory

**Issue**: "Docker build out of memory"

- Increase Docker Desktop memory: `Settings` → `Resources` → `Memory`
- Optimize Dockerfile (use multi-stage builds)

### Fly.io Issues

**Issue**: "Volume not mounting"

```bash
# Check volume exists
flyctl volumes list

# Create if missing
flyctl volumes create eldercare_data --region syd --size 1
```

**Issue**: "Database locked"

```bash
# SQLite doesn't handle multiple writers well
# Ensure only one instance is running
flyctl scale count 1
```

**Issue**: "App crash on startup"

```bash
# Check logs
flyctl logs

# Common fixes:
# - Ensure DATABASE_URL points to /data/
# - Run migrations: flyctl ssh console → npx prisma migrate deploy
# - Check secrets: flyctl secrets list
```

---

## 🎯 Best Practices

### Development Workflow

1. **Local development** (no Docker):
   ```bash
   # Terminal 1: Backend
   cd server
   npm run dev
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

2. **Test with Docker** (before pushing):
   ```bash
   docker-compose up --build
   ```

3. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

4. **CI runs automatically** on push

5. **Deploy to Fly.io** (auto on `main` branch)

### Database Migrations

**Development**:
```bash
cd server
npx prisma migrate dev --name your-migration-name
```

**Production (Fly.io)**:
```bash
flyctl ssh console
cd /app
npx prisma migrate deploy
```

### Rollback Strategy

**Fly.io**:
```bash
# List releases
flyctl releases

# Rollback to previous release
flyctl releases rollback
```

**GitHub**:
```bash
# Revert commit
git revert <commit-hash>
git push
```

---

## 📊 Monitoring

### Health Checks

- **Local**: http://localhost:3001/health
- **Production**: https://eldercare-assist-ai.fly.dev/health

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-01T12:00:00.000Z"
}
```

### Fly.io Monitoring

```bash
# View metrics
flyctl dashboard

# View logs (real-time)
flyctl logs -a eldercare-assist-ai

# Check app status
flyctl status
```

### GitHub Actions

- Go to: `Actions` tab
- View workflow runs
- Download artifacts
- Check job logs

---

## 🚀 Quick Reference

### Local Development (No Docker)

```bash
# Backend
cd server && npm run dev

# Frontend
cd frontend && npm run dev
```

### Docker Development

```bash
# Start
docker-compose up

# Stop
docker-compose down

# Rebuild
docker-compose up --build
```

### Fly.io Deployment

```bash
# Deploy
cd server && flyctl deploy --config ../fly.toml

# Check status
flyctl status

# View logs
flyctl logs
```

### GitHub Actions

```bash
# Add secrets
# Settings → Secrets → New secret
# Name: FLY_API_TOKEN
# Value: <your-token>
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Fly.io Documentation](https://fly.io/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## ✅ Verification Checklist

Before going to production:

- [ ] Docker builds work locally (`docker-compose up`)
- [ ] All GitHub Actions workflows pass
- [ ] Fly.io app created and configured
- [ ] Volume created for SQLite (`flyctl volumes list`)
- [ ] Secrets set on Fly.io (`flyctl secrets list`)
- [ ] `FLY_API_TOKEN` added to GitHub Secrets
- [ ] Health endpoint returns 200 OK
- [ ] Database migrations run successfully
- [ ] Frontend connects to backend API
- [ ] All environment variables set correctly
- [ ] `.env` files in `.gitignore`
- [ ] README updated with deployment info

---

**Status**: ✅ CI/CD Setup Complete  
**Last Updated**: November 1, 2025  
**Maintained By**: ElderCare Assist AI Team

