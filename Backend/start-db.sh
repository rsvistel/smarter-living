#!/bin/bash

echo "Starting PostgreSQL database..."

# Start the database container
docker-compose up -d db

# Wait for the database to be ready
echo "Waiting for database to be ready..."
until docker-compose exec -T db pg_isready -U webapp_user -d webapp_db; do
  echo "Database is starting up..."
  sleep 2
done

echo "Database is ready!"
echo "Connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: webapp_db"
echo "  Username: webapp_user"
echo "  Password: webapp_password"
echo ""
echo "To connect with psql:"
echo "  docker-compose exec db psql -U webapp_user -d webapp_db"
echo ""
echo "To stop the database:"
echo "  docker-compose down"