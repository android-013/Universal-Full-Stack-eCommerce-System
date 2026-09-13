# Deployment Guide

## Local Docker

Run the platform with:

```bash
docker compose up --build
```

Services:

- `frontend` - Next.js app.
- `backend` - Express API.
- `postgres` - Production-like SQL database.
- `redis` - Cache, queues, rate limiting, and session support.
- `meilisearch` - Production search engine target.
- `nginx` - Reverse proxy for frontend and backend.

## Required Production Work

- Replace development secrets.
- Configure PostgreSQL migrations and backups.
- Configure object storage or CDN-backed product image storage.
- Configure payment, shipping, email, SMS, and push providers.
- Add log aggregation, tracing, uptime checks, and alerting.
- Run the full test, accessibility, performance, and security suites before release.
