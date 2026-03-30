#!/usr/bin/env bash
set -euo pipefail

PROJECT_SLUG="${PROJECT_SLUG:-howtoprompt}"
APP_DIR="${APP_DIR:-/home/ubuntu/${PROJECT_SLUG}}"
cd "$APP_DIR"

app_port="$(
  awk -F= '
    $1 == "APP_PORT" {
      gsub(/^[ \t]+|[ \t]+$/, "", $2)
      print $2
      found = 1
    }
    END {
      if (!found) {
        print "3000"
      }
    }
  ' .env
)"

health_url="http://127.0.0.1:${app_port}/api/health"
attempts=30
sleep_seconds=5
health_output="/tmp/${PROJECT_SLUG}-healthcheck.json"

for attempt in $(seq 1 "$attempts"); do
  if curl -fsS "$health_url" >"$health_output"; then
    cat "$health_output"
    exit 0
  fi
  sleep "$sleep_seconds"
done

echo "Health check failed for ${health_url}" >&2
docker compose --env-file .env --env-file .deploy/deploy.env -f docker-compose.production.yml ps >&2 || true
docker compose --env-file .env --env-file .deploy/deploy.env -f docker-compose.production.yml logs --tail=200 >&2 || true
exit 1
