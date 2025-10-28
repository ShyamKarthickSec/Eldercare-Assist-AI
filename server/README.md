# ElderCare Assist Backend - MVP

A minimal, SQLite-backed backend server for the ElderCare Assist application with rule-based AI features.

## Features

- ✅ **Authentication**: JWT-based auth with role support (Patient, Caregiver, Clinician)
- ✅ **Shared Health Timeline**: Aggregated view of all health activities
- ✅ **Medication & Appointment Reminders**: With adherence tracking
- ✅ **Privacy-first Access Control**: Role-based permissions and consent management
- ✅ **Shared Notes**: With AI-generated summaries
- ✅ **Daily Reports**: Automated HTML report generation
- ✅ **Companionship Chat**: Rule-based empathetic AI with mood detection
- ✅ **Voice Commands**: Intent detection with high-risk confirmation
- ✅ **FHIR Mock Integration**: Sample health record import
- ✅ **Swagger Documentation**: Interactive API docs at `/api/docs`

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
cd server
npm install
```

### Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Demo Accounts

After seeding, you can login with:

- **Patient**: `patient@example.com` / `password123`
- **Caregiver**: `caregiver@example.com` / `password123`
- **Clinician**: `doctor@example.com` / `password123`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health

## Project Structure

```
server/
├── src/
│   ├── auth/           # Authentication & JWT
│   ├── users/          # User management
│   ├── timeline/       # Health timeline
│   ├── reminders/      # Medication & appointment reminders
│   ├── notes/          # Shared notes with AI summary
│   ├── companion/      # Chat companion with mood detection
│   ├── voice/          # Voice command processing
│   ├── reports/        # Daily report generation
│   ├── fhir/           # FHIR mock integration
│   ├── common/         # Shared utilities
│   ├── docs/           # Swagger/OpenAPI
│   ├── db.ts           # In-memory database
│   ├── seed.ts         # Demo data seeder
│   └── index.ts        # Server entry point
├── data/fhir_samples/  # Sample FHIR data
├── reports/            # Generated reports
└── package.json
```

## Key Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Timeline
- `GET /api/patients/:id/timeline` - Get patient timeline

### Reminders
- `GET /api/patients/:id/reminders` - List reminders
- `POST /api/patients/:id/reminders` - Create reminder
- `POST /api/reminders/:id/ack` - Acknowledge reminder (taken/snoozed/skipped)

### Notes
- `GET /api/patients/:id/notes` - List notes
- `POST /api/patients/:id/notes` - Create note with AI summary

### Companion Chat
- `POST /api/companion/start` - Start chat session
- `POST /api/companion/:sessionId/message` - Send message
- `POST /api/companion/:sessionId/stop` - End session

### Voice Commands
- `POST /api/voice/parse` - Parse voice command
- `POST /api/voice/confirm/:voiceCommandId` - Confirm high-risk command

### Reports
- `GET /api/patients/:id/reports` - List reports
- `POST /api/patients/:id/reports/generate` - Generate report

### FHIR
- `POST /api/fhir/import/:patientId` - Import mock FHIR data

## Environment Variables

Create a `.env` file (see `.env.example`):

```env
PORT=3001
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
NODE_ENV=development
```

## NPM Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm run seed` - Seed database (runs automatically on first start)

## Notes

- **In-Memory Database**: Data resets on server restart (for MVP)
- **Rule-Based AI**: Simple keyword-based mood detection and response generation
- **No PII in Logs**: All logging respects privacy
- **Daily Cron**: Reports auto-generate at 06:00 daily

## Integration with Frontend

The frontend is configured to use `http://localhost:3001/api` as the base URL.
Make sure both servers are running:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## License

MIT

