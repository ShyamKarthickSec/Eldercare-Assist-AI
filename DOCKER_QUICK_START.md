# Docker Quick Start Guide 🐳

## 🚀 Get Started in 3 Steps

### Step 1: Start Docker

Make sure Docker Desktop is running on your machine.

### Step 2: Run the Application

```bash
docker-compose up
```

That's it! The application will:
- Build frontend and backend Docker images
- Start all services
- Set up the database
- Be ready in ~2-3 minutes

### Step 3: Access the App

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3001/api
- **API Documentation**: http://localhost:3001/api/docs

---

## 📝 Common Commands

### Start (background mode)
```bash
docker-compose up -d
```

### Stop
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Rebuild
```bash
docker-compose up --build
```

### Clean Everything
```bash
docker-compose down -v  # Warning: Deletes database!
```

---

## 🛠️ Development Mode (Hot Reload)

For development with live code reloading:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Access:
- **Frontend**: http://localhost:5173 (Vite)
- **Backend**: http://localhost:3001 (ts-node-dev)

---

## 🔧 Useful Commands

### Run Database Seed
```bash
docker-compose exec backend npm run seed
```

### Run Migrations
```bash
docker-compose exec backend npx prisma migrate dev
```

### Access Backend Shell
```bash
docker-compose exec backend sh
```

### View Database
```bash
docker-compose exec backend npx prisma studio
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change ports in docker-compose.yml
# Or stop conflicting services
```

### Cannot Connect to Docker
```bash
# Start Docker Desktop
# Check: docker --version
```

### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up
```

---

## 📚 More Info

See [CI_CD_SETUP_GUIDE.md](./CI_CD_SETUP_GUIDE.md) for detailed documentation.

---

**Need help?** Check the [Troubleshooting](#troubleshooting) section or open an issue.

