#!/bin/sh
set -e
cd /app
if [ ! -d node_modules/next ]; then
  npm install
fi
exec "$@"
