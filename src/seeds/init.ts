import mongoose from 'mongoose';
import User from '../models/User';
import { logger } from '../utils/logger';

export async function initializeDatabase() {
  try {
    logger.info('Checking if database needs initialization...');
    
    // Vérifier s'il y a déjà des utilisateurs
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      logger.info('No users found, running seeds...');
      await runSeeds();
      logger.info('Database initialization completed successfully');
    } else {
      logger.info(`Database already has ${userCount} users, skipping seeds`);
    }
  } catch (error) {
    logger.error('Error during database initialization:', error);
    throw error;
  }
}

async function runSeeds() {
  try {
    // Importer et exécuter les seeds existants
    const { seedUsers } = await import('./users');
    await seedUsers();
    
    logger.info('All seeds executed successfully');
  } catch (error) {
    logger.error('Error running seeds:', error);
    throw error;
  }
}

// Fonction pour forcer les seeds (utile pour les tests)
export async function forceSeed() {
  logger.info('Force running seeds...');
  await runSeeds();
} 