import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '../utils/jwt';
import User from '../models/User';
import { AuthResponse } from '../types';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      const response: AuthResponse = {
        success: false,
        error: 'Access token is required'
      };
      res.status(401).json(response);
      return;
    }

    const token = authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    if (!token) {
      const response: AuthResponse = {
        success: false,
        error: 'Access token is required'
      };
      res.status(401).json(response);
      return;
    }

    // Vérifier le token
    const decoded = JWTUtils.verifyToken(token);
    
    // Récupérer l'utilisateur
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      const response: AuthResponse = {
        success: false,
        error: 'User not found'
      };
      res.status(401).json(response);
      return;
    }

    if (!user.isActive) {
      const response: AuthResponse = {
        success: false,
        error: 'Account is deactivated'
      };
      res.status(401).json(response);
      return;
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    const response: AuthResponse = {
      success: false,
      error: 'Invalid or expired token'
    };
    res.status(401).json(response);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: AuthResponse = {
        success: false,
        error: 'Access denied. No user found.'
      };
      res.status(403).json(response);
      return;
    }

    if (!roles.includes(req.user.role || 'user')) {
      const response: AuthResponse = {
        success: false,
        error: 'Access denied. Insufficient permissions.'
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};