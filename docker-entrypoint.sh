#!/bin/sh

# Attendre que MongoDB soit prêt
echo "Waiting for MongoDB to be ready..."
sleep 10

# Exécuter les seeds
echo "Running database seeds..."
npm run seed:all

# Démarrer l'application en mode développement
echo "Starting application in development mode..."
npm run dev 