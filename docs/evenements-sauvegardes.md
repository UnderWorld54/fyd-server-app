# Gestion des Événements Sauvegardés

## Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs de sauvegarder des événements dans leurs favoris et de les récupérer ultérieurement. Les événements sauvegardés sont stockés directement dans le modèle utilisateur.

## Structure de données

### Modèle utilisateur étendu

Le modèle `User` inclut maintenant un champ `savedEvents` qui contient un tableau d'événements sauvegardés :

```typescript
savedEvents: [{
  eventId: string;        // ID unique de l'événement
  name: string;           // Nom de l'événement
  date: string;           // Date de l'événement
  location: string;       // Lieu de l'événement
  imageUrl?: string;      // URL de l'image (optionnel)
  savedAt: Date;          // Date de sauvegarde
}]
```

## API Endpoints

### 1. Sauvegarder un événement

**POST** `/api/users/saved-events`

Sauvegarde un événement dans les favoris de l'utilisateur connecté.

**Headers requis :**
```
Authorization: Bearer <token>
```

**Body :**
```json
{
  "eventId": "event123",
  "name": "Concert de Jazz",
  "date": "2024-12-25",
  "location": "Paris, France",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Réponse de succès (200) :**
```json
{
  "success": true,
  "data": {
    "savedEvents": [
      {
        "eventId": "event123",
        "name": "Concert de Jazz",
        "date": "2024-12-25",
        "location": "Paris, France",
        "imageUrl": "https://example.com/image.jpg",
        "savedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  },
  "message": "Événement sauvegardé avec succès"
}
```

**Erreurs possibles :**
- `400` : Événement déjà sauvegardé ou données invalides
- `401` : Non authentifié

### 2. Récupérer les événements sauvegardés

**GET** `/api/users/saved-events`

Récupère tous les événements sauvegardés de l'utilisateur connecté.

**Headers requis :**
```
Authorization: Bearer <token>
```

**Réponse de succès (200) :**
```json
{
  "success": true,
  "data": {
    "savedEvents": [
      {
        "eventId": "event123",
        "name": "Concert de Jazz",
        "date": "2024-12-25",
        "location": "Paris, France",
        "imageUrl": "https://example.com/image.jpg",
        "savedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "eventId": "event456",
        "name": "Match de Football",
        "date": "2024-12-26",
        "location": "Lyon, France",
        "savedAt": "2024-01-15T11:00:00.000Z"
      }
    ]
  },
  "message": "Événements sauvegardés récupérés avec succès"
}
```

**Erreurs possibles :**
- `401` : Non authentifié
- `404` : Utilisateur non trouvé

### 3. Supprimer un événement sauvegardé

**DELETE** `/api/users/saved-events/:eventId`

Supprime un événement des favoris de l'utilisateur connecté.

**Headers requis :**
```
Authorization: Bearer <token>
```

**Paramètres :**
- `eventId` : ID de l'événement à supprimer

**Réponse de succès (200) :**
```json
{
  "success": true,
  "data": {
    "savedEvents": []
  },
  "message": "Événement supprimé des favoris avec succès"
}
```

**Erreurs possibles :**
- `401` : Non authentifié
- `404` : Utilisateur non trouvé

### 4. Vérifier si un événement est sauvegardé

**GET** `/api/users/saved-events/:eventId/check`

Vérifie si un événement spécifique est sauvegardé par l'utilisateur connecté.

**Headers requis :**
```
Authorization: Bearer <token>
```

**Paramètres :**
- `eventId` : ID de l'événement à vérifier

**Réponse de succès (200) :**
```json
{
  "success": true,
  "data": {
    "isSaved": true
  },
  "message": "Événement est sauvegardé"
}
```

**Erreurs possibles :**
- `401` : Non authentifié

## Validation

### Schéma de validation pour sauvegarder un événement

```typescript
const saveEventSchema = Joi.object({
  eventId: Joi.string().required(),
  name: Joi.string().required(),
  date: Joi.string().required(),
  location: Joi.string().required(),
  imageUrl: Joi.string().optional()
});
```

## Fonctionnalités

### Prévention des doublons

Le système empêche la sauvegarde du même événement plusieurs fois pour un même utilisateur. Si un utilisateur tente de sauvegarder un événement déjà présent dans ses favoris, une erreur 400 est retournée.

### Authentification requise

Toutes les routes nécessitent une authentification via token JWT. Les requêtes non authentifiées retournent une erreur 401.

### Gestion des erreurs

Le système gère les erreurs suivantes :
- Données invalides (validation Joi)
- Événements déjà sauvegardés
- Utilisateurs non trouvés
- Tokens invalides ou expirés

## Tests

Des tests unitaires complets sont disponibles dans `src/__tests__/saved-events.spec.ts` et couvrent :

- Sauvegarde d'événements
- Récupération d'événements sauvegardés
- Suppression d'événements
- Vérification du statut de sauvegarde
- Gestion des erreurs
- Validation des données

## Utilisation côté client

### Exemple de sauvegarde d'événement

```javascript
const saveEvent = async (eventData) => {
  const response = await fetch('/api/users/saved-events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(eventData)
  });
  
  return response.json();
};
```

### Exemple de récupération des favoris

```javascript
const getSavedEvents = async () => {
  const response = await fetch('/api/users/saved-events', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

### Exemple de vérification du statut

```javascript
const checkIfSaved = async (eventId) => {
  const response = await fetch(`/api/users/saved-events/${eventId}/check`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

## Intégration avec Swagger

Toutes les routes sont documentées dans Swagger et accessibles via `/api-docs` avec :

- Descriptions détaillées
- Exemples de requêtes et réponses
- Codes d'erreur
- Schémas de validation 