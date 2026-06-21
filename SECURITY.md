# Security Policy

GhostPoll is a self-hosted polling app with a zero-login security model. Admin access is granted through secret capability links generated per poll, and poll data is designed to expire automatically through Redis TTL.

## Supported Versions

Security fixes target the `main` branch. If releases are added later, this policy will be updated with a supported version table.

## Reporting a Vulnerability

Please do not disclose sensitive security issues in a public GitHub issue.

Preferred options:

1. Use GitHub private vulnerability reporting if it is enabled for this repository.
2. Contact the maintainer through GitHub and share only a minimal summary until a private channel is available.

Include as much of the following as possible:

- affected endpoint, page, or deployment component
- steps to reproduce
- expected impact
- whether authentication, an admin link, or a public vote link is required
- logs or proof-of-concept details with secrets removed

## Security Scope

In scope:

- unauthorized admin actions
- token leakage or predictable room/admin identifiers
- stored or reflected XSS
- server-side request or file access issues
- Redis data isolation and expiry failures
- rate-limit bypasses that materially affect availability
- deployment defaults that expose Redis or internal services

Out of scope:

- attacks that require a compromised VPS or root access
- denial-of-service through extreme traffic without a specific application flaw
- browser fingerprint uniqueness limitations
- social engineering against poll admins
- issues caused by exposing secret admin links publicly

## Notes for Operators

- Keep admin links private. Anyone with an admin link can manage that poll.
- Run Redis on a private network or localhost only.
- Use HTTPS in production.
- Rotate any secret that was accidentally committed or shared.
- Include Redis volumes in backups only if you need to preserve active rooms during recovery.
