// src/store/auth.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserInfo {
  id: string
  email: string
  username?: string
}

interface AuthState {
  isLoggedIn: boolean
  accessToken: string | null
  refreshToken: string | null
  user: UserInfo | null
  role: string | null

  // Getters
  isAuthenticated: () => boolean
  // Actions
  login: (
    tokens: { accessToken: string; refreshToken: string },
    user: UserInfo,
    role: 'ADMINISTRATOR' | 'SUPER_ADMIN' | 'ADMIN' | null
  ) => void
  logout: () => void
  updateAccessToken: (newToken: string) => void
  updateRefreshToken: (newToken: string) => void
  updateRole: (newRole: 'ADMINISTRATOR' | 'SUPER_ADMIN' | 'ADMIN' | null) => void
  updateUserInfo: (newUserInfo: UserInfo) => void
}

const isTokenValid = (token: string | null): boolean => {
  if (!token) return false

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      role: null,

      isAuthenticated: () => {
        const state = get()
        return (
          state.isLoggedIn &&
          isTokenValid(state.accessToken) &&
          state.role === 'ADMIN'
        )
      },

      login: ({ accessToken, refreshToken }, user, role) =>
        set({
          isLoggedIn: true,
          accessToken,
          refreshToken,
          user,
          role,
        }),

      logout: () =>
        set({
          isLoggedIn: false,
          accessToken: null,
          refreshToken: null,
          user: null,
          role: null,
        }),

      updateAccessToken: newToken =>
        set({
          accessToken: newToken,
        }),
      updateRefreshToken: newToken =>
        set({
          refreshToken: newToken,
        }),
      updateUserInfo: (newUserInfo: UserInfo) =>
        set({
          user: newUserInfo,
        }),
      updateRole: newRole =>
        set({
          role: newRole,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        isLoggedIn: state.isLoggedIn,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        role: state.role,
      }),
    }
  )
)
