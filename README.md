# ElderCare Assist AI 🏥

> A comprehensive elderly care management platform with AI-powered features, voice assistance, and real-time health monitoring.

[![Frontend CI](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/frontend-ci.yml)
[![Backend CI](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/backend-ci.yml)
[![Deploy](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/deploy-fly.yml/badge.svg)](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/deploy-fly.yml)

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Start all services
docker-compose up

# Access the application
# Frontend: http://localhost:80
# Backend: http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

See [DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md) for detailed Docker instructions.

### Option 2: Local Development

```bash
# Terminal 1: Backend
cd server
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Access: http://localhost:5173
```

---

## 📋 Features

### For Patients 👴👵
- 📊 **Personalized Dashboard** - View health metrics, medication adherence, and upcoming appointments
- 💊 **Medication Reminders** - Track and manage daily medications with smart notifications
- 🗣️ **Voice AI Companion** - Conversational assistant with voice commands and SOS alerts
- 💬 **Companion Chat** - AI-powered chat for emotional support and companionship
- 📝 **Health Timeline** - Visual timeline of all health activities and events
- 🚨 **Emergency SOS** - One-tap or voice-activated emergency alerts to caregivers
- 😊 **Mood Tracking** - Express daily mood with emoji-based interface
- 📱 **Responsive Design** - Works on all devices

### For Caregivers 👨‍⚕️👩‍⚕️
- 👁️ **Patient Monitoring** - Real-time view of patient's health status and mood
- 🗺️ **Location Tracking** - Geo-fencing alerts for patient safety
- 🔔 **Alerts & Notifications** - Instant notifications for missed medications, SOS, and geo-fence breaches
- 📓 **Shared Notes** - Create and manage notes with AI-generated summaries
- 📊 **Patient Timeline** - Full access to patient's health history
- ✅ **Reminder Management** - Acknowledge and manage patient reminders

### For Doctors 🩺
- 📋 **Patient Overview** - Comprehensive view of all assigned patients
- 🏥 **Medical History** - Access FHIR-compliant health records (My Health Record integration)
- 📊 **Daily Health Summaries** - AI-generated summaries of patient status
- 📄 **Health Reports** - Download AI-generated PDF reports with comprehensive analytics
- 📝 **Shared Notes Access** - Read-only access to caregiver notes with AI summaries
- 💊 **Prescription & Diagnosis** - View medication history and diagnoses

### AI Features 🤖
- 📝 **Automatic Note Summaries** - AI-generated summaries for all shared notes
- 💬 **Intelligent Chat Responses** - Context-aware, empathetic conversation
- 📊 **Health Report Generation** - Comprehensive PDF reports with insights
- 🎯 **Sentiment Analysis** - Mood and risk assessment in conversations
- 🗣️ **Voice Intent Detection** - Advanced voice command parsing (notes, SOS)
- 🛡️ **Safety Filters** - Prevents medical advice, ensures safe interactions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  - Vite + React 19                                          │
│  - React Router for navigation                              │
│  - Axios for API calls                                      │
│  - Chart.js for visualizations                              │
│  - Leaflet for maps                                         │
│  - Web Speech API for voice                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ REST API
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Backend (Express)                        │
│  - Node.js + TypeScript                                     │
│  - Express.js                                               │
│  - Prisma ORM                                               │
│  - JWT Authentication                                       │
│  - OpenAI SDK for AI features                               │
│  - Puppeteer for PDF generation                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  Database (SQLite)                          │
│  - Lightweight, file-based                                  │
│  - Prisma migrations                                        │
│  - Persistent storage                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router v7
- **UI**: Custom CSS with responsive design
- **Charts**: Chart.js + React-Chartjs-2
- **Maps**: Leaflet + React-Leaflet
- **Icons**: React Icons (Lucide)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: SQLite
- **Authentication**: JWT (jsonwebtoken)
- **AI**: OpenAI SDK (GPT-4o-mini)
- **PDF Generation**: Puppeteer + html-pdf-node
- **API Docs**: Swagger (swagger-jsdoc + swagger-ui-express)
- **Validation**: Zod
- **Scheduling**: node-cron

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: Fly.io
- **Version Control**: Git + GitHub

---

## 📦 Project Structure

```
project-root/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── PatientPages/       # Patient dashboard & features
│   │   ├── CaregiverPages/     # Caregiver dashboard
│   │   ├── ClinicianPages/     # Doctor dashboard
│   │   ├── Login/              # Authentication pages
│   │   ├── Home/               # Landing page
│   │   └── lib/                # API client & utilities
│   ├── Dockerfile              # Frontend Docker build
│   └── package.json
│
├── server/                      # Express backend
│   ├── src/
│   │   ├── auth/               # Authentication & JWT
│   │   ├── patients/           # Patient management
│   │   ├── users/              # User management
│   │   ├── timeline/           # Health timeline
│   │   ├── reminders/          # Medication reminders
│   │   ├── notes/              # Shared notes
│   │   ├── companion/          # AI chat companion
│   │   ├── voice/              # Voice commands
│   │   ├── reports/            # Report generation
│   │   ├── fhir/               # FHIR integration
│   │   ├── ai/                 # OpenAI integration
│   │   ├── mood/               # Mood tracking
│   │   └── alerts/             # Alerts & notifications
│   ├── prisma/                 # Database schema & migrations
│   ├── Dockerfile              # Backend Docker build
│   └── package.json
│
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
│       ├── frontend-ci.yml     # Frontend build & test
│       ├── backend-ci.yml      # Backend build & test
│       └── deploy-fly.yml      # Fly.io deployment
│
├── docker-compose.yml          # Local Docker setup
├── docker-compose.dev.yml      # Development overrides
├── fly.toml                    # Fly.io configuration
│
└── Documentation/
    ├── CI_CD_SETUP_GUIDE.md    # Complete CI/CD guide
    ├── DOCKER_QUICK_START.md   # Docker quick start
    ├── DEPLOYMENT_CHECKLIST.md # Pre-deployment checklist
    ├── TEST_PLAN.md            # Testing documentation
    ├── MANUAL_TEST_GUIDE.md    # Manual testing guide
    └── VOICE_SOS_IMPLEMENTATION.md  # Voice SOS feature docs
```

---

## 🔐 Demo Accounts

After seeding the database, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Patient | `patient@example.com` | `password123` |
| Caregiver | `caregiver@example.com` | `password123` |
| Doctor | `doctor@example.com` | `password123` |

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild images
docker-compose up --build

# Development mode (hot reload)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Run database seed
docker-compose exec backend npm run seed

# Access backend shell
docker-compose exec backend sh
```

See [DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md) for more commands.

---

## 🚀 Deployment

### Fly.io (Production)

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**:
   ```bash
   flyctl auth login
   ```

3. **Create app**:
   ```bash
   flyctl apps create eldercare-assist-ai
   ```

4. **Create volume**:
   ```bash
   flyctl volumes create eldercare_data --region syd --size 1
   ```

5. **Set secrets**:
   ```bash
   flyctl secrets set JWT_SECRET=your-secret-key
   flyctl secrets set OPENAI_API_KEY=sk-your-key
   ```

6. **Deploy**:
   ```bash
   cd server
   flyctl deploy --config ../fly.toml
   ```

See [CI_CD_SETUP_GUIDE.md](./CI_CD_SETUP_GUIDE.md) for complete deployment guide.

### GitHub Actions (Auto-Deploy)

1. **Get Fly.io token**:
   ```bash
   flyctl auth token
   ```

2. **Add to GitHub Secrets**:
   - Go to: `Settings` → `Secrets and variables` → `Actions`
   - Add: `FLY_API_TOKEN` with your token

3. **Push to main**:
   ```bash
   git push origin main
   ```

Deployment happens automatically on every push to `main`.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [CI_CD_SETUP_GUIDE.md](./CI_CD_SETUP_GUIDE.md) | Complete CI/CD setup and deployment guide |
| [DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md) | Quick start guide for Docker |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Pre-deployment verification checklist |
| [TEST_PLAN.md](./server/TEST_PLAN.md) | Comprehensive testing documentation (67 test cases) |
| [MANUAL_TEST_GUIDE.md](./server/MANUAL_TEST_GUIDE.md) | Step-by-step manual testing guide |
| [VOICE_SOS_IMPLEMENTATION.md](./server/VOICE_SOS_IMPLEMENTATION.md) | Voice SOS feature documentation |
| [FHIR_IMPLEMENTATION_COMPLETE.md](./server/FHIR_IMPLEMENTATION_COMPLETE.md) | FHIR integration details |

---

## 🧪 Testing

### Automated Tests

```bash
# Frontend
cd frontend
npm run lint
npm run build

# Backend
cd server
npm run build
npx prisma generate
```

### Manual Testing

See [MANUAL_TEST_GUIDE.md](./server/MANUAL_TEST_GUIDE.md) for:
- 5-minute critical path test
- 10-minute extended test
- Feature-specific tests
- Defect reporting template

### CI/CD Testing

All tests run automatically on every push via GitHub Actions:
- ✅ Frontend build & lint
- ✅ Backend build & Prisma generation
- ✅ Docker image builds
- ✅ Security scans (`npm audit`)

---

## 🔒 Security

- **Authentication**: JWT-based with secure password hashing (bcrypt)
- **Authorization**: Role-based access control (RBAC)
- **Environment Variables**: Secrets stored securely (never committed)
- **API Security**: CORS configured, input validation (Zod)
- **AI Safety**: Medical advice filters, PII protection
- **Docker**: Non-root users, health checks
- **HTTPS**: Enforced on Fly.io
- **Rate Limiting**: Coming soon

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support

- **Documentation**: See [CI_CD_SETUP_GUIDE.md](./CI_CD_SETUP_GUIDE.md)
- **Issues**: Open an issue on GitHub
- **Email**: support@eldercare-assist.ai (coming soon)

---

## 🎯 Roadmap

- [x] Patient Dashboard with medication tracking
- [x] Caregiver Dashboard with monitoring
- [x] Doctor Dashboard with health records
- [x] Voice AI Companion with SOS
- [x] AI-powered note summaries
- [x] PDF report generation
- [x] FHIR integration (mock)
- [x] Docker containerization
- [x] CI/CD with GitHub Actions
- [x] Fly.io deployment
- [ ] Real-time notifications (WebSockets)
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Real FHIR integration
- [ ] Telemedicine video calls
- [ ] Wearable device integration

---

## 📊 Status

- **Backend**: ✅ Production Ready
- **Frontend**: ✅ Production Ready
- **Docker**: ✅ Configured
- **CI/CD**: ✅ Automated
- **Deployment**: ✅ Fly.io Ready
- **Tests**: ✅ 67 Test Cases Documented
- **Documentation**: ✅ Complete

---

## 🌟 Acknowledgments

- Built with ❤️ for elderly care
- Powered by OpenAI for AI features
- Deployed on Fly.io
- Icons by Lucide (React Icons)
- Maps by Leaflet

---

**Version**: 1.0.0  
**Last Updated**: November 1, 2025  
**Status**: ✅ Production Ready

