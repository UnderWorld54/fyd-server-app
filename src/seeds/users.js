const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    age: 30,
    role: 'admin',
    isActive: true,
    interests: ['Dance', 'Sport'],
    city: 'Paris'
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
    // Hash des mots de passe
    for (const user of users) {
      user.password = await bcrypt.hash(user.password, 12);
    }

    // Suppression des utilisateurs existants
    await mongoose.connection.collection('users').deleteMany({});
    console.log('Cleared existing users');

    // Création des nouveaux utilisateurs
    const insertedUsers = await mongoose.connection.collection('users').insertMany(users);
    console.log('Users seeded successfully');
    
    return insertedUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

// Exécution du seed seulement si le fichier est exécuté directement
if (require.main === module) {
  // Connexion à MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fyd')
    .then(() => {
      console.log('Connected to MongoDB');
      return seedUsers();
    })
    .then(() => {
      console.log('Seeding completed');
      return mongoose.disconnect();
    })
    .then(() => {
      console.log('Disconnected from MongoDB');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { seedUsers }; 