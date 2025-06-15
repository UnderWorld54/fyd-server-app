import User from '../models/User';
import { IUserDocument } from '../types';
import { JWTUtils } from '../utils/jwt';
import { LoginRequest, RegisterRequest, JwtPayload } from '../types';
import crypto from 'crypto';

export class AuthService {
  async register(userData: RegisterRequest): Promise<{ user: IUserDocument; token: string }> {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Créer l'utilisateur
      const user = new User(userData);
      await user.save();

      // Générer le token
      const payload: JwtPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role || 'user'
      };
      
      const token = JWTUtils.generateToken(payload);

      return { user, token };
    } catch (error) {
      throw new Error(`Registration failed: ${error}`);
    }
  }

  async login(credentials: LoginRequest): Promise<{ user: IUserDocument; token: string; refreshToken: string }> {
    try {
      // Trouver l'utilisateur avec le mot de passe
      const user = await User.findOne({ email: credentials.email }).select('+password');
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Vérifier le mot de passe
      const isPasswordValid = await user.comparePassword(credentials.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Générer le token d'accès
      const payload: JwtPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role || 'user'
      };
      const token = JWTUtils.generateToken(payload);

      // Générer le refresh token
      const refreshToken = crypto.randomBytes(40).toString('hex');
      user.refreshToken = refreshToken;
      await user.save();

      return { user, token, refreshToken };
    } catch (error) {
      throw new Error(`Login failed: ${error}`);
    }
  }

  async getUserById(userId: string): Promise<IUserDocument | null> {
    try {
      return await User.findById(userId);
    } catch (error) {
      throw new Error(`Error fetching user: ${error}`);
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new Error('User not found');
      }

      // Vérifier le mot de passe actuel
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Mettre à jour le mot de passe
      user.password = newPassword;
      await user.save();
    } catch (error) {
      throw new Error(`Password change failed: ${error}`);
    }
  }

  async deactivateUser(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { isActive: false });
    } catch (error) {
      throw new Error(`User deactivation failed: ${error}`);
    }
  }

  async refreshToken(oldRefreshToken: string): Promise<{ token: string; refreshToken: string }> {
    // Chercher l'utilisateur avec ce refresh token
    const user = await User.findOne({ refreshToken: oldRefreshToken });
    if (!user) {
      throw new Error('Invalid refresh token');
    }
    // Générer un nouveau token d'accès
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'user'
    };
    const token = JWTUtils.generateToken(payload);
    // Générer un nouveau refresh token
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    user.refreshToken = newRefreshToken;
    await user.save();
    return { token, refreshToken: newRefreshToken };
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }
}