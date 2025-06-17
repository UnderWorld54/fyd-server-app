import { AuthController } from '../controllers/authController';
import { AuthService } from '../services/authService';
import { Request, Response } from 'express';
import { IUserDocument } from '../types';

// Mock du service d'authentification
jest.mock('../services/authService');

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    // Réinitialisation des mocks
    jest.clearAllMocks();

    // Configuration du mock de réponse
    responseObject = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      }),
    };

    // Création d'une nouvelle instance du contrôleur
    authController = new AuthController();
    mockAuthService = (authController as any).authService;
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const mockUserData = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        city: 'Paris',
        interests: ['sport']
      };

      const mockUser: Partial<IUserDocument> = {
        ...mockUserData,
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: () => mockUserData
      };
      const mockToken = 'mock-token';

      mockRequest = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          city: 'Paris',
          interests: ['sport'],
        },
      };

      mockAuthService.register.mockResolvedValue({
        user: mockUser as IUserDocument,
        token: mockToken,
      });

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toEqual({
        success: true,
        data: {
          user: mockUserData,
          token: mockToken,
        },
        message: 'User registered successfully',
      });
    });

    it('should return 400 when required fields are missing', async () => {
      // Arrange
      mockRequest = {
        body: {
          name: 'Test User',
          // email manquant
          password: 'password123',
        },
      };

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        error: 'Name, email and password are required',
      });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const mockUserData = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        city: 'Paris',
        interests: ['sport']
      };

      const mockUser: Partial<IUserDocument> = {
        ...mockUserData,
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: () => mockUserData
      };
      const mockToken = 'mock-token';
      const mockRefreshToken = 'mock-refresh-token';

      mockRequest = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      };

      mockAuthService.login.mockResolvedValue({
        user: mockUser as IUserDocument,
        token: mockToken,
        refreshToken: mockRefreshToken,
      });

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: {
          user: mockUserData,
          token: mockToken,
          refreshToken: mockRefreshToken,
        },
        message: 'Login successful',
      });
    });

    it('should return 401 with invalid credentials', async () => {
      // Arrange
      mockRequest = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      };

      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        success: false,
        error: 'Invalid credentials',
      });
    });
  });
}); 