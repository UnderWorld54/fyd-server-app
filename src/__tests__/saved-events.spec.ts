import request from 'supertest';
import mongoose from 'mongoose';
import App from '../app';
import User from '../models/User';
import { JWTUtils } from '../utils/jwt';

describe('Saved Events API', () => {
  let authToken: string;
  let userId: string;
  let app: any;

  beforeAll(async () => {
    // Initialiser l'application
    const appInstance = new App();
    app = appInstance.app;
    
    // Nettoyer la base de données avant les tests
    await User.deleteMany({});
    
    // Créer un utilisateur de test
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      city: 'Paris',
      interests: ['musique', 'sport']
    });
    await testUser.save();
    userId = testUser._id.toString();
    
    // Générer un token d'authentification
    authToken = JWTUtils.generateToken({
      userId: testUser._id.toString(),
      email: testUser.email,
      role: testUser.role || 'user'
    });
    
    // Vérifier que l'utilisateur existe bien dans la base de données
    const savedUser = await User.findById(userId);
    if (!savedUser) {
      throw new Error('Utilisateur de test non trouvé dans la base de données');
    }
  });

  afterAll(async () => {
    // Nettoyer la base de données
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Réinitialiser les événements sauvegardés avant chaque test
    await User.findByIdAndUpdate(userId, { savedEvents: [] });
  });

  describe('POST /api/users/saved-events', () => {
    it('devrait sauvegarder un événement avec succès', async () => {
      const eventData = {
        eventId: 'event123',
        name: 'Concert de Jazz',
        date: '2024-12-25',
        location: 'Paris, France',
        imageUrl: 'https://example.com/image.jpg'
      };

      const response = await request(app)
        .post('/api/users/saved-events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.savedEvents).toHaveLength(1);
      expect(response.body.data.savedEvents[0].eventId).toBe('event123');
      expect(response.body.data.savedEvents[0].name).toBe('Concert de Jazz');
    });

    it('ne devrait pas sauvegarder le même événement deux fois', async () => {
      const eventData = {
        eventId: 'event123',
        name: 'Concert de Jazz',
        date: '2024-12-25',
        location: 'Paris, France'
      };

      // Première sauvegarde
      await request(app)
        .post('/api/users/saved-events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(200);

      // Deuxième sauvegarde du même événement
      const response = await request(app)
        .post('/api/users/saved-events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('déjà sauvegardé');
    });

    it('devrait rejeter une requête sans authentification', async () => {
      const eventData = {
        eventId: 'event123',
        name: 'Concert de Jazz',
        date: '2024-12-25',
        location: 'Paris, France'
      };

      await request(app)
        .post('/api/users/saved-events')
        .send(eventData)
        .expect(401);
    });

    it('devrait rejeter des données invalides', async () => {
      const invalidEventData = {
        eventId: 'event123',
        // name manquant
        date: '2024-12-25',
        location: 'Paris, France'
      };

      await request(app)
        .post('/api/users/saved-events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidEventData)
        .expect(400);
    });
  });

  describe('GET /api/users/saved-events', () => {
    it('devrait récupérer tous les événements sauvegardés', async () => {
      // Sauvegarder quelques événements
      const events = [
        {
          eventId: 'event1',
          name: 'Concert 1',
          date: '2024-12-25',
          location: 'Paris'
        },
        {
          eventId: 'event2',
          name: 'Concert 2',
          date: '2024-12-26',
          location: 'Lyon'
        }
      ];

      for (const event of events) {
        await request(app)
          .post('/api/users/saved-events')
          .set('Authorization', `Bearer ${authToken}`)
          .send(event);
      }

      const response = await request(app)
        .get('/api/users/saved-events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.savedEvents).toHaveLength(2);
      expect(response.body.data.savedEvents.map((e: any) => e.eventId)).toContain('event1');
      expect(response.body.data.savedEvents.map((e: any) => e.eventId)).toContain('event2');
    });

    it('devrait retourner une liste vide si aucun événement sauvegardé', async () => {
      const response = await request(app)
        .get('/api/users/saved-events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.savedEvents).toHaveLength(0);
    });

    it('devrait rejeter une requête sans authentification', async () => {
      await request(app)
        .get('/api/users/saved-events')
        .expect(401);
    });
  });

  describe('DELETE /api/users/saved-events/:eventId', () => {
    it('devrait supprimer un événement sauvegardé', async () => {
      // Sauvegarder un événement
      const eventData = {
        eventId: 'event123',
        name: 'Concert de Jazz',
        date: '2024-12-25',
        location: 'Paris, France'
      };

      await request(app)
        .post('/api/users/saved-events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData);

      // Supprimer l'événement
      const response = await request(app)
        .delete('/api/users/saved-events/event123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.savedEvents).toHaveLength(0);
    });

    it('devrait rejeter une requête sans authentification', async () => {
      await request(app)
        .delete('/api/users/saved-events/event123')
        .expect(401);
    });
  });

  describe('GET /api/users/saved-events/:eventId/check', () => {
    it('devrait retourner true si l\'événement est sauvegardé', async () => {
      // Sauvegarder un événement
      const eventData = {
        eventId: 'event123',
        name: 'Concert de Jazz',
        date: '2024-12-25',
        location: 'Paris, France'
      };

      await request(app)
        .post('/api/users/saved-events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData);

      // Vérifier si l'événement est sauvegardé
      const response = await request(app)
        .get('/api/users/saved-events/event123/check')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isSaved).toBe(true);
    });

    it('devrait retourner false si l\'événement n\'est pas sauvegardé', async () => {
      const response = await request(app)
        .get('/api/users/saved-events/event456/check')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isSaved).toBe(false);
    });

    it('devrait rejeter une requête sans authentification', async () => {
      await request(app)
        .get('/api/users/saved-events/event123/check')
        .expect(401);
    });
  });
}); 