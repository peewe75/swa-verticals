FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg fonts-dejavu-core curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN corepack enable

COPY . .

RUN pnpm install --frozen-lockfile || pnpm install

ENV NODE_ENV=production
EXPOSE 8080

CMD ["pnpm", "start"]
