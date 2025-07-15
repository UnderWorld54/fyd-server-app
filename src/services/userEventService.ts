import User from '../models/User';
import { SaveEventRequest } from '../types';
import { logger } from '../utils/logger';

export class UserEventService {
  /**
   * Ajouter un événement à la liste de l'utilisateur
   */
  async saveEvent(userId: string, eventData: SaveEventRequest): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Vérifier si l'événement est déjà sauvegardé
      const existingEvent = user.savedEvents?.find(
        event => event.eventId === eventData.eventId
      );

      if (existingEvent) {
        throw new Error('Event already saved');
      }

      // Ajouter l'événement à la liste
      user.savedEvents = user.savedEvents || [];
      user.savedEvents.push({
        eventId: eventData.eventId,
        name: eventData.name,
        date: eventData.date,
        location: eventData.location,
        imageUrl: eventData.imageUrl,
        savedAt: new Date()
      });

      await user.save();
      logger.info('Event saved successfully', { userId, eventId: eventData.eventId });
      return true;
    } catch (error) {
      logger.error('Error saving event', { error, userId, eventData });
      throw error;
    }
  }

  /**
   * Récupérer tous les événements sauvegardés d'un utilisateur
   */
  async getUserEvents(userId: string): Promise<any[]> {
    try {
      const user = await User.findById(userId).select('savedEvents');
      if (!user) {
        throw new Error('User not found');
      }

      return user.savedEvents || [];
    } catch (error) {
      logger.error('Error getting user events', { error, userId });
      throw error;
    }
  }

  /**
   * Supprimer un événement de la liste de l'utilisateur
   */
  async removeEvent(userId: string, eventId: string): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const initialLength = user.savedEvents?.length || 0;
      user.savedEvents = user.savedEvents?.filter(
        event => event.eventId !== eventId
      ) || [];

      if (user.savedEvents.length === initialLength) {
        throw new Error('Event not found in user list');
      }

      await user.save();
      logger.info('Event removed successfully', { userId, eventId });
      return true;
    } catch (error) {
      logger.error('Error removing event', { error, userId, eventId });
      throw error;
    }
  }

  /**
   * Vérifier si un événement est sauvegardé par l'utilisateur
   */
  async isEventSaved(userId: string, eventId: string): Promise<boolean> {
    try {
      const user = await User.findById(userId).select('savedEvents');
      if (!user) {
        return false;
      }

      return user.savedEvents?.some(event => event.eventId === eventId) || false;
    } catch (error) {
      logger.error('Error checking if event is saved', { error, userId, eventId });
      return false;
    }
  }
} 