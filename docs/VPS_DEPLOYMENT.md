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

## VPS avec Nginx deja installe

Si le VPS heberge deja d'autres projets derriere Nginx, ne lancez pas Caddy sur
les ports `80` et `443`. Utilisez l'override Nginx pour exposer GhostPoll en
local uniquement :

```bash
GHOSTPOLL_PORT=3100 docker compose -f docker-compose.yml -f docker-compose.nginx.yml up -d --build
```

Ajoutez ensuite un vhost Nginx separe pour le domaine GhostPoll :

```nginx
server {
    server_name ghostpoll.example.com;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Puis activez HTTPS avec Certbot pour ce domaine.

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
