# Privacy

GhostPoll is designed for anonymous, temporary voting without accounts.

## No Accounts

GhostPoll does not require login, signup, user profiles, or email addresses.

Admins are authorized by a secret admin link generated when a poll is created. Anyone with that link can manage the poll, so it must be kept private.

## Data Stored Temporarily

GhostPoll stores only the data needed to run active polls:

- poll question and options
- vote counters
- expiration timestamp
- admin token for the poll
- hashed voter fingerprint used to limit duplicate votes

All poll data is stored in Redis with a TTL and is automatically removed when the poll expires. Admins can also close a poll manually, which deletes its room, vote counters, and voter fingerprints.

## Voter Fingerprints

To enforce one-vote or revote rules without accounts, GhostPoll hashes a browser fingerprint together with the room ID. The raw fingerprint is not stored. The resulting hash is scoped to a single room and expires with that room.

## What GhostPoll Does Not Store

GhostPoll does not store:

- names
- email addresses
- user accounts
- passwords
- payment data
- tracking cookies
- long-term voting history

## Self-Hosted Infrastructure

The production stack is self-hosted with Docker, Redis, and Caddy. Operators are responsible for server logs, Redis backups, and access to the VPS.

For the deployment model, see [DEPLOYMENT.md](./DEPLOYMENT.md).
