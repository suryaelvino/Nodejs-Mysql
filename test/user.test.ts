import { Request, Response } from 'express';
import UserController from '../src/controllers/userControllers';
import UserService from '../src/services/userServices';

jest.mock('../src/services/userServices', () => ({
  __esModule: true,
  default: {
    createUserWithTimeout: jest.fn(async (name, email, phonenumber, password, role) => {
      if (email === 'existing@example.com') {
        throw new Error('Email already exists');
      }
      if (phonenumber === '123456789') {
        throw new Error('Phonenumber already exists');
      }
      return { id: 'mockUserId', name, email, phonenumber, password, role };
    }),
    getAllUsersWithTimeout: jest.fn(),
  },
}));

describe('UserController', () => {
  describe('createUser', () => {
    it('should respond with status 201 and created user data', async () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          phonenumber: '123456780',
          password: 'password123',
          role: 'user'
        }
      } as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;

      await UserController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 'mockUserId',
        name: 'John Doe',
        email: 'john@example.com',
        phonenumber: '123456780',
        password: 'password123',
        role: 'user'
      });
    });

    it('should respond with status 400 when request body is incomplete', async () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          phonenumber: '123456780',
        }
      } as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;

      await UserController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Request body is incomplete' });
    });

    it('should respond with status 408 when request times out', async () => {
      jest.spyOn(UserService, 'createUserWithTimeout').mockImplementationOnce(async () => {
        throw new Error('Request timed out');
      });

      const req = {
        body: {
          name: 'Timeout User',
          email: 'timeout@example.com',
          phonenumber: '123456789',
          password: 'password123',
          role: 'user'
        }
      } as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;

      await UserController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(408);
      expect(res.json).toHaveBeenCalledWith({ error: 'Request timed out' });
    });

    it('should respond with status 400 when email already exists', async () => {
      const req = {
        body: {
          name: 'Existing Email User',
          email: 'existing@example.com',
          phonenumber: '123456782',
          password: 'password123',
          role: 'user'
        }
      } as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;

      await UserController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email already exists' });
    });

    it('should respond with status 400 when phonenumber already exists', async () => {
      const req = {
        body: {
          name: 'Existing Phonenumber User',
          email: 'new@example.com',
          phonenumber: '123456789',
          password: 'password123',
          role: 'user'
        }
      } as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;

      await UserController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Phonenumber already exists' });
    });

    it('should respond with status 500 when server error occurs', async () => {
      jest.spyOn(UserService, 'createUserWithTimeout').mockImplementationOnce(async () => {
        throw new Error('Some internal error');
      });

      const req = {
        body: {
          name: 'Internal Error User',
          email: 'internalerror@example.com',
          phonenumber: '123456789',
          password: 'password123',
          role: 'user'
        }
      } as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;

      await UserController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getAllUsers', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should respond with status 200 and list of users when successful', async () => {
      (UserService.getAllUsersWithTimeout as jest.Mock).mockResolvedValueOnce({
        count: 10,
        rows: [
          { id: '1', name: 'User 1', email: 'test1@example.com', phonenumber: '1234567891', role: 'user' },
          { id: '2', name: 'User 2', email: 'test2@example.com', phonenumber: '1234567892', role: 'user' }
        ]
      });
      const req = { query: { page: '1', limit: '10' } } as unknown as Request;
      const res = { status: jest.fn(() => res), json: jest.fn() } as unknown as Response;
      await UserController.getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        totalUsers: 10,
        totalPages: 1,
        currentPage: 1,
        users: [
          { id: '1', name: 'User 1', email: 'test1@example.com', phonenumber: '1234567891', role: 'user' },
          { id: '2', name: 'User 2', email: 'test2@example.com', phonenumber: '1234567892', role: 'user' }
        ]
      });
    });

    it('should respond with status 408 when request times out', async () => {
      (UserService.getAllUsersWithTimeout as jest.Mock).mockRejectedValueOnce(new Error('Request timed out'));
      const req = { query: { page: '1', limit: '10' } } as unknown as Request;
      const res = { status: jest.fn(() => res), json: jest.fn() } as unknown as Response;
      await UserController.getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(408);
      expect(res.json).toHaveBeenCalledWith({ error: 'Request timed out' });
    });

    it('should respond with status 500 when internal server error occurs', async () => {
      (UserService.getAllUsersWithTimeout as jest.Mock).mockRejectedValueOnce(new Error('Some internal error'));
      const req = { query: { page: '1', limit: '10' } } as unknown as Request;
      const res = { status: jest.fn(() => res), json: jest.fn() } as unknown as Response;
      await UserController.getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
