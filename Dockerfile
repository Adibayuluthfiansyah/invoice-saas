# ==== Dependencies Stage =====
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl python3 make g++

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci


RUN npx prisma generate

# ==== Build Stage =====
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl python3 make g++


COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma


COPY . .


RUN npx prisma generate


ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1

# Dummy values untuk build 
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DATABASE_DIRECT_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV RESEND_API_KEY="re_dummy"
ENV NEXT_PUBLIC_SUPABASE_URL="https://dummy.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="dummy"
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENV CRON_SECRET="dummy"


RUN npm run build

# ===== Production Stage =====
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl curl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]