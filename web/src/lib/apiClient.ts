import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/lib/api/auth'

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_API_VERSION}`

// 공통 타입 정의
export interface PagedResponse<T> {
  items: T[]
  meta: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

// 호환성을 위한 별칭
export interface PaginatedResponse<T> extends PagedResponse<T> {}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  // 기본 요청 함수
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    }

    // FormData일 경우 Content-Type 제거 (브라우저가 boundary 포함한 헤더 자동 설정)
    if (config.body instanceof FormData) {
      delete (config.headers as any)['Content-Type']
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.message || 'Unknown error') as any
      error.status = response.status
      throw error
    }

    // 204 No Content 또는 빈 응답 처리
    if (
      response.status === 204 ||
      response.headers.get('content-length') === '0'
    ) {
      return undefined as T
    }

    const result = await response.json()

    // Extract data from SuccessResponse wrapper for single objects
    // PagedResponse remains unchanged
    return result.data !== undefined ? result.data : result
  }

  // 토큰 자동 주입 요청
  async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { accessToken, refreshToken, updateAccessToken, logout } =
      useAuthStore.getState()

    // 1. Access Token이 없으면 Refresh Token으로 갱신 시도
    let token = accessToken
    if (!token && refreshToken) {
      try {
        const newTokens = await authApi.refresh({ refreshToken })
        updateAccessToken(newTokens.accessToken)
        token = newTokens.accessToken
      } catch (err: any) {
        // refresh 자체 실패 → 로그인 페이지로
        logout()
        globalThis.location.href = '/login'
        throw new Error('세션이 만료 되었습니다. 다시 로그인 해주세요.')
      }
    }

    // 2. 그래도 accessToken이 없으면 로그아웃 처리
    if (!token) {
      logout()
      globalThis.location.href = '/login'
      throw new Error('세션이 만료 되었습니다. 다시 로그인 해주세요.')
    }

    try {
      return await this.request<T>(endpoint, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...options.headers,
        },
      })
    } catch (error: any) {
      // 401, 403 에러 시 토큰 갱신 시도
      if (error.status === 401 || error.status === 403) {
        if (refreshToken) {
          try {
            const newTokens = await authApi.refresh({ refreshToken })
            updateAccessToken(newTokens.accessToken)

            // 새 토큰으로 재시도
            return await this.request<T>(endpoint, {
              ...options,
              headers: {
                Authorization: `Bearer ${newTokens.accessToken}`,
                ...options.headers,
              },
            })
          } catch (refreshError: any) {
            // refresh API에서도 401, 403 발생 시
            if (refreshError.status === 401 || refreshError.status === 403) {
              alert('재로그인이 필요합니다.')
              globalThis.location.href = '/login'
            }
            logout()
            throw new Error('Authentication failed')
          }
        } else {
          logout()
          throw new Error('No refresh token available')
        }
      }
      throw error
    }
  }

  // 공개 API 요청
  async publicRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, options)
  }

  // GET 요청
  async get<T>(endpoint: string, authenticated = false): Promise<T> {
    if (authenticated) {
      return this.authenticatedRequest<T>(endpoint, { method: 'GET' })
    }
    return this.publicRequest<T>(endpoint, { method: 'GET' })
  }

  // POST 요청
  async post<T>(
    endpoint: string,
    data?: any,
    authenticated = false
  ): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined

    const options: RequestInit = {
      method: 'POST',
      body: body,
    }

    if (authenticated) {
      return this.authenticatedRequest<T>(endpoint, options)
    }
    return this.publicRequest<T>(endpoint, options)
  }

  // PUT 요청
  async put<T>(
    endpoint: string,
    data?: any,
    authenticated = false
  ): Promise<T> {
    const options: RequestInit = {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }

    if (authenticated) {
      return this.authenticatedRequest<T>(endpoint, options)
    }
    return this.publicRequest<T>(endpoint, options)
  }

  // DELETE 요청
  async delete<T>(endpoint: string, authenticated = false): Promise<T> {
    if (authenticated) {
      return this.authenticatedRequest<T>(endpoint, { method: 'DELETE' })
    }
    return this.publicRequest<T>(endpoint, { method: 'DELETE' })
  }
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient(API_BASE_URL)

// 편의 함수들
export const api = {
  // 공개 API
  get: <T>(endpoint: string) => apiClient.get<T>(endpoint, false),
  post: <T>(endpoint: string, data?: any) =>
    apiClient.post<T>(endpoint, data, false),

  // 인증 필요 API
  auth: {
    get: <T>(endpoint: string) => apiClient.get<T>(endpoint, true),
    post: <T>(endpoint: string, data?: any) =>
      apiClient.post<T>(endpoint, data, true),
    put: <T>(endpoint: string, data?: any) =>
      apiClient.put<T>(endpoint, data, true),
    delete: <T>(endpoint: string) => apiClient.delete<T>(endpoint, true),
  },
}

export default apiClient
