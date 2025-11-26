FROM node:18-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# ==== STAGE: Dependencies ====
FROM base AS deps
RUN npm install --legacy-peer-deps
RUN npm install immutable --legacy-peer-deps

# ==== STAGE: Builder ====
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desabilitar telemetria
ENV NEXT_TELEMETRY_DISABLED=1
# Ignorar certificados SSL
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# --- AQUI ESTÁ A CORREÇÃO (TIRO DE CANHÃO) ---
# Aceitamos qualquer uma das duas variaveis
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL

# Injetamos nas duas para garantir
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_APP_URL
# ---------------------------------------------

# Build
RUN npm run build

# ==== STAGE: Runner ====
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3003

ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
