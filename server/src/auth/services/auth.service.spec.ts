import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Account } from '../entities';
import {
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userRepository: any;
  let accountRepository: any;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockAccountRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(User));
    accountRepository = module.get(getRepositoryToken(Account));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = {
        email: 'admin@iot.ac.kr',
        password: 'password123',
      };

      const mockAccount = {
        id: 'account-id',
        email: 'admin@iot.ac.kr',
        passwordHash:
          '$2b$10$01rMdZzfzLsgr6ulhkl91ep8FA9PxIFb3WmaBD1k2GXxNaJAwEtle',
        users: [
          {
            id: 'user-id',
            username: 'admin',
            role: 'ADMIN',
          },
        ],
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(accountRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        relations: ['users'],
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        userId: 'user-id',
        role: 'ADMIN',
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = {
        email: 'invalid@email.com',
        password: 'password123',
      };

      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'admin@iot.ac.kr',
        password: 'wrong-password',
      };

      const mockAccount = {
        id: 'account-id',
        email: 'admin@iot.ac.kr',
        passwordHash: 'correct-password',
        users: [{ id: 'user-id' }],
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockPayload = { sub: 'user-id', email: 'admin@iot.ac.kr' };
      const mockUser = {
        id: 'user-id',
        role: 'ADMIN',
        account: { email: 'admin@iot.ac.kr' },
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.refresh(refreshToken);

      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        relations: ['account'],
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        userId: 'user-id',
        role: 'ADMIN',
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getMe', () => {
    it('should return current user', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: 'user-id',
        username: 'admin',
        role: 'ADMIN',
        account: {
          email: 'admin@iot.ac.kr',
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getMe(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['account'],
      });
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
        email: mockUser.account.email,
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const userId = 'non-existent-user';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getMe(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset code for valid email', async () => {
      const request = { email: 'admin@iot.ac.kr' };
      const mockAccount = { id: 'account-id', email: 'admin@iot.ac.kr' };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      const result = await service.forgotPassword(request);

      expect(accountRepository.findOne).toHaveBeenCalledWith({
        where: { email: request.email },
      });
      expect(result).toEqual({ message: 'Reset code sent to email' });
    });

    it('should throw NotFoundException for invalid email', async () => {
      const request = { email: 'invalid@email.com' };

      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.forgotPassword(request)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = 'user-id';
      const request = {
        currentPassword: 'current-password',
        newPassword: 'new-password',
      };

      const mockUser = {
        id: 'user-id',
        account: {
          id: 'account-id',
          passwordHash: 'current-password',
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.changePassword(userId, request);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['account'],
      });
      expect(accountRepository.save).toHaveBeenCalledWith({
        ...mockUser.account,
        passwordHash: 'new-password',
      });
      expect(result).toEqual({ message: 'Password changed successfully' });
    });

    it('should throw BadRequestException for incorrect current password', async () => {
      const userId = 'user-id';
      const request = {
        currentPassword: 'wrong-password',
        newPassword: 'new-password',
      };

      const mockUser = {
        account: {
          passwordHash: 'current-password',
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.changePassword(userId, request)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
