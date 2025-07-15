import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ApiResponse, IUser, SaveEventRequest } from '../types';
import { logger } from '../utils/logger';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: IUser = req.body;
      const user = await this.userService.createUser(userData);
      logger.info('Utilisateur créé par admin', { email: user.email, id: user._id, by: req.user?._id });
      
      const response: ApiResponse<IUser> = {
        success: true,
        data: user,
        message: 'User created successfully'
      };
      
      res.status(201).json(response);
    } catch (error) {
      logger.error('Erreur lors de la création d\'un utilisateur', { error });
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      
      const response: ApiResponse<IUser[]> = {
        success: true,
        data: users,
        message: `Retrieved ${users.length} users`
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      
      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<IUser> = {
        success: true,
        data: user,
        message: 'User retrieved successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userData: Partial<IUser> = req.body;
      
      const user = await this.userService.updateUser(id, userData);
      
      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<IUser> = {
        success: true,
        data: user,
        message: 'User updated successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.deleteUser(id);
      
      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'User deleted successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  // Méthodes pour gérer les événements sauvegardés
  saveEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Utilisateur non authentifié'
        };
        res.status(401).json(response);
        return;
      }

      const eventData: SaveEventRequest = req.body;
      const user = await this.userService.saveEvent(userId.toString(), eventData);
      
      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Erreur lors de la sauvegarde de l\'événement'
        };
        res.status(400).json(response);
        return;
      }
      
      const response: ApiResponse<{ savedEvents: any[] }> = {
        success: true,
        data: { savedEvents: user.savedEvents || [] },
        message: 'Événement sauvegardé avec succès'
      };
      
      res.status(200).json(response);
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde d\'un événement', { error, userId: req.user?._id });
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde de l\'événement'
      };
      res.status(400).json(response);
    }
  };

  getSavedEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Utilisateur non authentifié'
        };
        res.status(401).json(response);
        return;
      }

      logger.info('Récupération des événements sauvegardés', { userId: userId.toString() });
      const user = await this.userService.getSavedEvents(userId.toString());
      
      if (!user) {
        logger.error('Utilisateur non trouvé lors de la récupération des événements', { userId: userId.toString() });
        const response: ApiResponse<null> = {
          success: false,
          error: 'Utilisateur non trouvé'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<{ savedEvents: any[] }> = {
        success: true,
        data: { savedEvents: user.savedEvents || [] },
        message: 'Événements sauvegardés récupérés avec succès'
      };
      
      res.status(200).json(response);
    } catch (error) {
      logger.error('Erreur lors de la récupération des événements sauvegardés', { error, userId: req.user?._id });
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des événements sauvegardés'
      };
      res.status(500).json(response);
    }
  };

  removeSavedEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      const { eventId } = req.params;
      
      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Utilisateur non authentifié'
        };
        res.status(401).json(response);
        return;
      }

      const user = await this.userService.removeSavedEvent(userId.toString(), eventId);
      
      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Utilisateur non trouvé'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<{ savedEvents: any[] }> = {
        success: true,
        data: { savedEvents: user.savedEvents || [] },
        message: 'Événement supprimé des favoris avec succès'
      };
      
      res.status(200).json(response);
    } catch (error) {
      logger.error('Erreur lors de la suppression d\'un événement sauvegardé', { error, userId: req.user?._id, eventId: req.params.eventId });
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'événement'
      };
      res.status(500).json(response);
    }
  };

  isEventSaved = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      const { eventId } = req.params;
      
      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Utilisateur non authentifié'
        };
        res.status(401).json(response);
        return;
      }

      const isSaved = await this.userService.isEventSaved(userId.toString(), eventId);
      
      const response: ApiResponse<{ isSaved: boolean }> = {
        success: true,
        data: { isSaved },
        message: isSaved ? 'Événement est sauvegardé' : 'Événement n\'est pas sauvegardé'
      };
      
      res.status(200).json(response);
    } catch (error) {
      logger.error('Erreur lors de la vérification d\'un événement sauvegardé', { error, userId: req.user?._id, eventId: req.params.eventId });
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la vérification de l\'événement'
      };
      res.status(500).json(response);
    }
  };
}