import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Charger les variables d'environnement
dotenv.config();

// Configuration de la base de données de test
const MONGODB_URI_TEST = 'mongodb://admin:password123@localhost:27017/fyd-test?authSource=admin';

// Configuration globale pour les tests
global.beforeAll(async () => {
  try {
    // Attendre que la connexion à la base de données soit établie
    await mongoose.connect(MONGODB_URI_TEST);
    console.log('Connected to test database');
  } catch (error) {
    console.error('Error connecting to test database:', error);
    throw error;
  }
});

global.afterAll(async () => {
  try {
    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('Disconnected from test database');
  } catch (error) {
    console.error('Error disconnecting from test database:', error);
    throw error;
  }
});

// Nettoyer la base de données après chaque test
global.afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    console.log('Test database cleaned');
  } catch (error) {
    console.error('Error cleaning test database:', error);
    throw error;
  }
}); 