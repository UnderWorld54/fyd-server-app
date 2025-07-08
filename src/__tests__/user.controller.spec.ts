import { UserController } from '../controllers/userController';
import { UserService } from '../services/userService';
import { Request, Response } from 'express';
import { IUserDocument, IUser } from '../types';

jest.mock('../services/userService');

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    jest.clearAllMocks();

    responseObject = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      }),
    };

    userController = new UserController();
    mockUserService = (userController as any).userService;
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const mockUserData: IUser = {
        _id: '123',
        name: 'Jean Wow',
        email: 'test@wow.com',
        city: 'Paris',
        interests: ['sport'],
        role: 'user',
        isActive: true
      };

      const mockUser: Partial<IUserDocument> = {
        ...mockUserData,
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: () => mockUserData
      };

      mockRequest = {
        body: {
          name: 'Jean Wow',
          email: 'test@wow.com',
          password: 'mdpdefou',
          city: 'Paris',
          interests: ['sport']
        },
        user: { _id: 'admin123', name: 'Admin', email: 'admin@example.com', city: 'Paris' }
      };

      mockUserService.createUser.mockResolvedValue(mockUser as IUserDocument);

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toEqual({
        success: true,
        data: mockUser,
        message: 'User created successfully',
      });
    });

    it('should return 400 when user creation fails', async () => {
      mockRequest = {
        body: {
          name: 'Jean Wow',
          email: 'mail pas valide pas de arobase',
          city: 'Paris'
        }
      };

      mockUserService.createUser.mockRejectedValue(new Error('Validation error'));

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        error: 'Validation error',
      });
    });
  });

  describe('getAllUsers', () => {
    it('should retrieve all users successfully', async () => {
      const mockUsers: Partial<IUserDocument>[] = [
        {
          _id: '123',
          name: 'Jean Wowzer',
          email: 'jean@wowzer.com',
          city: 'Paris',
          interests: ['music']
        },
        {
          _id: '124',
          name: 'Paulo Dybala',
          email: 'paulo@dybala.com',
          city: 'Rome',
          interests: ['sport']
        }
      ];

      mockRequest = {};
      mockUserService.getAllUsers.mockResolvedValue(mockUsers as IUserDocument[]);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: mockUsers,
        message: 'Retrieved 2 users',
      });
    });

    it('should return 500 when getting users fails', async () => {
      mockRequest = {};
      mockUserService.getAllUsers.mockRejectedValue(new Error('Database error'));

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('getUserById', () => {
    it('should retrieve user by id successfully', async () => {
      const mockUser: Partial<IUserDocument> = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        city: 'Paris',
        interests: ['sport']
      };

      mockRequest = {
        params: { id: '123' }
      };

      mockUserService.getUserById.mockResolvedValue(mockUser as IUserDocument);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: mockUser,
        message: 'User retrieved successfully',
      });
    });

    it('should return 404 when user is not found', async () => {
      mockRequest = {
        params: { id: '999' }
      };

      mockUserService.getUserById.mockResolvedValue(null);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({
        success: false,
        error: 'User not found',
      });
    });

    it('should return 500 when getting user by id fails', async () => {
      mockRequest = {
        params: { id: '123' }
      };

      mockUserService.getUserById.mockRejectedValue(new Error('Database error'));

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUpdatedUser: Partial<IUserDocument> = {
        _id: '123',
        name: 'Updated User',
        email: 'test@example.com',
        city: 'Lyon',
        interests: ['music']
      };

      mockRequest = {
        params: { id: '123' },
        body: {
          name: 'Updated User',
          city: 'Lyon',
          interests: ['music']
        }
      };

      mockUserService.updateUser.mockResolvedValue(mockUpdatedUser as IUserDocument);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: mockUpdatedUser,
        message: 'User updated successfully',
      });
    });

    it('should return 404 when user to update is not found', async () => {
      mockRequest = {
        params: { id: '999' },
        body: { name: 'Updated User' }
      };

      mockUserService.updateUser.mockResolvedValue(null);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({
        success: false,
        error: 'User not found',
      });
    });

    it('should return 400 when update fails', async () => {
      mockRequest = {
        params: { id: '123' },
        body: { email: 'invalid-email' }
      };

      mockUserService.updateUser.mockRejectedValue(new Error('Validation error'));

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        error: 'Validation error',
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockUser: Partial<IUserDocument> = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com'
      };

      mockRequest = {
        params: { id: '123' }
      };

      mockUserService.deleteUser.mockResolvedValue(mockUser as IUserDocument);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        message: 'User deleted successfully',
      });
    });

    it('should return 404 when user to delete is not found', async () => {
      mockRequest = {
        params: { id: '999' }
      };

      mockUserService.deleteUser.mockResolvedValue(null);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({
        success: false,
        error: 'User not found',
      });
    });

    it('should return 500 when delete fails', async () => {
      mockRequest = {
        params: { id: '123' }
      };

      mockUserService.deleteUser.mockRejectedValue(new Error('probleme db'));

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        error: 'probleme db',
      });
    });
  });
}); 