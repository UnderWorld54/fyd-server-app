# Guide de Déploiement sur Render avec Docker

## Prérequis

1. Un compte [Render](https://render.com)
2. Un cluster MongoDB Atlas configuré
3. Ton code sur GitHub/GitLab

## Configuration MongoDB Atlas

1. Créer un cluster MongoDB Atlas
2. Créer un utilisateur de base de données
3. Autoriser l'accès depuis n'importe où (0.0.0.0/0) pour le développement
4. Récupérer l'URI de connexion

## Déploiement sur Render

### Option 1: Déploiement automatique avec render.yaml (Recommandé)

1. **Pousser le code** avec le fichier `render.yaml` :
   ```bash
   git add .
   git commit -m "Add Docker and Render configuration"
   git push origin main
   ```

2. **Sur Render Dashboard** :
   - Va sur [Render Dashboard](https://dashboard.render.com)
   - Clique sur **New Web Service**
   - Connecte ton repository GitHub/GitLab
   - Render détectera automatiquement le `render.yaml`

3. **Variables d'environnement à ajouter manuellement** :
   - `MONGODB_URI` : Ton URI MongoDB Atlas
   - `JWT_SECRET` : Une clé secrète forte

### Option 2: Déploiement manuel

1. Va sur [Render Dashboard](https://dashboard.render.com)
2. Clique sur **New Web Service**
3. Connecte ton repository GitHub/GitLab
4. Sélectionne le repository contenant ton API

### 2. Configuration du service

- **Name**: `fyd-api` (ou le nom que tu veux)
- **Environment**: `Docker`
- **Region**: Choisis la région la plus proche
- **Branch**: `main` (ou ta branche principale)
- **Root Directory**: Laisse vide (si ton code est à la racine)

### 3. Variables d'environnement

Ajoute ces variables dans l'onglet **Environment** :

| Key | Value | Description |
|-----|-------|-------------|
| `PORT` | `10000` | Port du serveur (Render peut choisir automatiquement) |
| `MONGODB_URI` | `mongodb+srv://...` | URI MongoDB Atlas |
| `JWT_SECRET` | `ton_secret_jwt` | Clé secrète pour JWT |
| `JWT_EXPIRES_IN` | `7d` | Durée de validité du token |
| `NODE_ENV` | `production` | Environnement |
| `BCRYPT_SALT_ROUNDS` | `12` | Rounds pour bcrypt |
| `SEED_DATABASE` | `false` | Forcer les seeds (true) ou initialisation intelligente (false) |

### 4. Déployer

1. Clique sur **Create Web Service**
2. Render va automatiquement :
   - Détecter le Dockerfile
   - Builder l'image Docker
   - Déployer le service

### 5. Vérifier le déploiement

- Va sur l'URL fournie par Render
- Teste `/health` pour vérifier que l'API fonctionne
- Teste `/api-docs` pour voir la documentation Swagger

## URLs d'exemple

- **API Health**: `https://ton-app.onrender.com/health`
- **Documentation**: `https://ton-app.onrender.com/api-docs`
- **API Events**: `https://ton-app.onrender.com/api/users/saved-events`

## Troubleshooting

### Erreurs courantes

1. **Build failed**: Vérifie que le Dockerfile est correct
2. **MongoDB connection failed**: Vérifie l'URI MongoDB Atlas
3. **Port issues**: Laisse Render gérer le port automatiquement

### Logs

- Va dans l'onglet **Logs** de ton service Render
- Vérifie les erreurs de build et de runtime

## Sécurité en production

1. **MongoDB Atlas**: Restreins l'accès réseau aux IPs de Render
2. **JWT Secret**: Utilise une clé secrète forte
3. **HTTPS**: Render fournit automatiquement HTTPS
4. **Rate Limiting**: Déjà configuré dans ton code

## Mise à jour

Pour mettre à jour ton API :
1. Push tes changements sur GitHub/GitLab
2. Render détecte automatiquement les changements
3. Redéploie automatiquement

## Gestion des Seeds

### Options disponibles

1. **Initialisation intelligente (recommandée)** : `SEED_DATABASE=false`
   - Vérifie si la base contient déjà des données
   - Exécute les seeds seulement si la base est vide
   - Évite les doublons

2. **Forcer les seeds** : `SEED_DATABASE=true`
   - Supprime toutes les données existantes
   - Exécute les seeds à chaque démarrage
   - Utile pour les environnements de test

### Seeds inclus

- **Utilisateurs de test** :
  - `admin@example.com` / `admin123` (admin)
  - `john@example.com` / `user123` (user)
  - `jane@example.com` / `user123` (user)

### Logs des seeds

Les logs d'initialisation sont visibles dans les logs Render :
- "Checking if database needs initialization..."
- "No users found, running seeds..." ou "Database already has X users, skipping seeds"

## Monitoring

- **Uptime**: Render surveille automatiquement
- **Logs**: Accessibles dans le dashboard
- **Metrics**: Disponibles dans l'onglet **Metrics** 