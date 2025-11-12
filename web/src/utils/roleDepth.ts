// 권한 깊이 정의
export const ROLE_DEPTH: Record<string, number> = {
  ADMIN: 1, // 일반 관리자
  SUPER_ADMIN: 2, // 중간 관리자
  ADMINISTRATOR: 3, // 최고 관리자
}

// 권한 라벨 정의
export const ROLE_LABEL: Record<string, string> = {
  ADMINISTRATOR: '최고 관리자',
  SUPER_ADMIN: '중간 관리자',
  ADMIN: '일반 관리자',
}

// 권한에 따른 역할 옵션 설정
export const getRoleOptions = (role: string) => {
  const baseOptions = [{ value: '', label: '권한 선택' }]

  if (role === 'ADMINISTRATOR') {
    return [
      ...baseOptions,
      { value: 'ADMIN', label: '일반 관리자' },
      { value: 'SUPER_ADMIN', label: '중간 관리자' },
    ]
  }
  if (role === 'SUPER_ADMIN') {
    return [...baseOptions, { value: 'ADMIN', label: '일반 관리자' }]
  }
  return baseOptions
}

// 자기보다 아래 권한만 조작 가능
export const canModifyRole = (
  currentRole?: string,
  targetRole?: string
): boolean => {
  if (!currentRole || !targetRole) return false
  return ROLE_DEPTH[currentRole] > ROLE_DEPTH[targetRole]
}

// 생성 가능한 역할 목록
export const getCreatableRoles = (currentRole?: string): string[] => {
  if (!currentRole) return []
  return Object.keys(ROLE_DEPTH).filter(
    role => ROLE_DEPTH[role] < ROLE_DEPTH[currentRole]
  )
}

// 삭제 가능 여부 (같은 레벨 또는 아래 레벨 삭제 가능)
export const canDeleteUser = (
  currentRole?: string,
  targetRole?: string
): boolean => {
  if (!currentRole || !targetRole) return false
  return ROLE_DEPTH[currentRole] >= ROLE_DEPTH[targetRole]
}
export const canUpdateUser = canModifyRole

// 생성 가능 여부
export const canCreateUser = (currentRole?: string): boolean => {
  return getCreatableRoles(currentRole).length > 0
}

// 현재 역할에서 변경 가능한 다음 역할 반환
export const getNextRoles = (currentRole: string): string[] => {
  if (currentRole === 'ADMINISTRATOR') return ['SUPER_ADMIN', 'ADMIN']
  if (currentRole === 'SUPER_ADMIN') return ['ADMIN']
  if (currentRole === 'ADMIN') return ['SUPER_ADMIN'] // 일반 관리자를 중간 관리자로 승격 가능
  return []
}

// 게시물 수정 / 삭제 권한 체크 공통 함수
export const canManagePost = (
  currentRole?: string,
  currentUserId?: string,
  postAuthorId?: string
): boolean => {
  if (!currentRole || !currentUserId) return false

  const normalized = currentRole.toUpperCase()

  if (normalized === 'ADMINISTRATOR' || normalized === 'SUPER_ADMIN')
    return true
  if (normalized === 'ADMIN') return currentUserId === postAuthorId

  return false
}
