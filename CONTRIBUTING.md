# Contributing to GhostPoll

Thanks for taking the time to improve GhostPoll.

GhostPoll is a zero-login, self-hosted polling app. Contributions should keep that product direction intact: low friction, privacy-first defaults, no required third-party services, and a deployment path that works on a normal VPS.

## Good First Contributions

- fix UI issues in poll creation, voting, or admin flows
- improve Docker, Nginx, or VPS deployment docs
- add focused tests around API behavior
- improve export quality for CSV, PDF, or PNG
- tighten privacy, security, or rate-limit behavior
- improve accessibility and mobile responsiveness

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

Local development can run without Redis because GhostPoll falls back to an in-memory mock when `REDIS_URL` is empty. For Redis-specific work, run a local Redis container and set `REDIS_URL`.

## Quality Checks

Run these before opening a pull request:

```bash
npx nuxi typecheck
npm run build
npm run redis:test
```

## Pull Request Guidelines

- Keep changes focused on one problem or feature.
- Explain the user-visible behavior change.
- Include screenshots or short screen recordings for UI changes.
- Mention any deployment or environment variable changes.
- Do not commit generated build output such as `.nuxt`, `.output`, or `dist`.

## Product Principles

Please preserve these constraints unless the discussion explicitly agrees otherwise:

- no login or signup requirement
- no user accounts, email collection, or profile system
- no required managed Redis, edge platform, or SaaS dependency
- Redis TTL remains the source of automatic data expiry
- admin access stays based on secret capability links
- raw voter fingerprints are not stored

## Reporting Bugs

Use the bug report issue template and include:

- the steps to reproduce
- expected and actual behavior
- browser and device details for frontend bugs
- deployment details for production bugs
- relevant logs with secrets removed

## Feature Requests

Feature requests are welcome when they fit the privacy-first, self-hosted scope. The best requests explain the workflow, who needs it, and why it belongs in GhostPoll instead of an external tool.
