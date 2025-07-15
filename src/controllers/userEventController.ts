import { Request, Response } from 'express';
import { UserEventService } from '../services/userEventService';
import { logger } from '../utils/logger';
import { SaveEventRequest } from '../types';

export class UserEventController {
  private userEventService: UserEventService;

  constructor() {
    this.userEventService = new UserEventService();
  }

  /**
   * @swagger
   * /api/user/events:
   *   get:
   *     summary: Récupérer tous les événements sauvegardés de l'utilisateur
   *     tags: [User Events]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Liste des événements sauvegardés récupérée avec succès
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       eventId:
   *                         type: string
   *                         example: "123456"
   *                       name:
   *                         type: string
   *                         example: "Concert de Jazz"
   *                       date:
   *                         type: string
   *                         example: "2024-01-15T20:00:00Z"
   *                       location:
   *                         type: string
   *                         example: "Salle Pleyel, Paris"
   *                       imageUrl:
   *                         type: string
   *                         example: "https://example.com/image.jpg"
   *                       savedAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-10T10:30:00Z"
   *       401:
   *         description: Non authentifié
   *       500:
   *         description: Erreur serveur
   */
  getUserEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const events = await this.userEventService.getUserEvents(userId);

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      logger.error('Error getting user events', { error });
      res.status(500).json({
        success: false,
        error: 'Error retrieving user events'
      });
    }
  };

  /**
   * @swagger
   * /api/user/events:
   *   post:
   *     summary: Ajouter un événement à la liste de l'utilisateur
   *     tags: [User Events]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - eventId
   *               - name
   *               - date
   *               - location
   *             properties:
   *               eventId:
   *                 type: string
   *                 description: ID unique de l'événement
   *                 example: "123456"
   *               name:
   *                 type: string
   *                 description: Nom de l'événement
   *                 example: "Concert de Jazz"
   *               date:
   *                 type: string
   *                 description: Date de l'événement
   *                 example: "2024-01-15T20:00:00Z"
   *               location:
   *                 type: string
   *                 description: Lieu de l'événement
   *                 example: "Salle Pleyel, Paris"
   *               imageUrl:
   *                 type: string
   *                 description: URL de l'image de l'événement
   *                 example: "https://example.com/image.jpg"
   *     responses:
   *       200:
   *         description: Événement ajouté avec succès
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Event saved successfully"
   *       400:
   *         description: Événement déjà sauvegardé ou données invalides
   *       401:
   *         description: Non authentifié
   *       500:
   *         description: Erreur serveur
   */
  saveEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const eventData: SaveEventRequest = req.body;

      await this.userEventService.saveEvent(userId, eventData);

      res.json({
        success: true,
        message: 'Event saved successfully'
      });
    } catch (error) {
      logger.error('Error saving event', { error });
      
      if (error instanceof Error && error.message === 'Event already saved') {
        res.status(400).json({
          success: false,
          error: 'Event already saved'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Error saving event'
      });
    }
  };

  /**
   * @swagger
   * /api/user/events/{eventId}:
   *   delete:
   *     summary: Supprimer un événement de la liste de l'utilisateur
   *     tags: [User Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de l'événement à supprimer
   *         example: "123456"
   *     responses:
   *       200:
   *         description: Événement supprimé avec succès
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Event removed successfully"
   *       400:
   *         description: Événement non trouvé dans la liste
   *       401:
   *         description: Non authentifié
   *       500:
   *         description: Erreur serveur
   */
  removeEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { eventId } = req.params;

      await this.userEventService.removeEvent(userId, eventId);

      res.json({
        success: true,
        message: 'Event removed successfully'
      });
    } catch (error) {
      logger.error('Error removing event', { error });
      
      if (error instanceof Error && error.message === 'Event not found in user list') {
        res.status(400).json({
          success: false,
          error: 'Event not found in user list'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Error removing event'
      });
    }
  };

  /**
   * @swagger
   * /api/user/events/{eventId}/check:
   *   get:
   *     summary: Vérifier si un événement est sauvegardé par l'utilisateur
   *     tags: [User Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de l'événement à vérifier
   *         example: "123456"
   *     responses:
   *       200:
   *         description: Statut de sauvegarde de l'événement
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     isSaved:
   *                       type: boolean
   *                       example: true
   *       401:
   *         description: Non authentifié
   *       500:
   *         description: Erreur serveur
   */
  checkEventSaved = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { eventId } = req.params;

      const isSaved = await this.userEventService.isEventSaved(userId, eventId);

      res.json({
        success: true,
        data: { isSaved }
      });
    } catch (error) {
      logger.error('Error checking if event is saved', { error });
      res.status(500).json({
        success: false,
        error: 'Error checking event status'
      });
    }
  };
} 