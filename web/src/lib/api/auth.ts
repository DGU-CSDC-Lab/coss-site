import { api } from '../apiClient'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  role: string
  userId: string
}

export interface RefreshRequest {
  refreshToken: string
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export interface User {
  id: string
  username: string
  role: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyCodeRequest {
  email: string
  code: string
}

export interface ResetPasswordRequest {
  email: string
  code: string
  newPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// 인증 API 함수들
export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.post('/api/auth/login', data),

  refresh: (data: RefreshRequest): Promise<RefreshResponse> =>
    api.post('/api/auth/refresh', data),

  me: (): Promise<User> => api.auth.get('/api/auth/me'),

  forgotPassword: (data: ForgotPasswordRequest): Promise<void> =>
    api.post('/api/auth/forgot-password', data),

  verifyCode: (data: VerifyCodeRequest): Promise<void> =>
    api.post('/api/auth/verify-code', data),

  resetPassword: (data: ResetPasswordRequest): Promise<void> =>
    api.post('/api/auth/reset-password', data),

  changePassword: (data: ChangePasswordRequest): Promise<void> =>
    api.auth.post('/api/auth/change-password', data),
}
