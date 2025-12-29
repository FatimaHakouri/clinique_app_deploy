#!/bin/bash
set -e

# Attendre que MySQL soit disponible (sur Railway)
if [ -n "$MYSQL_HOST" ]; then
    echo "Waiting for MySQL at $MYSQL_HOST:$MYSQL_PORT..."
    /wait-for-it.sh -h $MYSQL_HOST -p $MYSQL_PORT -t 60
fi

echo "Starting Spring Boot application..."
exec java -jar /app/app.jar