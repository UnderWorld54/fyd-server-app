import User from '../models/User';
import { IUser, IUserDocument, SaveEventRequest } from '../types';

export class UserService {
  async createUser(userData: IUser): Promise<IUserDocument> {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }

  async getAllUsers(): Promise<IUserDocument[]> {
    try {
      return await User.find({})
        .sort({ createdAt: -1 })
        .populate('interests');
    } catch (error) {
      throw new Error(`Error fetching users: ${error}`);
    }
  }

  async getUserById(id: string): Promise<IUserDocument | null> {
    try {
      return await User.findById(id)
        .populate('interests');
    } catch (error) {
      throw new Error(`Error fetching user: ${error}`);
    }
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUserDocument | null> {
    try {
      return await User.findByIdAndUpdate(
        id,
        userData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Error updating user: ${error}`);
    }
  }

  async deleteUser(id: string): Promise<IUserDocument | null> {
    try {
      return await User.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting user: ${error}`);
    }
  }

  async getUserByEmail(email: string): Promise<IUserDocument | null> {
    try {
      return await User.findOne({ email });
    } catch (error) {
      throw new Error(`Error fetching user by email: ${error}`);
    }
  }

  // Méthodes pour gérer les événements sauvegardés
  async saveEvent(userId: string, eventData: SaveEventRequest): Promise<IUserDocument | null> {
    try {
      // Vérifier si l'événement est déjà sauvegardé
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const eventExists = user.savedEvents?.some(event => event.eventId === eventData.eventId);
      if (eventExists) {
        throw new Error('Cet événement est déjà sauvegardé');
      }

      // Ajouter l'événement à la liste des événements sauvegardés
      return await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            savedEvents: {
              ...eventData,
              savedAt: new Date()
            }
          }
        },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Erreur lors de la sauvegarde de l'événement: ${error}`);
    }
  }

  async getSavedEvents(userId: string): Promise<IUserDocument | null> {
    try {
      console.log('Recherche de l\'utilisateur avec l\'ID:', userId);
      const user = await User.findById(userId).select('savedEvents');
      console.log('Utilisateur trouvé:', user ? 'oui' : 'non');
      return user;
    } catch (error) {
      console.error('Erreur dans getSavedEvents:', error);
      throw new Error(`Erreur lors de la récupération des événements sauvegardés: ${error}`);
    }
  }

  async removeSavedEvent(userId: string, eventId: string): Promise<IUserDocument | null> {
    try {
      return await User.findByIdAndUpdate(
        userId,
        {
          $pull: {
            savedEvents: { eventId: eventId }
          }
        },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'événement sauvegardé: ${error}`);
    }
  }

  async isEventSaved(userId: string, eventId: string): Promise<boolean> {
    try {
      const user = await User.findById(userId).select('savedEvents');
      if (!user) {
        return false;
      }
      return user.savedEvents?.some(event => event.eventId === eventId) || false;
    } catch (error) {
      throw new Error(`Erreur lors de la vérification de l'événement sauvegardé: ${error}`);
    }
  }
}