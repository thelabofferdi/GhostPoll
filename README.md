# GhostPoll

[![CI](https://github.com/thelabofferdi/GhostPoll/actions/workflows/ci.yml/badge.svg)](https://github.com/thelabofferdi/GhostPoll/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Nuxt 3](https://img.shields.io/badge/Nuxt-3-00DC82.svg)](https://nuxt.com)
[![Docker](https://img.shields.io/badge/deploy-Docker-blue.svg)](./docs/VPS_DEPLOYMENT.md)

**Self-hosted anonymous polls for quick decisions, live feedback, and temporary community voting.**

GhostPoll lets anyone create a poll in seconds, share a link or QR code, collect anonymous votes, export the result, and automatically expire the data. It is built for teams, communities, classrooms, events, and indie products that need fast feedback without accounts, tracking-heavy SaaS, or platform lock-in.

- Live demo: [ghostpoll.enarilab.xyz](https://ghostpoll.enarilab.xyz)
- License: [MIT](./LICENSE)
- Deployment target: VPS, Docker Compose, Redis

![GhostPoll preview](./public/assets/hero-mascot.gif)

## Why GhostPoll

Most polling tools force a tradeoff: ask users to sign in, send voting data to a third-party platform, or keep results around longer than needed. GhostPoll takes a smaller, more intentional path.

- **Zero login/signup:** hosts and voters never need accounts.
- **Anonymous by default:** no names, emails, passwords, or profiles.
- **Self-hosted:** run the whole stack on your own VPS.
- **Temporary data:** Redis TTL removes poll data automatically.
- **Admin capability links:** every poll gets a secret admin URL instead of an account dashboard.
- **Practical exports:** JSON, CSV, PDF, and PNG result exports.

## Product Flow

1. A host creates a poll from the homepage.
2. GhostPoll generates a public voting link, a QR code, and a secret admin link.
3. Participants vote anonymously from `/vote/:roomId`.
4. The admin monitors results from `/admin?id=:roomId&key=:adminToken`.
5. Results can be locked, revealed, hidden, extended, exported, duplicated, or closed.
6. Redis automatically removes room data when the poll expires.

## Use Cases

- quick product feedback after a launch or demo
- community decisions without collecting member accounts
- classroom and workshop check-ins
- event audience voting from a QR code
- team retrospectives and lightweight pulse checks
- temporary public polls where long-term storage is unnecessary

## Features

### Poll Types

- Emoji vote: five reactions for fast sentiment feedback.
- Multiple choice: custom options for structured decisions.

### Voting Modes

- Single vote: one vote per room-scoped browser fingerprint.
- Allow revote: participants can change their choice.

### Result Visibility

- Public results: participants can see live results.
- Reveal mode: public results stay hidden until the admin reveals them.

### Admin Controls

- View live results.
- Lock and unlock voting.
- Reveal, hide, or publish results.
- Extend poll duration.
- Duplicate a poll without copying votes.
- Close and delete a poll immediately.
- Export results as JSON, CSV, PDF, or PNG image.

## Privacy Model

GhostPoll is designed around zero-login operation.

- No accounts, emails, passwords, user profiles, or payment data.
- Admin access is controlled by a secret capability link.
- Duplicate-vote protection uses a room-scoped hashed browser fingerprint.
- Raw fingerprints are not stored.
- Poll data is temporary and expires through Redis TTL.
- Admins can delete active poll data manually with the close action.

GhostPoll is not meant to replace certified election systems or identity-verified voting platforms. It is built for lightweight anonymous feedback where low friction and data minimization matter more than legal-grade voter identity.

See [docs/PRIVACY.md](./docs/PRIVACY.md) for implementation details.

## Tech Stack

- Nuxt 3 and Vue 3
- TypeScript
- Tailwind CSS
- Nitro server routes
- Redis for rooms, votes, TTL, and rate-limit state
- Docker Compose for production
- Caddy or existing Nginx reverse proxy

## Quick Start

### Local Development

Requirements: Node.js 22 or newer, npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

By default, local development uses the in-memory Redis mock when `REDIS_URL` is empty.

### Local Redis

```bash
podman run -d --name ghostpoll-redis \
  -p 127.0.0.1:6379:6379 \
  -e REDIS_PASSWORD=localpassword \
  docker.io/library/redis:7-alpine \
  sh -c 'redis-server --appendonly yes --requirepass "$REDIS_PASSWORD"'

REDIS_URL=redis://:localpassword@127.0.0.1:6379 npm run dev
```

Docker can be used instead of Podman with the same image and command.

## Deploy

GhostPoll is production-ready for a VPS with Docker Compose.

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

If your VPS already has Nginx on ports `80` and `443`, use the Nginx override so GhostPoll only listens on localhost:

```bash
GHOSTPOLL_PORT=3100 docker compose -f docker-compose.yml -f docker-compose.nginx.yml up -d --build
```

Full deployment notes are in [docs/VPS_DEPLOYMENT.md](./docs/VPS_DEPLOYMENT.md).

## Quality Checks

```bash
npx nuxi typecheck
npm run build
npm run redis:test
```

`npm run redis:test` uses the configured `REDIS_URL`; when it is empty, it uses the in-memory mock.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `BASE_URL` | Production | Public base URL used for generated links. |
| `NUXT_PUBLIC_BASE_URL` | Optional | Public runtime base URL override. Docker Compose maps it from `BASE_URL`. |
| `REDIS_URL` | Production | Redis connection string, for example `redis://:password@redis:6379`. |
| `APP_DOMAIN` | Docker stack | Domain served by Caddy. Defaults to `localhost` when Caddy is disabled. |
| `REDIS_PASSWORD` | Docker stack | Redis password used by Compose. |
| `GHOSTPOLL_BIND` | Nginx override | Host bind address for the app container. Defaults to `127.0.0.1`. |
| `GHOSTPOLL_PORT` | Nginx override | Host port for the app container. Defaults to `3100`. |

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

## Contributing

Contributions are welcome. The main product principles are:

- keep the zero-login model intact
- avoid external services as hard production dependencies
- minimize personal data collection
- preserve self-hosted deployment as the primary path
- keep admin features usable through capability links

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening an issue or pull request.

## Security

Please do not publish sensitive vulnerability details in a public issue. See [SECURITY.md](./SECURITY.md) for responsible disclosure guidance.

## License

MIT. See [LICENSE](./LICENSE).
