# Utiliser Node.js 20 Alpine pour une image plus légère
FROM node:20-alpine

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

# Rendre le script d'entrée exécutable
RUN chmod +x docker-entrypoint.sh

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

# Utiliser le script d'entrée
ENTRYPOINT ["./docker-entrypoint.sh"] 