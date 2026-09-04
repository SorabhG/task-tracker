# --------------------------------------------------
# Stage 1: Install dependencies
# --------------------------------------------------
FROM node:24-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


# --------------------------------------------------
# Stage 2: Build the Next.js application
# --------------------------------------------------
FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build


# --------------------------------------------------
# Stage 3: Production image
# --------------------------------------------------
FROM node:24-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 nextjs

# Copy standalone Next.js server
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

# --------------------------------------------------
# Stage 4: Database administration image
# --------------------------------------------------
FROM builder AS dbadmin

CMD ["npx", "prisma", "db", "verify"]