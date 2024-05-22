import { Request, Response } from 'express';
import UserController from '../src/controllers/userControllers';
import UserService from '../src/services/userServices';
import code from 'http-status-codes';
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
    getAllUsersWithTimeout  : jest.fn(),
    getUserByIdWithTimeout  : jest.fn(),
    updateUserWithTimeout   : jest.fn(),
    updatePwUserWithTimeout : jest.fn(),
    deleteUserWithTimeout   : jest.fn(),
  },
}));

describe('User Controller', () => {
  describe('Create User', () => {
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
    
      const expectedUserData = {
        id: 'mockUserId',
        name: 'John Doe',
        email: 'john@example.com',
        phonenumber: '123456780',
        password: 'password123',
        role: 'user'
      };
      (UserService.createUserWithTimeout as jest.Mock).mockImplementation(async (name:string, email:string, phonenumber:string, password:string, role) => {
        return expectedUserData;
      });
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;
      await UserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(code.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        message: "Success created user",
        code : code.CREATED,
        data: expectedUserData
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

      expect(res.status).toHaveBeenCalledWith(code.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Request body is incomplete', 
        code : code.BAD_REQUEST
      });
    });

    it('should respond with status 408 when request times out', async () => {
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
      (UserService.createUserWithTimeout as jest.Mock).mockRejectedValueOnce(new Error('Request timed out'));
      await UserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(code.REQUEST_TIMEOUT);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Request timed out',
        code : code.REQUEST_TIMEOUT
      });
    });

    it('should respond with status 409 when email already exists', async () => {
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
      (UserService.createUserWithTimeout as jest.Mock).mockRejectedValueOnce(new Error('Email already exists'));
      await UserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(code.CONFLICT);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Email already exists',
        code : code.CONFLICT
       });
    });

    it('should respond with status 409 when phonenumber already exists', async () => {
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
      (UserService.createUserWithTimeout as jest.Mock).mockRejectedValueOnce(new Error('Phonenumber already exists'));
      await UserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(code.CONFLICT);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Phonenumber already exists',
        code : code.CONFLICT
      });
    });

    it('should respond with status 500 when server error occurs', async () => {
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
      (UserService.createUserWithTimeout as jest.Mock).mockRejectedValueOnce(new Error('Internal server error'));
      await UserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(code.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Internal server error',
        code : code.INTERNAL_SERVER_ERROR 
      });
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
      expect(res.status).toHaveBeenCalledWith(code.OK);
      expect(res.json).toHaveBeenCalledWith({
        total_users: 10,
        total_pages: 1,
        current_page: 1,
        data: [
          { id: '1', name: 'User 1', email: 'test1@example.com', phonenumber: '1234567891', role: 'user' },
          { id: '2', name: 'User 2', email: 'test2@example.com', phonenumber: '1234567892', role: 'user' }
        ],
        message: `success get all user in page 1 and limit 10`,
        code: code.OK
      });
    });

    it('should respond with status 408 when request times out', async () => {
      (UserService.getAllUsersWithTimeout as jest.Mock).mockRejectedValueOnce(new Error('Request timed out'));
      const req = { query: { page: '1', limit: '10' } } as unknown as Request;
      const res = { status: jest.fn(() => res), json: jest.fn() } as unknown as Response;
      await UserController.getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(code.REQUEST_TIMEOUT);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Request timed out',
        code: code.REQUEST_TIMEOUT
       });
    });

    it('should respond with status 500 when internal server error occurs', async () => {
      (UserService.getAllUsersWithTimeout as jest.Mock).mockRejectedValueOnce(new Error('Some internal error'));
      const req = { query: { page: '1', limit: '10' } } as unknown as Request;
      const res = { status: jest.fn(() => res), json: jest.fn() } as unknown as Response;
      await UserController.getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(code.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Internal server error',
        code: code.INTERNAL_SERVER_ERROR
      });
    });
  });

  describe('getUserById', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should respond with status 200 and user data when user is found', async () => {
      const req = {
        params: { id: 'validUserId' }
      } as unknown as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;
      const expectedUser = {id: 'validUserId'};
      (UserService.getUserByIdWithTimeout as jest.MockedFunction<typeof UserService.getUserByIdWithTimeout>).mockResolvedValueOnce(expectedUser);
      await UserController.getUserById(req, res);
      expect(UserService.getUserByIdWithTimeout).toHaveBeenCalledWith('validUserId');
      expect(res.status).toHaveBeenCalledWith(code.OK);
      expect(res.json).toHaveBeenCalledWith({
        message : `Success get detail user with ${expectedUser.id}`,
        code    : code.OK,
        data    : expectedUser
      });
    });

    it('should respond with status 404 when user is not found', async () => {
      const expectedId = "nonExistingUserId";
      const req = {
        params: { id: expectedId }
      } as unknown as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;
      (UserService.getUserByIdWithTimeout as jest.MockedFunction<typeof UserService.getUserByIdWithTimeout>).mockResolvedValueOnce(null);
      await UserController.getUserById(req, res);
      expect(UserService.getUserByIdWithTimeout).toHaveBeenCalledWith('nonExistingUserId');
      expect(res.status).toHaveBeenCalledWith(code.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ 
        message : `User not found with ${expectedId}`,
        code    : code.NOT_FOUND 
      });
    });

    it('should respond with status 408 when request times out', async () => {
      jest.spyOn(UserService, 'getUserByIdWithTimeout').mockRejectedValueOnce(new Error('Request timed out'));
      const req = {
        params: { id: 'validUserId' }
      } as unknown as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;
      await UserController.getUserById(req, res);
      expect(UserService.getUserByIdWithTimeout).toHaveBeenCalledWith('validUserId');
      expect(res.status).toHaveBeenCalledWith(code.REQUEST_TIMEOUT);
      expect(res.json).toHaveBeenCalledWith({ 
        message : 'Request timed out',
        code    : code.REQUEST_TIMEOUT 
      });
    });

    it('should respond with status 500 when internal server error occurs', async () => {
      jest.spyOn(UserService, 'getUserByIdWithTimeout').mockRejectedValueOnce(new Error('Some internal error'));
      const req = {
        params: { id: 'validUserId' }
      } as unknown as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;
      await UserController.getUserById(req, res);
      expect(UserService.getUserByIdWithTimeout).toHaveBeenCalledWith('validUserId');
      expect(res.status).toHaveBeenCalledWith(code.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ 
        message : 'Internal server error',
        code    : code.INTERNAL_SERVER_ERROR
      });
    });
  });

  describe('updateUser', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should respond with status 200 and updated user data when successful', async () => {
        const req = {
            params: { id: 'validUserId' },
            body: {
                name: 'Updated Name',
                email: 'updated@example.com',
                phonenumber: '987654321',
                password: 'newPassword'
            }
        } as unknown as Request;
        const updatedUser = {
            id: 'validUserId',
            name: 'Updated Name',
            email: 'updated@example.com',
            phonenumber: '987654321'
        };
        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        } as unknown as Response;
        (UserService.updateUserWithTimeout as jest.Mock).mockResolvedValueOnce(updatedUser);
        await UserController.updateUser(req, res);
        expect(res.status).toHaveBeenCalledWith(code.OK);
        expect(res.json).toHaveBeenCalledWith({
          message : `Success update user with ${updatedUser.id}`,
          code    : code.OK,
          data    : updatedUser
        });
    });

    it('should respond with status 404 when user is not found', async () => {
      const expectedId = "nonExistingUserId";
        const req = {
            params: { id: expectedId },
            body: {
                name: 'Updated Name',
                email: 'updated@example.com',
                phonenumber: '987654321',
                password: 'newPassword'
            }
        } as unknown as Request;
        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        } as unknown as Response;
        (UserService.updateUserWithTimeout as jest.Mock).mockResolvedValueOnce(null);
        await UserController.updateUser(req, res);
        expect(UserService.updateUserWithTimeout).toHaveBeenCalledWith(expectedId, {
            name        : 'Updated Name',
            email       : 'updated@example.com',
            phonenumber : '987654321',
            password    : 'newPassword'
        });
        expect(res.status).toHaveBeenCalledWith(code.NOT_FOUND);
        expect(res.json).toHaveBeenCalledWith({ 
          message : `User not found with ${expectedId}`,
          code    : code.NOT_FOUND
         });
    });

    it('should respond with status 408 when request times out', async () => {
        const req = {
            params: { id: 'validUserId' },
            body: {
                name: 'Updated Name',
                email: 'updated@example.com',
                phonenumber: '987654321',
                password: 'newPassword'
            }
        } as unknown as Request;
        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        } as unknown as Response;
        (UserService.updateUserWithTimeout as jest.Mock).mockRejectedValueOnce(new Error('Request timed out'));
        await UserController.updateUser(req, res);
        expect(UserService.updateUserWithTimeout).toHaveBeenCalledWith('validUserId', {
            name: 'Updated Name',
            email: 'updated@example.com',
            phonenumber: '987654321',
            password: 'newPassword'
        });
        expect(res.status).toHaveBeenCalledWith(code.REQUEST_TIMEOUT);
        expect(res.json).toHaveBeenCalledWith({ 
          message : 'Request timed out',
          code    : code.REQUEST_TIMEOUT
        });
    });

    it('should respond with status 500 when internal server error occurs', async () => {
        const req = {
            params: { id: 'validUserId' },
            body: {
                name: 'Updated Name',
                email: 'updated@example.com',
                phonenumber: '987654321',
                password: 'newPassword'
            }
        } as unknown as Request;
        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        } as unknown as Response;
        (UserService.updateUserWithTimeout as jest.Mock).mockRejectedValueOnce(new Error('Internal server error'));
        await UserController.updateUser(req, res);
        expect(UserService.updateUserWithTimeout).toHaveBeenCalledWith('validUserId', {
            name: 'Updated Name',
            email: 'updated@example.com',
            phonenumber: '987654321',
            password: 'newPassword'
        });
        expect(res.status).toHaveBeenCalledWith(code.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ 
          message : 'Internal server error',
          code    : code.INTERNAL_SERVER_ERROR
        });
    });
  });

  describe('updatePwUser', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should respond with status 200 and success message when password is updated', async () => {
      let userId = 'validUser';
      const req = {
        params: { id: userId },
        body: { password: 'newPassword' }
      } as unknown as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;
      (UserService.updatePwUserWithTimeout as jest.Mock).mockResolvedValueOnce({ id: userId });
      await UserController.updatePwUser(req, res);
      expect(res.status).toHaveBeenCalledWith(code.OK);
      expect(res.json).toHaveBeenCalledWith({
        message : `Success update password users with ${userId}`,
        code    : code.OK
      });
    });

    it('should respond with status 404 when user is not found', async () => {
      let userId = 'nonExistingUserId';
      const req = {
        params: { id: userId },
        body: { password: 'newPassword' }
      } as unknown as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;
      (UserService.getUserByIdWithTimeout as jest.Mock).mockResolvedValueOnce(null);
      await UserController.updatePwUser(req, res);
      expect(res.status).toHaveBeenCalledWith(code.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ 
        message : `User not found with ${userId}`,
        code    : code.NOT_FOUND 
      });
    });
    
    it('should respond with status 408 when request times out', async () => {
      const req = {
        params: { id: 'validUserId' },
        body: { password: 'newPassword' }
      } as unknown as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;
      (UserService.getUserByIdWithTimeout as jest.Mock).mockResolvedValueOnce({ id: 'validUserId' });
      (UserService.updatePwUserWithTimeout as jest.Mock).mockRejectedValueOnce(new Error('Request timed out'));
      await UserController.updatePwUser(req, res);
      expect(res.status).toHaveBeenCalledWith(code.REQUEST_TIMEOUT);
      expect(res.json).toHaveBeenCalledWith({ 
        message  : 'Request timed out',
        code      : code.REQUEST_TIMEOUT 
      });
    });
  
    it('should respond with status 500 when internal server error occurs', async () => {
      const req = {
        params: { id: 'validUserId' },
        body: { password: 'newPassword' }
      } as unknown as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;
      (UserService.getUserByIdWithTimeout as jest.Mock).mockResolvedValueOnce({ id: 'validUserId' });
      (UserService.updatePwUserWithTimeout as jest.Mock).mockRejectedValueOnce(new Error('Internal server error'));
      await UserController.updatePwUser(req, res);
      expect(res.status).toHaveBeenCalledWith(code.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Internal server error', 
        code : code.INTERNAL_SERVER_ERROR
      });
    });
  });  
  
  describe('deleteUser', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should respond with status 200 and deleted user data when successful', async () => {
      const userId:string = 'valudUserId';
      const req = { params: { id: userId } } as unknown as Request;
      const user = { id: userId, name: 'John Doe' };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;
      (UserService.getUserByIdWithTimeout as jest.Mock).mockResolvedValueOnce(user);
      (UserService.deleteUserWithTimeout as jest.Mock).mockResolvedValueOnce({  
        message : `Success delete user with ${userId}`,
        code    :  code.OK, 
      });
      await UserController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(code.OK);
      expect(res.json).toHaveBeenCalledWith({ 
        message : `Success delete user with ${userId}`,
        code    :  code.OK,
      });
    });

    it('should respond with status 404 when user is not found', async () => {
      const userId:string = 'nonExistingUserId';
      const req = { params: { id: userId } } as unknown as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;
      (UserService.getUserByIdWithTimeout as jest.Mock).mockResolvedValueOnce({id : 'existingUserId'});
      await UserController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(code.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ 
        message : `User not found with ${userId}`,
        code    : code.NOT_FOUND 
      });
    });

    it('should respond with status 408 when request times out', async () => {
      const req = { params: { id: 'validUserId' } } as unknown as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;
      (UserService.getUserByIdWithTimeout as jest.Mock).mockRejectedValueOnce({id: 'validUserId'});
      (UserService.deleteUserWithTimeout as jest.Mock).mockRejectedValueOnce(new Error('Request timed out'));
      await UserController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(code.REQUEST_TIMEOUT);
      expect(res.json).toHaveBeenCalledWith({ 
        message : 'Request timed out', 
        code    : code.REQUEST_TIMEOUT
      });
    });

    it('should respond with status 500 when internal server error occurs', async () => {
      const req = { params: { id: 'validUserId' } } as unknown as Request;
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      } as unknown as Response;
      (UserService.getUserByIdWithTimeout as jest.Mock).mockRejectedValueOnce({id: 'validUserId'});
      (UserService.deleteUserWithTimeout as jest.Mock).mockRejectedValueOnce(new Error('Internal server error'));
      await UserController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(code.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ 
        message : 'Internal server error',
        code    : code.INTERNAL_SERVER_ERROR
      });
    });
  });
});
