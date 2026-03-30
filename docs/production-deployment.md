# Production Deployment

## Goal

Production chi chay tu code da nam tren GitHub `main`.
GitHub Actions build Docker image len GHCR.
Production server chi pull image theo commit SHA va restart bang `docker compose`.

## Source of truth

- Production branch: `main`
- GitHub repo: `blackbirdzzzz365-gif/howtoprompt`
- Image registry: `ghcr.io/blackbirdzzzz365-gif/howtoprompt`
- Production server: `e1.chiasegpu.vn`
- App dir tren server: `/home/ubuntu/howtoprompt`
- Public app domain: `howtoprompt.blackbirdzzzz.art`

## App profile

- Runtime: Next.js standalone container
- App port: `3000`
- Health check: `http://127.0.0.1:3000/api/health`
- Browser UI: khong
- Persistent data: Docker volume `howtoprompt-runtime-data` mount vao `/app/.data`

## Workflows

### 1. CI

File: `.github/workflows/ci.yml`

Runs on:

- pull requests
- pushes to `main`

Checks:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- Docker build smoke

### 2. Build production image

File: `.github/workflows/build-image.yml`

Runs on:

- push to `main`
- manual dispatch

Output:

- `ghcr.io/blackbirdzzzz365-gif/howtoprompt:sha-<full_sha>`
- `ghcr.io/blackbirdzzzz365-gif/howtoprompt:sha-<short_sha>`
- `ghcr.io/blackbirdzzzz365-gif/howtoprompt:main`

### 3. Deploy production

File: `.github/workflows/deploy-production.yml`

Runs on:

- manual dispatch only

Behavior:

1. Resolve exact commit SHA from `main`
2. SSH vao production server
3. `git checkout --detach <sha>`
4. `docker compose -f docker-compose.production.yml pull`
5. `docker compose -f docker-compose.production.yml up -d --remove-orphans`
6. Health-check `/api/health`
7. Luu state vao `.deploy/production-state.env`

### 4. Roll back production

File: `.github/workflows/rollback-production.yml`

Runs on:

- manual dispatch only

Behavior:

- rollback ve `PREVIOUS_SHA` da luu
- hoac rollback ve SHA cu the neu truyen vao input

## Server-side files

- `docker-compose.production.yml`
- `.env`
- `scripts/deploy_production.sh`
- `scripts/healthcheck_production.sh`
- `scripts/rollback_production.sh`

State production duoc luu tai:

- `.deploy/deploy.env`
- `.deploy/production-state.env`

## Required GitHub secrets

- `PRODUCTION_SSH_PRIVATE_KEY`
- `PRODUCTION_SSH_KNOWN_HOSTS`

## Suggested server `.env`

```dotenv
APP_PORT=3000
NODE_ENV=production
```

## Operator shortcuts

Neu dang login GitHub bang `gh`, co the trigger:

```bash
scripts/trigger_production_deploy.sh
scripts/trigger_production_rollback.sh
scripts/trigger_production_rollback.sh <sha>
```

## Contributor workflow

1. Bat dau tu `main`
2. Tao branch moi
3. Code va push len GitHub
4. Tao PR vao `main`
5. Cho CI pass
6. Merge vao `main`
7. Trigger `deploy-production.yml` khi can release

## Why this is safer

- Production khong build tu working tree local tren server
- Moi lan deploy gan voi 1 SHA ro rang
- Rollback don gian vi co `PREVIOUS_SHA`
- Linux VM, host, hay may khac co `gh` auth deu co the trigger deploy, nhung source van la GitHub
