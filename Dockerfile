# Root Dockerfile for Eldercare-Assist-AI
# Builds the backend located in ./server and produces a slim runtime image
# - Multi-stage: build in a Node builder, produce a runtime image with only production deps
# - Generates Prisma client and builds TypeScript
# - Installs system libs required by Puppeteer
# - Runs as non-root user and respects $PORT (fallback to 3001)

FROM node:18-alpine AS builder

WORKDIR /app/server

# Copy package manifest and Prisma schema first to leverage Docker cache
COPY server/package*.json ./
COPY server/prisma ./prisma/

# Install all dependencies (including dev) needed for build and prisma
RUN npm ci

# Copy server source and build
COPY server ./

# Generate Prisma client and build TypeScript sources
RUN npx prisma generate && npm run build

### Runtime image
FROM node:18-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

# Install runtime OS packages required by Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    openssl

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy only server's production package manifest and install production deps
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy built artifacts and runtime data from builder
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/prisma ./prisma
COPY --from=builder /app/server/data ./data
COPY --from=builder /app/server/reports ./reports

# Ensure runtime directories exist and are owned by the runtime user
RUN mkdir -p /app/server/reports /app/server/data && chown -R app:app /app/server

# Puppeteer config to use system chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Default port (app reads PORT from env). Fly will provide a PORT at runtime.
ENV PORT=3001

# Informational expose
EXPOSE 3001

# Run as non-root user
USER app

# Start the server
CMD ["node", "dist/index.js"]
