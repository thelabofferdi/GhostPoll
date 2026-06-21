# GhostPoll

[![CI](https://github.com/thelabofferdi/GhostPoll/actions/workflows/ci.yml/badge.svg)](https://github.com/thelabofferdi/GhostPoll/actions/workflows/ci.yml)

GhostPoll is a self-hosted, privacy-first polling app for quick anonymous feedback. Create a poll, share a link or QR code, collect votes, export results, and let the data expire automatically.

No login. No signup. No user accounts.

![GhostPoll preview](./public/assets/hero-mascot.gif)

## What It Does

- Create anonymous ephemeral polls in seconds.
- Share public voting links and QR codes.
- Manage polls through a secret admin link.
- Support emoji votes and multiple-choice polls.
- Hide results until the admin reveals them.
- Allow either one vote per voter or revoting.
- Export results as JSON, CSV, PDF, or PNG image.
- Run fully self-hosted on a VPS with Docker, Redis, and Caddy.

## Product Flow

1. The host creates a poll from the homepage.
2. GhostPoll generates a public voting link, a QR code, and a secret admin link.
3. Participants vote anonymously from `/vote/:roomId`.
4. The admin monitors results from `/admin?id=:roomId&key=:adminToken`.
5. Results can be locked, revealed, hidden, extended, exported, duplicated, or closed.
6. Redis TTL automatically removes poll data when the room expires.

## Features

### Poll Types

- Emoji vote: five reactions for fast sentiment feedback.
- Multiple choice: custom options for structured decisions.

### Voting Modes

- Single vote: one vote per browser fingerprint.
- Allow revote: participants can change their choice.

### Result Visibility

- Public results: everyone can see live results.
- Reveal mode: public results stay hidden until the admin reveals them.

### Admin Controls

- View live results.
- Lock and unlock voting.
- Reveal, hide, or publish results.
- Extend poll duration.
- Duplicate a poll without copying votes.
- Close and delete a poll immediately.
- Export results as JSON, CSV, PDF, or branded PNG image.

## Privacy Model

GhostPoll is built around zero-login operation.

- No accounts, emails, passwords, or user profiles.
- Admin access is controlled by a secret capability link.
- Voter duplicate protection uses a room-scoped hashed fingerprint.
- Raw fingerprints are not stored.
- Poll data is temporary and expires through Redis TTL.
- Admins can delete active poll data manually with the close action.

See [docs/PRIVACY.md](./docs/PRIVACY.md) for details.

## Tech Stack

- Nuxt 3
- Vue 3
- TypeScript
- Tailwind CSS
- Redis
- Docker Compose
- Caddy HTTPS reverse proxy

## Local Development

### Requirements

- Node.js 22 or a compatible modern Node runtime
- npm

### Install

```bash
npm install
cp .env.example .env
```

By default, local development uses the in-memory Redis mock when `REDIS_URL` is empty.

### Run

```bash
npm run dev
```

Open `http://localhost:3000`.

### Use A Real Local Redis

```bash
podman run -d --name ghostpoll-redis \
  -p 127.0.0.1:6379:6379 \
  -e REDIS_PASSWORD=localpassword \
  docker.io/library/redis:7-alpine \
  sh -c 'redis-server --appendonly yes --requirepass "$REDIS_PASSWORD"'

REDIS_URL=redis://:localpassword@127.0.0.1:6379 npm run dev
```

Docker can be used instead of Podman with the same image and command.

## Quality Checks

```bash
npx nuxi typecheck
npm run build
npm run redis:test
```

`npm run redis:test` uses the configured `REDIS_URL`; when it is empty, it uses the in-memory mock.

## Self-Hosted Deployment

Production is designed for a VPS with Docker Compose.

```bash
cp .env.production.example .env
openssl rand -hex 32
docker compose up -d --build
```

Set the generated Redis password in `.env` before starting the stack.

```dotenv
APP_DOMAIN=ghostpoll.example.com
BASE_URL=https://ghostpoll.example.com
REDIS_PASSWORD=replace-with-generated-value
```

Healthcheck:

```bash
curl -fsS https://ghostpoll.example.com/api/health
```

Full deployment notes are in [docs/VPS_DEPLOYMENT.md](./docs/VPS_DEPLOYMENT.md).

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `BASE_URL` | Production | Public base URL used for generated links. |
| `NUXT_PUBLIC_BASE_URL` | Optional | Public runtime base URL override. Docker Compose maps it from `BASE_URL`. |
| `REDIS_URL` | Production | Redis connection string, for example `redis://:password@redis:6379`. |
| `APP_DOMAIN` | Docker stack | Domain served by Caddy. |
| `REDIS_PASSWORD` | Docker stack | Redis password used by Compose. |

## Project Structure

```text
components/        Vue result components
composables/       Client composables
deploy/            Caddy configuration
docs/              Deployment and privacy docs
pages/             Nuxt pages
public/assets/     Public images and branding assets
scripts/           Redis utility scripts
server/api/        Nitro API routes
server/utils/      Server utilities
types/             Shared TypeScript types
```

## Repository Status

GhostPoll is currently optimized for self-hosted VPS deployment. The app does not depend on managed serverless Redis or edge-worker limitations.

## License

MIT. See [LICENSE](./LICENSE).
