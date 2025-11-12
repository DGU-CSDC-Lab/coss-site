import { api } from '@/lib/apiClient'

export interface AdminUser {
  id: string
  email: string
  username: string
  role: string
  isFirstLogin: boolean 
  isLinkExpired?: boolean // 비밀번호 설정 토큰 만료 여부
  createdAt: string
  updatedAt: string
}

export interface CreateSubAdminRequest {
  email: string
  username: string
  permission: string
}

export interface UpdateUserPermissionRequest {
  userId: string
  permission: string
}

// 관리자 관리 API 함수들
export const adminApi = {
  // 모든 관리자 유저 조회 (SUPER_ADMIN만)
  getAllAdmins: (): Promise<AdminUser[]> =>
    api.auth.get('/auth/admin/permissions'),

  // 서브 관리자 생성 (SUPER_ADMIN만)
  createSubAdmin: (data: CreateSubAdminRequest): Promise<AdminUser> =>
    api.auth.post('/auth/sub-admin/create', data),

  // 관리자 권한 변경 (SUPER_ADMIN만)
  updateUserPermission: (data: UpdateUserPermissionRequest): Promise<void> =>
    api.auth.put('/auth/admin/permissions', data),

  // 관리자 제거 (SUPER_ADMIN만)
  removeAdmin: (id: string): Promise<void> =>
    api.auth.delete(`/auth/admin/${id}/permissions`),

  // 비밀번호 설정 링크 재발급
  resendPasswordLink: (userId: string): Promise<void> =>
    api.auth.post('/auth/resend-password-link', { userId }),
}
