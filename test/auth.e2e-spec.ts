import request from 'supertest';
import { app } from '../src/app';

describe('AuthController (e2e)', () => {
  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          city: 'Paris',
          interests: ['sport']
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('token');
        });
    });

    it('should return 400 when required fields are missing', () => {
      return request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          // email manquant
          password: 'password123'
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', false);
          expect(res.body).toHaveProperty('error');
        });
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login successfully with valid credentials', async () => {
      // D'abord, créer un utilisateur
      await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          city: 'Paris',
          interests: ['sport']
        });

      // Ensuite, tester la connexion
      return request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('token');
          expect(res.body.data).toHaveProperty('refreshToken');
        });
    });

    it('should return 401 with invalid credentials', () => {
      return request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', false);
          expect(res.body).toHaveProperty('error');
        });
    });
  });
}); 