# Fly.io deployment notes for Eldercare Assist API

This file contains quick steps and notes to deploy the backend to Fly.io.

Prerequisites
- Install flyctl: https://fly.io/docs/getting-started/installing-flyctl/
- Login: `flyctl auth login`

Quick deploy (recommended flow)

1. Initialize a Fly app in the `server/` folder:

   cd server
   flyctl launch --name eldercare-api --no-deploy

   - Choose a region when prompted.
   - Set the image to use a Dockerfile (default). The `Dockerfile.fly` present here is recommended.

2. Set environment variables used by the app (example):

   flyctl secrets set DATABASE_URL="file:./dev.db" JWT_SECRET="your-secret" OPENAI_API_KEY="sk-..."

   - For production, prefer a hosted database (Postgres) and set `DATABASE_URL` appropriately.

3. Deploy:

   flyctl deploy -i Dockerfile.fly

Notes & tips
- The app reads the port from `process.env.PORT` (the code falls back to 3001). Fly will provide the actual port at runtime.
- The Dockerfile installs system libraries required by Puppeteer and sets `PUPPETEER_EXECUTABLE_PATH` to use the system chromium binary.
- Ensure write permissions for any on-disk storage you need (reports, SQLite files). Fly's ephemeral filesystem should not be used for persistent data; use an external DB or object store for persistence.
- Consider using a managed Postgres add-on for production and update `DATABASE_URL` accordingly.

Troubleshooting
- If Chromium/Puppeteer fails on Fly, verify the system libs and that `PUPPETEER_EXECUTABLE_PATH` points to a valid binary inside the container.
- Check logs with `flyctl logs` and adjust memory/CPU in Fly settings if needed.
