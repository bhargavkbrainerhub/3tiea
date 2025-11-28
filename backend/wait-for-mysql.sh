#!/bin/sh
# Wait until MySQL is reachable
while ! nc -z db 3306; do
  echo "Waiting for MySQL..."
  sleep 3
done

# Then start the Node app
node server.js
