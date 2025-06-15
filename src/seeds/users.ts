import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Project from '../models/Project';

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    age: 30,
    role: 'admin',
    isActive: true,
    socials: [
      { platform: 'linkedin', url: 'https://linkedin.com/in/adminuser' },
      { platform: 'instagram', url: 'https://instagram.com/adminuser' }
    ]
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'user123',
    age: 25,
    role: 'user',
    isActive: true,
    socials: [
      { platform: 'facebook', url: 'https://facebook.com/johndoe' },
      { platform: 'twitter', url: 'https://twitter.com/johndoe' }
    ]
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'user123',
    age: 28,
    role: 'user',
    isActive: true,
    socials: [
      { platform: 'instagram', url: 'https://instagram.com/janesmith' },
      { platform: 'tiktok', url: 'https://tiktok.com/@janesmith' }
    ]
  }
];

const projects = [
  // Projets pour John Doe
  {
    title: 'Collection Streetwear 2024',
    description: "Projet de création d'une collection streetwear inspirée des tendances urbaines.",
    externalUrl: 'https://behance.net/johndoe-streetwear',
    createdByEmail: 'john@example.com'
  },
  {
    title: 'Accessoires éco-responsables',
    description: "Conception d'accessoires de mode à partir de matériaux recyclés.",
    createdByEmail: 'john@example.com'
  },
  // Projets pour Jane Smith
  {
    title: 'Défilé Futuriste',
    description: "Organisation d'un défilé sur le thème du futur et des nouvelles technologies.",
    externalUrl: 'https://janesmith-portfolio.com/futuriste',
    createdByEmail: 'jane@example.com'
  },
  {
    title: 'Robe connectée',
    description: "Création d'une robe intégrant des capteurs et des LEDs pour un effet interactif.",
    createdByEmail: 'jane@example.com'
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

    // Création des projets de mode pour les étudiants
    for (const project of projects) {
      const user = insertedUsers.find(u => u.email === project.createdByEmail);
      if (user) {
        await Project.create({
          title: project.title,
          description: project.description,
          externalUrl: project.externalUrl,
          createdBy: user._id
        });
      }
    }
    console.log('Projects seeded successfully');

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