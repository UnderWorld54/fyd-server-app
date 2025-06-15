import { Types } from 'mongoose';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  age?: number;
  city: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
  refreshToken?: string | null;
  interests?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): Omit<IUser, 'password'>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: Omit<IUser, 'password'>;
    token: string;
  };
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  age?: number;
  city: string;
  interests: string[];
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface EventResponse {
  id: string;
  name: string;
  date: string;
  place?: Array<{
    address?: { line1?: string };
    postalCode?: string;
    city?: { name?: string };
    country?: { name?: string };
    upcomingEvents?: { _total?: number };
    images?: Array<{ url?: string }>;
  }>;
  priceRanges?: Array<{
    min?: number;
    max?: number;
  }>;
  ticket?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

