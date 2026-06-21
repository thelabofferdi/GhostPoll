# Deployment

GhostPoll is now deployed as a self-hosted Docker stack on a VPS.

The production stack contains:

- Nuxt/Nitro running as a Node server
- Redis with persistent AOF storage
- Caddy as the HTTPS reverse proxy

## Quick Start

```bash
cp .env.production.example .env
openssl rand -hex 32
docker compose up -d --build
```

Set the generated password in `.env` before starting the stack:

```dotenv
APP_DOMAIN=ghostpoll.example.com
BASE_URL=https://ghostpoll.example.com
REDIS_PASSWORD=replace-with-generated-value
```

## Healthcheck

```bash
curl -fsS https://ghostpoll.example.com/api/health
```

## Full Guide

See [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) for the complete VPS checklist, update flow, and Redis backup notes.
