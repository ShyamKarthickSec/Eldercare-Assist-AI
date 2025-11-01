# Quick Test Reference Card 🚀

## 📋 Quick Commands

### GitHub Actions Testing

```bash
# 1. Push to GitHub
git add .
git commit -m "Test CI/CD"
git push origin main

# 2. View results
# Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/actions

# 3. Local testing (with Act)
act -W .github/workflows/frontend-ci.yml
act -W .github/workflows/backend-ci.yml
```

**Time**: ~5 minutes  
**Cost**: Free  
**Requirement**: GitHub account

---

### Fly.io Testing

```bash
# 1. Install & Login
flyctl auth login

# 2. Create app
flyctl apps create eldercare-assist-ai

# 3. Create volume
flyctl volumes create eldercare_data --region syd --size 1

# 4. Set secrets
flyctl secrets set JWT_SECRET=your-secret-here

# 5. Deploy
cd server
flyctl deploy --config ../fly.toml

# 6. Verify
flyctl status
curl https://eldercare-assist-ai.fly.dev/health

# 7. Setup auto-deploy
flyctl auth token
# Add token to GitHub Secrets as FLY_API_TOKEN
```

**Time**: ~15 minutes  
**Cost**: ~$2.75/month  
**Requirement**: Fly.io account

---

## ✅ Quick Verification

### GitHub Actions Working?

- [ ] Go to Actions tab - see workflows running
- [ ] All jobs show green checkmarks ✓
- [ ] Build artifacts available for download
- [ ] No failed steps in logs

### Fly.io Working?

- [ ] `flyctl status` shows "started"
- [ ] Health check returns 200: `curl https://eldercare-assist-ai.fly.dev/health`
- [ ] API docs load: `https://eldercare-assist-ai.fly.dev/api/docs`
- [ ] No errors in logs: `flyctl logs`

---

## 🆘 Quick Troubleshooting

### GitHub Actions Failed?

```bash
# Check workflow logs in GitHub Actions tab
# Common fixes:
git add package-lock.json
git commit -m "Add lock file"
git push
```

### Fly.io Failed?

```bash
# Check logs
flyctl logs

# Restart app
flyctl restart

# Check secrets
flyctl secrets list

# SSH debug
flyctl ssh console
```

---

## 📚 Full Guides

- **GitHub Actions**: [GITHUB_ACTIONS_TEST_GUIDE.md](./GITHUB_ACTIONS_TEST_GUIDE.md)
- **Fly.io**: [FLY_IO_TEST_GUIDE.md](./FLY_IO_TEST_GUIDE.md)
- **Complete Setup**: [CI_CD_SETUP_GUIDE.md](./CI_CD_SETUP_GUIDE.md)

---

## 🎯 Success Indicators

| Component | Test | Expected Result |
|-----------|------|-----------------|
| **Docker** | `docker-compose up` | ✅ Frontend on :80, Backend on :3001 |
| **GitHub Actions** | Push to main | ✅ All workflows pass (green ✓) |
| **Fly.io** | `flyctl status` | ✅ "started", health checks passing |
| **Auto-Deploy** | Push to main | ✅ Deploys automatically to Fly.io |

---

**Quick Start**: Choose one to test first, then add the other! 🚀

