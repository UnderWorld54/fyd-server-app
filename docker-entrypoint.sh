#!/bin/sh

# Attendre que MongoDB soit prêt (optionnel)
echo "Waiting for MongoDB to be ready..."
sleep 5

# Exécuter les seeds si la variable SEED_DATABASE est définie
if [ "$SEED_DATABASE" = "true" ]; then
    echo "Running database seeds..."
    npm run seed:all
else
    echo "Running smart database initialization..."
    node -e "require('./dist/seeds/init.js').initializeDatabase().catch(console.error)"
fi

# Démarrer l'application
echo "Starting the application..."
exec npm start 