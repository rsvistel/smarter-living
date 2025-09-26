#!/bin/bash

echo "Starting the complete application stack..."

# Start the database first
docker-compose up -d db

# Wait for the database to be ready
echo "Waiting for database to be ready..."
until docker-compose exec -T db pg_isready -U webapp_user -d webapp_db; do
  echo "Database is starting up..."
  sleep 2
done

echo "Database is ready!"

# Change to the WebApp directory to run EF migrations
cd WebApp/WebApp

echo "Restoring packages..."
dotnet restore

echo "Creating and applying database migrations..."
dotnet ef migrations add InitialCreate --output-dir Data/Migrations || true
dotnet ef database update

echo "Starting the web application..."
cd ../..
docker-compose up --build webapp

echo ""
echo "Application started!"
echo "Web API: http://localhost:5000"
echo "Database: localhost:5432"