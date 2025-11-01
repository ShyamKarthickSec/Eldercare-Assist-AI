# Fly.io Deployment Testing Guide ☁️

## Quick Start: Deploy to Fly.io in 15 Minutes

---

## Prerequisites

- [x] Docker working locally
- [x] GitHub Actions passing
- [ ] Fly.io account (free tier available)
- [ ] Fly CLI installed

---

## Step 1: Create Fly.io Account (2 minutes)

1. Go to: https://fly.io/app/sign-up
2. Sign up (free - no credit card required for starter apps)
3. Verify your email

**Free Tier Includes**:
- 3 shared-cpu VMs
- 256MB RAM per VM (we use 512MB - $0.02/day)
- 3GB persistent storage
- Reasonable for testing!

---

## Step 2: Install Fly CLI (1 minute)

### Windows (PowerShell - Run as Admin)

```powershell
# Using PowerShell install script
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**Or download manually**:
https://github.com/superfly/flyctl/releases

### Verify Installation

```bash
flyctl version
# Should show: flyctl v0.x.xxx
```

---

## Step 3: Login to Fly.io (1 minute)

```bash
flyctl auth login
```

This opens a browser window. Click "Accept" to authenticate.

---

## Step 4: Create Fly.io App (2 minutes)

```bash
cd "D:\Study Materials\UniSyd\Model Based Software Engineering\stage 2"

# Create app
flyctl apps create eldercare-assist-ai
```

**Output**:
```
New app created: eldercare-assist-ai
```

**App URL**: https://eldercare-assist-ai.fly.dev

---

## Step 5: Create Persistent Volume for SQLite (1 minute)

```bash
# Create 1GB volume in Sydney region
flyctl volumes create eldercare_data --region syd --size 1
```

**Output**:
```
        ID: vol_xxxxxxxxxxxxx
      Name: eldercare_data
       App: eldercare-assist-ai
    Region: syd
      Zone: 7a6f
   Size GB: 1
 Encrypted: true
Created at: XX Nov 24 XX:XX
```

---

## Step 6: Set Environment Secrets (1 minute)

```bash
# Generate a secure JWT secret
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Set JWT secret
flyctl secrets set JWT_SECRET=$jwtSecret

# Set OpenAI API key (if you have one, otherwise skip)
flyctl secrets set OPENAI_API_KEY=sk-your-openai-key-here
```

**Output**:
```
Secrets are staged for the first deployment
```

---

## Step 7: Deploy to Fly.io (5 minutes - first deploy)

```bash
cd server
flyctl deploy --config ../fly.toml
```

**What happens**:
1. ✅ Uploads Dockerfile and code
2. ✅ Builds Docker image on Fly.io
3. ✅ Creates container
4. ✅ Mounts volume
5. ✅ Starts application
6. ✅ Health check passes

**Output**:
```
==> Verifying app config
--> Verified app config
==> Building image
...
==> Pushing image to fly
...
--> Pushing image done
==> Creating release
...
--> Release created
==> Monitoring deployment
...
 ✔ Machine xxxxx [app] update finished: success
--> Deployment successful!
```

---

## Step 8: Verify Deployment (1 minute)

### Check App Status

```bash
flyctl status
```

**Output**:
```
App
  Name     = eldercare-assist-ai
  Owner    = personal
  Hostname = eldercare-assist-ai.fly.dev
  Platform = machines

Machines
ID              STATE   ROLE    REGION  HEALTH CHECKS   IMAGE
xxxxx           started app     syd     1 total, 1 passing    ...
```

### Test Endpoints

```bash
# Health check
curl https://eldercare-assist-ai.fly.dev/health

# Expected: {"status":"ok","timestamp":"..."}
```

### View in Browser

1. **Health**: https://eldercare-assist-ai.fly.dev/health
2. **API Docs**: https://eldercare-assist-ai.fly.dev/api/docs
3. **Frontend** (not deployed via Fly.io by default)

---

## Step 9: Set Up Database (2 minutes)

```bash
# SSH into the container
flyctl ssh console

# Inside container:
cd /app
npx prisma migrate deploy
npm run seed

# Exit
exit
```

**Output**:
```
✓ Database seeded successfully!
```

---

## Step 10: Set Up Auto-Deploy from GitHub (2 minutes)

### Get Fly.io API Token

```bash
flyctl auth token
```

**Copy the token** (starts with `fo1_...`)

### Add to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `FLY_API_TOKEN`
5. Value: Paste the token
6. Click **Add secret**

### Test Auto-Deploy

```bash
# Make a small change
cd "D:\Study Materials\UniSyd\Model Based Software Engineering\stage 2"
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "Test auto-deploy"
git push origin main
```

**Watch GitHub Actions**:
1. Go to **Actions** tab
2. See "Deploy to Fly.io" workflow running
3. Wait for ✅ green checkmark

**Verify**:
```bash
flyctl logs
```

---

## 📊 Monitoring & Debugging

### View Logs (Real-time)

```bash
# Follow logs
flyctl logs

# Last 100 lines
flyctl logs -n 100

# Filter by severity
flyctl logs --level error
```

### Check App Health

```bash
# Overall status
flyctl status

# Detailed info
flyctl info

# Check certificates
flyctl certs list
```

### SSH into Container

```bash
# SSH console
flyctl ssh console

# Inside container, check:
ls /app
ls /data
cat /data/production.db
npx prisma studio --port 5555
```

### View Metrics

```bash
# Open dashboard
flyctl dashboard

# Or visit: https://fly.io/apps/eldercare-assist-ai
```

---

## 🐛 Troubleshooting

### Issue 1: App Not Starting

**Check logs**:
```bash
flyctl logs
```

**Common causes**:
- Missing secrets (JWT_SECRET)
- Database not initialized
- Port mismatch

**Fix**:
```bash
# Verify secrets
flyctl secrets list

# Restart app
flyctl restart
```

### Issue 2: Health Check Failing

**Error**: `Health check failed`

**Fix**:
```bash
# SSH in
flyctl ssh console

# Test health endpoint internally
curl http://localhost:3001/health

# Check if server is running
ps aux | grep node
```

### Issue 3: Database Locked

**Error**: `database is locked`

**Cause**: SQLite doesn't handle multiple writers well

**Fix**:
```bash
# Ensure only 1 instance
flyctl scale count 1
```

### Issue 4: Out of Memory

**Error**: `JavaScript heap out of memory`

**Fix**:
```bash
# Increase memory (costs more)
flyctl scale memory 1024
```

### Issue 5: Volume Not Mounting

**Check volumes**:
```bash
flyctl volumes list

# Should see eldercare_data volume
```

**Recreate if missing**:
```bash
flyctl volumes create eldercare_data --region syd --size 1
```

---

## 🔄 Common Operations

### Redeploy

```bash
cd server
flyctl deploy --config ../fly.toml
```

### Restart App

```bash
flyctl restart
```

### Scale App

```bash
# Change instance count
flyctl scale count 2

# Change memory
flyctl scale memory 512
```

### Rollback

```bash
# List releases
flyctl releases

# Rollback to previous
flyctl releases rollback
```

### Delete App (⚠️ Destructive)

```bash
# Stop app
flyctl apps destroy eldercare-assist-ai
```

---

## 💰 Cost Estimation

### Free Tier Usage
- **Shared CPU VM**: $0.02/day ($0.60/month)
- **256MB RAM**: Free
- **512MB RAM**: $0.0000008/second (~$2/month)
- **1GB Volume**: $0.15/month

**Total Estimated**: ~$2.75/month for basic setup

### Optimization Tips
- Use 256MB RAM if possible (free tier)
- Keep to 1 instance
- Use shared CPU (not dedicated)

---

## ✅ Testing Checklist

### Deployment Success

- [ ] App created (`flyctl apps list`)
- [ ] Volume created (`flyctl volumes list`)
- [ ] Secrets set (`flyctl secrets list`)
- [ ] Deploy successful (no errors)
- [ ] Status shows "started" (`flyctl status`)
- [ ] Health check passes (1 passing)

### Functionality

- [ ] Health endpoint returns 200
  - `curl https://eldercare-assist-ai.fly.dev/health`
- [ ] API docs accessible
  - `https://eldercare-assist-ai.fly.dev/api/docs`
- [ ] Database initialized (SSH + check)
- [ ] Logs show no errors (`flyctl logs`)

### Auto-Deploy

- [ ] `FLY_API_TOKEN` in GitHub Secrets
- [ ] Push to main triggers deploy workflow
- [ ] Deploy workflow succeeds (green ✓)
- [ ] Changes reflected on production

---

## 📈 Performance Testing

### Load Test (Optional)

```bash
# Install Apache Bench
# Windows: Download from https://www.apachelounge.com/download/

# Test health endpoint
ab -n 1000 -c 10 https://eldercare-assist-ai.fly.dev/health

# Results:
# - Requests per second
# - Time per request
# - Failed requests (should be 0)
```

### Monitor Response Times

```bash
# Ping endpoint
curl -w "@-" -o /dev/null -s https://eldercare-assist-ai.fly.dev/health <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
   time_starttransfer:  %{time_starttransfer}\n
                      ----------\n
          time_total:  %{time_total}\n
EOF
```

---

## 🎯 Success Criteria

Your Fly.io deployment is successful when:

- ✅ App accessible at https://eldercare-assist-ai.fly.dev
- ✅ Health check returns `{"status":"ok"}`
- ✅ API docs load without errors
- ✅ Database persists across restarts
- ✅ Auto-deploy from GitHub works
- ✅ Logs show no critical errors
- ✅ Response time < 500ms

---

## 🚀 Production Readiness

### Before Going Live

1. **Custom Domain** (optional)
   ```bash
   flyctl certs add yourdomain.com
   ```

2. **Monitoring**
   - Set up Sentry/LogRocket
   - Configure alerts

3. **Backups**
   ```bash
   # SSH in
   flyctl ssh console
   
   # Backup database
   cd /data
   sqlite3 production.db .dump > backup.sql
   ```

4. **Scaling**
   ```bash
   # Add more regions
   flyctl regions add syd mel
   
   # Increase instances
   flyctl scale count 2
   ```

---

## 📚 Additional Resources

- **Fly.io Docs**: https://fly.io/docs/
- **Fly.io Status**: https://status.fly.io/
- **Community**: https://community.fly.io/
- **Pricing**: https://fly.io/docs/about/pricing/

---

**Status**: Ready to deploy to Fly.io ✅  
**Time to First Deploy**: ~15 minutes  
**Monthly Cost**: ~$2.75 (free tier available)  
**Region**: Sydney (syd) - Australia

