# GitHub Actions Testing Guide 🔄

## Quick Start: Test GitHub Actions in 5 Minutes

### Step 1: Push Your Code to GitHub

```bash
cd "D:\Study Materials\UniSyd\Model Based Software Engineering\stage 2"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Add CI/CD pipeline with Docker"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to main branch
git push -u origin main
```

---

### Step 2: View Workflow Runs

1. Go to your GitHub repository
2. Click the **"Actions"** tab
3. You'll see workflows running automatically:
   - ✅ **Frontend CI** (if frontend files changed)
   - ✅ **Backend CI** (if server files changed)
   - 🚫 **Deploy to Fly.io** (skipped until you add FLY_API_TOKEN)

---

### Step 3: Check Workflow Status

#### ✅ Successful Run
```
Frontend CI    ✓ Build and Test (3m 24s)
                ✓ Docker Build Test (2m 15s)

Backend CI     ✓ Build and Test (Node 18.x) (4m 12s)
                ✓ Build and Test (Node 20.x) (4m 08s)
                ✓ Docker Build Test (3m 45s)
                ✓ Security Scan (0m 42s)
```

#### ❌ Failed Run
Click the failed workflow → Click the failed job → View logs to debug

---

## 🧪 Testing Without Pushing (Local Act)

You can test GitHub Actions locally using **Act**:

### Install Act

**Windows (using Chocolatey)**:
```bash
choco install act-cli
```

**Windows (using Scoop)**:
```bash
scoop install act
```

**Manual Download**:
https://github.com/nektos/act/releases

### Run Workflows Locally

```bash
# Test frontend CI
act -W .github/workflows/frontend-ci.yml

# Test backend CI
act -W .github/workflows/backend-ci.yml

# Test all workflows
act
```

**Note**: Act requires Docker Desktop to be running.

---

## 📋 Test Checklist

### Before Pushing

- [ ] Docker builds succeed locally (`docker-compose up --build`)
- [ ] Frontend accessible at http://localhost:80
- [ ] Backend accessible at http://localhost:3001
- [ ] Health check returns 200 (`http://localhost:3001/health`)
- [ ] No TypeScript errors (`cd server && npm run build`)
- [ ] No linting errors (`cd frontend && npm run lint`)

### After Pushing

- [ ] All workflows appear in Actions tab
- [ ] Frontend CI passes (green checkmark)
- [ ] Backend CI passes (green checkmark)
- [ ] No failed jobs
- [ ] Build artifacts uploaded successfully

---

## 🐛 Common Issues & Solutions

### Issue 1: Workflow Not Triggering

**Cause**: Workflow file not in correct location

**Solution**:
```bash
# Ensure workflows are in .github/workflows/
ls .github/workflows/

# Should see:
# frontend-ci.yml
# backend-ci.yml
# deploy-fly.yml
```

### Issue 2: Build Fails on GitHub but Works Locally

**Cause**: Missing dependencies or environment differences

**Solution**:
1. Check workflow logs for specific error
2. Ensure `package-lock.json` is committed
3. Verify Node version matches (18.x)
4. Check Prisma schema is committed

### Issue 3: Docker Build Fails in CI

**Cause**: Out of memory or timeout

**Solution**:
- Workflows already configured with caching
- Multi-stage builds minimize size
- If still failing, check Dockerfile syntax

### Issue 4: "FLY_API_TOKEN not found"

**Cause**: Deploy workflow runs but secret not set

**Solution**: Skip deploy until Fly.io is set up (see below)

---

## 📊 Understanding Workflow Results

### Build Artifacts

After successful runs, download artifacts:

1. Go to workflow run
2. Scroll to "Artifacts" section
3. Download:
   - `frontend-build` (built frontend)
   - `backend-build` (compiled TypeScript)

### Job Summary

Each workflow provides a summary:
- Node version used
- Branch name
- Commit SHA
- Build status

---

## 🎯 Manual Trigger

You can manually trigger the deploy workflow:

1. Go to **Actions** tab
2. Click **"Deploy to Fly.io"**
3. Click **"Run workflow"** dropdown
4. Select branch
5. Click **"Run workflow"** button

---

## ✅ Success Criteria

Your CI is working correctly when:

- [x] All workflows show green checkmarks
- [x] Build time < 10 minutes
- [x] No failed jobs
- [x] Artifacts uploaded successfully
- [x] Security scan shows no critical vulnerabilities

---

## 📝 Next Steps

Once GitHub Actions are working:
1. Set up Fly.io (see [FLY_IO_TEST_GUIDE.md](./FLY_IO_TEST_GUIDE.md))
2. Add `FLY_API_TOKEN` to GitHub Secrets
3. Push to main → Automatic deployment! 🚀

---

**Status**: Ready to test GitHub Actions ✅  
**Time to First Test**: ~5 minutes  
**Prerequisites**: GitHub account, repository created

