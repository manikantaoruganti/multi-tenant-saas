#!/bin/sh
set -e

sh ./entrypoint.sh
exec node src/server.js
