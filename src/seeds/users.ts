import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    age: 30,
    role: 'admin',
    isActive: true,
    interests: ['Dance', 'Sport'],
    city: 'Reims'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'user123',
    age: 25,
    role: 'user',
    isActive: true,
    interests: ['Dance', 'Sport'],
    city: 'Paris'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'user123',
    age: 28,
    role: 'user',
    isActive: true,
    interests: ['Dance', 'Sport'],
    city: 'Paris'
  }
];

const seedUsers = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/modart');
    console.log('Connected to MongoDB');

    // Suppression des utilisateurs existants
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash des mots de passe
    for (const user of users) {
      user.password = await bcrypt.hash(user.password, 12);
    }

    // Création des nouveaux utilisateurs
    const insertedUsers = await User.insertMany(users);
    console.log('Users seeded successfully');

    // Déconnexion de MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Exécution du seed
seedUsers(); 