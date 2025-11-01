# Quick Test Reference Card 🚀

## 📋 Quick Commands

### Docker Testing (Local)

```bash
# 1. Start all services
docker-compose up

# 2. Access application
# Frontend: http://localhost:80
# Backend: http://localhost:3001
# API Docs: http://localhost:3001/api/docs

# 3. Stop services
docker-compose down
```

**Time**: Instant (after first build)  
**Cost**: Free  
**Requirement**: Docker Desktop

---

### GitHub Actions Testing

```bash
# 1. Push to GitHub
git add .
git commit -m "Test CI/CD"
git push origin main

# 2. View results
# Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

**Time**: ~5 minutes  
**Cost**: Free  
**Requirement**: GitHub account

---

## ✅ Quick Verification

### Docker Working?

- [ ] `docker-compose up` starts without errors
- [ ] Frontend loads at http://localhost:80
- [ ] Backend responds at http://localhost:3001
- [ ] Health check returns 200: http://localhost:3001/health

### GitHub Actions Working?

- [ ] Go to Actions tab - see workflows running
- [ ] All jobs show green checkmarks ✓
- [ ] Build artifacts available for download
- [ ] No failed steps in logs

---

## 🆘 Quick Troubleshooting

### Docker Failed?

```bash
# Check Docker is running
docker --version

# Rebuild from scratch
docker-compose down -v
docker-compose up --build

# View logs
docker-compose logs -f
```

### GitHub Actions Failed?

```bash
# Check workflow logs in GitHub Actions tab
# Common fixes:
git add package-lock.json
git commit -m "Add lock file"
git push
```

---

## 📚 Full Guides

- **Docker**: [DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md)
- **GitHub Actions**: [GITHUB_ACTIONS_TEST_GUIDE.md](./GITHUB_ACTIONS_TEST_GUIDE.md)
- **Complete Setup**: [CI_CD_SETUP_GUIDE.md](./CI_CD_SETUP_GUIDE.md)

---

## 🎯 Success Indicators

| Component | Test | Expected Result |
|-----------|------|-----------------|
| **Docker** | `docker-compose up` | ✅ Frontend on :80, Backend on :3001 |
| **GitHub Actions** | Push to main | ✅ All workflows pass (green ✓) |
| **Local Dev** | `npm run dev` | ✅ Works as before (unchanged) |

---

**Quick Start**: Test Docker first, then GitHub Actions! 🚀
