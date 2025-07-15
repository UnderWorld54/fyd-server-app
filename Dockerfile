# Utiliser Node.js 18 Alpine pour une image plus légère
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (incluant devDependencies pour TypeScript)
RUN npm ci

# Copier le code source
COPY . .

# Compiler le TypeScript
RUN npm run build

# Supprimer les devDependencies pour réduire la taille de l'image
RUN npm prune --production

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Changer la propriété des fichiers
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exposer le port
EXPOSE 3000

# Variable d'environnement pour le port
ENV PORT=3000

# Script de démarrage qui exécute les seeds puis lance l'application
CMD sh -c "npm run seed:all && npm start" 