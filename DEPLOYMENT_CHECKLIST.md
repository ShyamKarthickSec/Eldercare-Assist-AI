# Deployment Checklist ✅

## Pre-Deployment

### Local Testing
- [ ] All features work locally (`npm run dev`)
- [ ] Docker build succeeds (`docker-compose up`)
- [ ] Frontend connects to backend
- [ ] Database migrations run successfully
- [ ] All tests pass
- [ ] No console errors in browser

### Code Quality
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript compiles (`npm run build`)
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Sensitive data removed from code
- [ ] Environment variables properly configured

### Configuration
- [ ] `.env.example` updated with all required variables
- [ ] `.dockerignore` files created
- [ ] `docker-compose.yml` tested
- [ ] Health endpoint working (`/health`)
- [ ] CORS configured correctly

---

## GitHub Setup

### Repository
- [ ] Code pushed to GitHub
- [ ] `.github/workflows/` directory committed
- [ ] All workflow files present:
  - [ ] `frontend-ci.yml`
  - [ ] `backend-ci.yml`
  - [ ] `deploy-fly.yml`

### GitHub Actions
- [ ] Workflows enabled in repository settings
- [ ] `FLY_API_TOKEN` secret added
- [ ] All CI workflows passing
- [ ] Build artifacts uploading correctly

---

## Fly.io Setup

### Account & CLI
- [ ] Fly.io account created (https://fly.io/app/sign-up)
- [ ] Fly CLI installed (`flyctl version`)
- [ ] Logged in (`flyctl auth login`)
- [ ] API token generated (`flyctl auth token`)

### Application
- [ ] App created (`flyctl apps create eldercare-assist-ai`)
- [ ] `fly.toml` configured correctly
- [ ] Region set (e.g., `syd` for Sydney)
- [ ] Health check endpoint configured

### Storage
- [ ] Volume created for SQLite:
  ```bash
  flyctl volumes create eldercare_data --region syd --size 1
  ```
- [ ] Volume mounted in `fly.toml`
- [ ] Database path set correctly: `file:/data/production.db`

### Secrets
- [ ] JWT_SECRET set:
  ```bash
  flyctl secrets set JWT_SECRET=your-secret-here
  ```
- [ ] OPENAI_API_KEY set (if using AI features):
  ```bash
  flyctl secrets set OPENAI_API_KEY=sk-your-key-here
  ```
- [ ] All secrets verified (`flyctl secrets list`)

---

## Initial Deployment

### Manual Deploy
- [ ] First deployment successful:
  ```bash
  cd server
  flyctl deploy --config ../fly.toml
  ```
- [ ] App status healthy (`flyctl status`)
- [ ] Logs show no errors (`flyctl logs`)
- [ ] Health check returns 200 (`curl https://your-app.fly.dev/health`)

### Database Setup
- [ ] SSH into app (`flyctl ssh console`)
- [ ] Migrations run:
  ```bash
  cd /app
  npx prisma migrate deploy
  ```
- [ ] Database seeded (optional):
  ```bash
  npm run seed
  ```

---

## Post-Deployment Verification

### Application Health
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] API documentation accessible (`/api/docs`)
- [ ] Database queries work
- [ ] Authentication works (login/logout)
- [ ] File uploads work (if applicable)

### Monitoring
- [ ] Fly.io dashboard accessible
- [ ] Metrics showing correct values
- [ ] No error spikes in logs
- [ ] Response times acceptable
- [ ] Memory usage normal

### Security
- [ ] HTTPS enabled (Fly.io does this automatically)
- [ ] CORS configured for production domain
- [ ] Secrets not exposed in logs
- [ ] `.env` files not committed
- [ ] No hardcoded credentials

---

## GitHub Actions Integration

### Auto-Deployment
- [ ] Push to `main` triggers deployment
- [ ] Workflow completes successfully
- [ ] App updates correctly
- [ ] No downtime during deployment
- [ ] Rollback tested (if needed)

### Notifications
- [ ] Team notified on deployment success/failure
- [ ] Slack/Discord webhook configured (optional)

---

## Documentation

### User Documentation
- [ ] Deployment URL shared with team
- [ ] Login credentials provided
- [ ] User guide updated
- [ ] API documentation accessible

### Developer Documentation
- [ ] `README.md` updated
- [ ] `CI_CD_SETUP_GUIDE.md` reviewed
- [ ] Environment variables documented
- [ ] Troubleshooting guide available

---

## Rollback Plan

### If Deployment Fails
```bash
# Rollback to previous version
flyctl releases rollback

# Or redeploy specific version
git revert <commit-hash>
git push
```

### Emergency Contacts
- [ ] Team contacts documented
- [ ] Fly.io support info saved
- [ ] Escalation path defined

---

## Long-term Maintenance

### Regular Tasks
- [ ] Monitor error logs weekly
- [ ] Update dependencies monthly
- [ ] Backup database regularly
- [ ] Review security advisories
- [ ] Scale resources as needed

### Backup Strategy
```bash
# Backup database
flyctl ssh console
cd /data
sqlite3 production.db .dump > backup.sql

# Download backup
flyctl ssh sftp get /data/backup.sql
```

---

## 🎉 Success Criteria

Your deployment is successful when:

1. ✅ App accessible at production URL
2. ✅ All features work as expected
3. ✅ No errors in logs
4. ✅ Health check returns 200 OK
5. ✅ GitHub Actions workflows passing
6. ✅ Database persists across deployments
7. ✅ Team can access and use the app

---

## 📞 Support

- **Fly.io Docs**: https://fly.io/docs/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Project Docs**: See [CI_CD_SETUP_GUIDE.md](./CI_CD_SETUP_GUIDE.md)

---

**Deployment Date**: _________________  
**Deployed By**: _________________  
**Production URL**: https://eldercare-assist-ai.fly.dev  
**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Complete

