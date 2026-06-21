# Déploiement VPS Docker

GhostPoll peut tourner sans Cloudflare ni Upstash avec trois conteneurs :

- `ghostpoll` : serveur Nuxt/Nitro Node
- `redis` : Redis local persistant avec AOF
- `caddy` : reverse proxy HTTPS avec certificats Let's Encrypt

## Préparer le serveur

Prérequis sur le VPS : Docker, Docker Compose v2, ports `80` et `443` ouverts, DNS du domaine pointant vers l'IP du VPS.

```bash
cp .env.production.example .env
openssl rand -hex 32
```

Modifiez ensuite `.env` :

```dotenv
APP_DOMAIN=ghostpoll.example.com
BASE_URL=https://ghostpoll.example.com
REDIS_PASSWORD=valeur-longue-generee
```

## Lancer

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f ghostpoll
```

## Vérifier

```bash
curl -fsS https://ghostpoll.example.com/api/health
docker compose exec redis redis-cli -a "$REDIS_PASSWORD" ping
```

## Mettre à jour

```bash
git pull
docker compose up -d --build
docker image prune -f
```

## Sauvegarder Redis

Redis écrit dans le volume Docker `redis-data` avec `appendonly yes`. Pour forcer une sauvegarde ponctuelle :

```bash
docker compose exec redis redis-cli -a "$REDIS_PASSWORD" BGSAVE
```

Le volume `redis-data` doit être inclus dans les sauvegardes du VPS si vous voulez conserver les rooms encore actives pendant une restauration.
