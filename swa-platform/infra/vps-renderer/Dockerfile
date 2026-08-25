FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg fonts-dejavu-core curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia workspace root
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages ./packages
COPY infra/vps-renderer/package.json ./infra/vps-renderer/package.json

RUN corepack enable && pnpm install --frozen-lockfile

# Copia sorgenti renderer (dopo install per cache)
COPY infra/vps-renderer ./infra/vps-renderer

WORKDIR /app/infra/vps-renderer

ENV NODE_ENV=production
EXPOSE 8080

CMD ["pnpm", "start"]
