FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Script de démarrage qui exécute les seeds puis lance l'application
CMD sh -c "npm run seed:all && npm run dev" 