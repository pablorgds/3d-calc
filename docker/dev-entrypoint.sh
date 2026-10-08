#!/bin/sh
set -e
cd /app
if [ ! -d node_modules/next ]; then
  npm install
fi
find .next -mindepth 1 -delete 2>/dev/null || true
exec "$@"
