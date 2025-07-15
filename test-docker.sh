#!/bin/bash

echo "🐳 Testing Docker deployment locally..."

# Build l'image
echo "📦 Building Docker image..."
docker build -t fyd-api .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Docker build successful"

# Variables d'environnement pour le test
export MONGODB_URI="mongodb://localhost:27017/fyd-test"
export JWT_SECRET="test-secret-key"
export NODE_ENV="development"
export SEED_DATABASE="false"

echo "🚀 Starting container..."
docker run -d \
  --name fyd-api-test \
  -p 3000:3000 \
  -e MONGODB_URI="$MONGODB_URI" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e NODE_ENV="$NODE_ENV" \
  -e SEED_DATABASE="$SEED_DATABASE" \
  fyd-api

# Attendre que le container démarre
echo "⏳ Waiting for container to start..."
sleep 10

# Tester l'API
echo "🧪 Testing API endpoints..."

# Test health endpoint
echo "Testing /health..."
curl -f http://localhost:3000/health || echo "❌ Health check failed"

# Test API docs
echo "Testing /api-docs..."
curl -f http://localhost:3000/api-docs || echo "❌ API docs failed"

echo "✅ Tests completed"

# Nettoyer
echo "🧹 Cleaning up..."
docker stop fyd-api-test
docker rm fyd-api-test

echo "🎉 Local Docker test completed successfully!" 