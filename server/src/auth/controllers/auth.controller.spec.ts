import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { LoginRequest, RefreshRequest } from '../dto/login.dto';
import { ChangePasswordRequest } from '../dto/password-reset.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    refresh: jest.fn(),
    getMe: jest.fn(),
    forgotPassword: jest.fn(),
    verifyCode: jest.fn(),
    resetPassword: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto: LoginRequest = {
        email: 'admin@iot.ac.kr',
        password: 'password123',
      };

      const expectedResult = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshDto: RefreshRequest = {
        refreshToken: 'mock-refresh-token',
      };

      const expectedResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      };

      mockAuthService.refresh.mockResolvedValue(expectedResult);

      const result = await controller.refresh(refreshDto);

      expect(authService.refresh).toHaveBeenCalledWith(refreshDto.refreshToken);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getMe', () => {
    it('should return current user', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'admin',
        role: 'ADMIN',
        email: 'admin@iot.ac.kr',
      };

      const mockRequest = { user: { id: 'user-id' } };
      mockAuthService.getMe.mockResolvedValue(mockUser);

      const result = await controller.getMe(mockRequest);

      expect(authService.getMe).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockUser);
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password email', async () => {
      const request = { email: 'admin@iot.ac.kr' };
      const expectedResult = { message: 'Reset code sent to email' };
      mockAuthService.forgotPassword.mockResolvedValue(expectedResult);

      const result = await controller.forgotPassword(request);

      expect(authService.forgotPassword).toHaveBeenCalledWith(request);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('verifyCode', () => {
    it('should verify reset code', async () => {
      const verifyDto = { email: 'admin@iot.ac.kr', code: '123456' };
      const expectedResult = { message: 'Reset code verified' };
      mockAuthService.verifyCode.mockResolvedValue(expectedResult);

      const result = await controller.verifyCode(verifyDto);

      expect(authService.verifyCode).toHaveBeenCalledWith(verifyDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      const resetDto = { 
        email: 'admin@iot.ac.kr', 
        code: '123456', 
        newPassword: 'newPassword123' 
      };
      const expectedResult = { message: 'Password reset successfully' };
      mockAuthService.resetPassword.mockResolvedValue(expectedResult);

      const result = await controller.resetPassword(resetDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(resetDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      const changeDto: ChangePasswordRequest = { 
        currentPassword: 'oldPassword', 
        newPassword: 'newPassword123' 
      };
      const mockRequest = { user: { id: 'user-id' } };
      const expectedResult = { message: 'Password changed successfully' };
      mockAuthService.changePassword.mockResolvedValue(expectedResult);

      const result = await controller.changePassword(mockRequest, changeDto);

      expect(authService.changePassword).toHaveBeenCalledWith('user-id', changeDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
