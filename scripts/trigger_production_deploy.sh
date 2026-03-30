#!/usr/bin/env bash
set -euo pipefail

repo="blackbirdzzzz365-gif/howtoprompt"
gh workflow run deploy-production.yml --repo "$repo" --ref main
