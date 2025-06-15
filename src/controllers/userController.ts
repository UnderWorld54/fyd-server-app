import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ApiResponse, IUser } from '../types';
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
}