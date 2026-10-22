#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install Node.js 22.12 or newer, then try again." >&2
  exit 1
fi
if ! node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(major > 22 || (major === 22 && minor >= 12) ? 0 : 1)'; then
  echo "Node.js 22.12 or newer is required." >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to run the showcase." >&2
  exit 1
fi

if [[ ! -f node_modules/vite/bin/vite.js ]]; then
  echo "Installing MaterialFluid dependencies..."
  npm ci --cache .cache/npm
fi

exec node scripts/launch-showcase.mjs "$@"
