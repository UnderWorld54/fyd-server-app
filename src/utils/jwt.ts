import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

export class JWTUtils {
  private static secret = process.env.JWT_SECRET as jwt.Secret;
  private static expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions);
  }

  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}