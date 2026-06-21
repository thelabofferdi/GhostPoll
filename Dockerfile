FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_PRESET=node-server

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

RUN addgroup -S ghostpoll && adduser -S ghostpoll -G ghostpoll

COPY --from=builder --chown=ghostpoll:ghostpoll /app/.output ./.output

USER ghostpoll

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
