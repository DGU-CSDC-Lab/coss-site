import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@/auth/controllers/auth.controller';
import { AuthService } from '@/auth/services/auth.service';
import { LoginRequest, LoginResponse } from '@/auth/dto/login.dto';
import { RefreshTokenRequest } from '@/auth/dto/token.dto';
import { UserInfoResponse } from '@/auth/dto/info.dto';
import {
  RegisterRequest,
  ForgotPasswordRequest,
  VerifyCodeRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@/auth/dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    getUserInfo: jest.fn(),
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
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const registerDto: RegisterRequest = {
        email: 'test@iot.ac.kr',
        password: 'password123',
      };

      mockService.register.mockResolvedValue(undefined);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toBeUndefined();
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto: LoginRequest = {
        email: 'admin@iot.ac.kr',
        password: 'password123',
      };

      const expectedResult: LoginResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        userId: 'user-id',
        role: 'USER',
      };

      mockService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshDto: RefreshTokenRequest = {
        refreshToken: 'mock-refresh-token',
      };

      const expectedResult: LoginResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        userId: 'user-id',
        role: 'USER',
      };

      mockService.refresh.mockResolvedValue(expectedResult);

      const result = await controller.refresh(refreshDto);

      expect(authService.refresh).toHaveBeenCalledWith(refreshDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getMe', () => {
    it('should return current user', async () => {
      const mockUser: UserInfoResponse = {
        id: 'user-id',
        username: 'admin',
        role: 'ADMIN',
        email: 'admin@iot.ac.kr',
      };

      const mockRequest = { user: { id: 'user-id' } };
      mockService.getUserInfo.mockResolvedValue(mockUser);

      const result = await controller.getMe(mockRequest);

      expect(authService.getUserInfo).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockUser);
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password email', async () => {
      const request: ForgotPasswordRequest = { email: 'admin@iot.ac.kr' };
      mockService.forgotPassword.mockResolvedValue(undefined);

      const result = await controller.forgotPassword(request);

      expect(authService.forgotPassword).toHaveBeenCalledWith(request);
      expect(result).toBeUndefined();
    });
  });

  describe('verifyCode', () => {
    it('should verify reset code', async () => {
      const verifyDto: VerifyCodeRequest = { email: 'admin@iot.ac.kr', code: '123456' };
      mockService.verifyCode.mockResolvedValue(undefined);

      const result = await controller.verifyCode(verifyDto);

      expect(authService.verifyCode).toHaveBeenCalledWith(verifyDto);
      expect(result).toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      const resetDto: ResetPasswordRequest = {
        email: 'admin@iot.ac.kr',
        code: '123456',
        newPassword: 'newPassword123',
      };
      mockService.resetPassword.mockResolvedValue(undefined);

      const result = await controller.resetPassword(resetDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(resetDto);
      expect(result).toBeUndefined();
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      const changeDto: ChangePasswordRequest = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
      };
      const mockRequest = { user: { id: 'user-id' } };
      mockService.changePassword.mockResolvedValue(undefined);

      const result = await controller.changePassword(mockRequest, changeDto);

      expect(authService.changePassword).toHaveBeenCalledWith('user-id', changeDto);
      expect(result).toBeUndefined();
    });
  });
});
