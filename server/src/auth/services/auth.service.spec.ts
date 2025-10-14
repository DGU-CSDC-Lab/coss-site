import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/auth/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Account, UserRole } from '@/auth/entities';
import { VerificationCodeService } from '@/auth/services/verification-code.service';
import { AuthException, DatabaseException } from '@/common/exceptions';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

jest.mock('bcrypt');
jest.mock('nodemailer');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userRepository: any;
  let accountRepository: any;
  let verificationCodeService: any;

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

  const mockVerificationCodeService = {
    generateCode: jest.fn(),
    storeCode: jest.fn(),
    verifyCode: jest.fn(),
    useCode: jest.fn(),
  };

  const mockTransporter = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

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
        {
          provide: VerificationCodeService,
          useValue: mockVerificationCodeService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(User));
    accountRepository = module.get(getRepositoryToken(Account));
    verificationCodeService = module.get<VerificationCodeService>(VerificationCodeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register successfully', async () => {
      const mockUser = { id: 'user-id', username: 'user-1234', role: UserRole.USER };
      const mockAccount = { id: 'account-id', email: registerRequest.email, passwordHash: 'hashed-password', user: mockUser };

      mockAccountRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockAccountRepository.create.mockReturnValue(mockAccount);
      mockAccountRepository.save.mockResolvedValue(mockAccount);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      await service.register(registerRequest);

      expect(accountRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerRequest.email },
      });
      expect(userRepository.create).toHaveBeenCalled();
      expect(accountRepository.create).toHaveBeenCalled();
    });

    it('should throw when email already exists', async () => {
      const existingAccount = { id: 'existing-id', email: registerRequest.email };
      mockAccountRepository.findOne.mockResolvedValue(existingAccount);

      await expect(service.register(registerRequest)).rejects.toThrow();
    });

    it('should throw on database error', async () => {
      mockAccountRepository.findOne.mockRejectedValue(DatabaseException.queryError('Database error'));

      await expect(service.register(registerRequest)).rejects.toThrow();
    });
  });

  describe('login', () => {
    const loginRequest = {
      email: 'admin@iot.ac.kr',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'admin',
        role: UserRole.ADMIN,
      };

      const mockAccount = {
        id: 'account-id',
        email: 'admin@iot.ac.kr',
        passwordHash: 'hashed-password',
        user: mockUser,
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login(loginRequest);

      expect(accountRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginRequest.email },
        relations: ['user'],
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        userId: 'user-id',
        role: UserRole.ADMIN,
      });
    });

    it('should throw when account not found', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginRequest)).rejects.toThrow();
    });

    it('should throw when password is invalid', async () => {
      const mockAccount = {
        id: 'account-id',
        email: loginRequest.email,
        passwordHash: 'hashed-password',
        user: { id: 'user-id' },
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginRequest)).rejects.toThrow();
    });

    it('should throw when no user associated with account', async () => {
      const mockAccount = {
        id: 'account-id',
        email: loginRequest.email,
        passwordHash: 'hashed-password',
        user: null,
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginRequest)).rejects.toThrow();
    });

    it('should throw on database error', async () => {
      mockAccountRepository.findOne.mockRejectedValue(DatabaseException.queryError('Database error'));

      await expect(service.login(loginRequest)).rejects.toThrow();
    });
  });

  describe('refresh', () => {
    const refreshRequest = { refreshToken: 'valid-refresh-token' };

    it('should refresh token successfully', async () => {
      const mockPayload = { sub: 'user-id', email: 'admin@iot.ac.kr' };
      const mockUser = {
        id: 'user-id',
        role: UserRole.ADMIN,
        account: { email: 'admin@iot.ac.kr' },
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.refresh(refreshRequest);

      expect(jwtService.verify).toHaveBeenCalledWith(refreshRequest.refreshToken);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        relations: ['account'],
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        userId: 'user-id',
        role: UserRole.ADMIN,
      });
    });

    it('should throw when user not found', async () => {
      const mockPayload = { sub: 'user-id', email: 'admin@iot.ac.kr' };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.refresh(refreshRequest)).rejects.toThrow();
    });

    it('should throw on JWT error', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw AuthException.notFoundUser('JWT error');
      });

      await expect(service.refresh(refreshRequest)).rejects.toThrow();
    });
  });

  describe('getUserInfo', () => {
    const userId = 'user-id';

    it('should return user info successfully', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'admin',
        role: UserRole.ADMIN,
        account: {
          email: 'admin@iot.ac.kr',
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserInfo(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['account'],
      });
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.account.email,
        username: mockUser.username,
        role: mockUser.role,
      });
    });

    it('should throw when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserInfo(userId)).rejects.toThrow();
    });

    it('should throw on database error', async () => {
      mockUserRepository.findOne.mockRejectedValue(DatabaseException.queryError('Database error'));

      await expect(service.getUserInfo(userId)).rejects.toThrow();
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordRequest = { email: 'admin@iot.ac.kr' };

    it('should generate reset code and send email successfully', async () => {
      const mockAccount = { id: 'account-id', email: 'admin@iot.ac.kr' };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockVerificationCodeService.generateCode.mockReturnValue('123456');
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.forgotPassword(forgotPasswordRequest);

      expect(accountRepository.findOne).toHaveBeenCalledWith({
        where: { email: forgotPasswordRequest.email },
      });
      expect(verificationCodeService.generateCode).toHaveBeenCalled();
      expect(verificationCodeService.storeCode).toHaveBeenCalledWith(forgotPasswordRequest.email, '123456', 10);
      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('should throw when account not found', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.forgotPassword(forgotPasswordRequest)).rejects.toThrow();
    });

    it('should throw on email send error', async () => {
      const mockAccount = { id: 'account-id', email: 'admin@iot.ac.kr' };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockVerificationCodeService.generateCode.mockReturnValue('123456');
      mockTransporter.sendMail.mockRejectedValue(AuthException.failedCodeSend('admin@iot.ac.kr', 'Email send error'));

      await expect(service.forgotPassword(forgotPasswordRequest)).rejects.toThrow();
    });
  });

  describe('verifyCode', () => {
    const verifyCodeRequest = { email: 'admin@iot.ac.kr', code: '123456' };

    it('should verify code successfully', async () => {
      mockVerificationCodeService.verifyCode.mockReturnValue(true);

      await service.verifyCode(verifyCodeRequest);

      expect(verificationCodeService.verifyCode).toHaveBeenCalledWith(verifyCodeRequest.email, verifyCodeRequest.code);
    });

    it('should throw when code is invalid', async () => {
      mockVerificationCodeService.verifyCode.mockReturnValue(false);

      await expect(service.verifyCode(verifyCodeRequest)).rejects.toThrow();
    });

    it('should throw on verification service error', async () => {
      mockVerificationCodeService.verifyCode.mockImplementation(() => {
        throw AuthException.failedCodeVerify('123456', 'Verification error');
      });

      await expect(service.verifyCode(verifyCodeRequest)).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    const resetPasswordRequest = {
      email: 'admin@iot.ac.kr',
      code: '123456',
      newPassword: 'new-password',
    };

    it('should reset password successfully', async () => {
      const mockAccount = {
        id: 'account-id',
        email: 'admin@iot.ac.kr',
        passwordHash: 'old-hash',
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockVerificationCodeService.useCode.mockReturnValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      await service.resetPassword(resetPasswordRequest);

      expect(accountRepository.findOne).toHaveBeenCalledWith({
        where: { email: resetPasswordRequest.email },
      });
      expect(verificationCodeService.useCode).toHaveBeenCalledWith(resetPasswordRequest.email);
      expect(accountRepository.save).toHaveBeenCalled();
    });

    it('should throw when account not found', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordRequest)).rejects.toThrow();
    });

    it('should throw when code is invalid', async () => {
      const mockAccount = { id: 'account-id', email: 'admin@iot.ac.kr' };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockVerificationCodeService.useCode.mockReturnValue(false);

      await expect(service.resetPassword(resetPasswordRequest)).rejects.toThrow();
    });

    it('should throw on database error', async () => {
      mockAccountRepository.findOne.mockRejectedValue(DatabaseException.queryError('Database error'));

      await expect(service.resetPassword(resetPasswordRequest)).rejects.toThrow();
    });
  });

  describe('changePassword', () => {
    const userId = 'user-id';
    const changePasswordRequest = {
      currentPassword: 'current-password',
      newPassword: 'new-password',
    };

    it('should change password successfully', async () => {
      const mockUser = {
        id: 'user-id',
        account: {
          id: 'account-id',
          email: 'admin@iot.ac.kr',
          passwordHash: 'current-hash',
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      await service.changePassword(userId, changePasswordRequest);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['account'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(changePasswordRequest.currentPassword, 'current-hash');
      expect(accountRepository.save).toHaveBeenCalled();
    });

    it('should throw when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.changePassword(userId, changePasswordRequest)).rejects.toThrow();
    });

    it('should throw when current password is incorrect', async () => {
      const mockUser = {
        id: 'user-id',
        account: {
          id: 'account-id',
          email: 'admin@iot.ac.kr',
          passwordHash: 'current-hash',
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(userId, changePasswordRequest)).rejects.toThrow();
    });

    it('should throw when new password is same as current', async () => {
      const samePasswordRequest = {
        currentPassword: 'same-password',
        newPassword: 'same-password',
      };

      const mockUser = {
        id: 'user-id',
        account: {
          id: 'account-id',
          email: 'admin@iot.ac.kr',
          passwordHash: 'current-hash',
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.changePassword(userId, samePasswordRequest)).rejects.toThrow();
    });

    it('should throw on database error', async () => {
      mockUserRepository.findOne.mockRejectedValue(DatabaseException.queryError('Database error'));

      await expect(service.changePassword(userId, changePasswordRequest)).rejects.toThrow();
    });
  });

  describe('sendVerificationEmail (private method)', () => {
    it('should throw when email sending fails', async () => {
      const mockAccount = { id: 'account-id', email: 'test@example.com' };
      
      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockVerificationCodeService.generateCode.mockReturnValue('123456');
      mockTransporter.sendMail.mockRejectedValue(AuthException.failedCodeSend('test@example.com', 'SMTP error'));

      await expect(service.forgotPassword({ email: 'test@example.com' })).rejects.toThrow();
    });
  });
});
