import { useAuthStore } from '@/store/auth.store'
import { authApi } from './api/auth'

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_API_VERSION}`

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
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    // 204 No Content 또는 빈 응답 처리
    if (
      response.status === 204 ||
      response.headers.get('content-length') === '0'
    ) {
      return undefined as T
    }

    return response.json()
  }

  // 토큰 자동 주입 요청
  async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { accessToken, refreshToken, updateAccessToken, logout } =
      useAuthStore.getState()

    if (!accessToken) {
      throw new Error('No access token available')
    }

    try {
      return await this.request<T>(endpoint, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...options.headers,
        },
      })
    } catch (error) {
      // 401 에러 시 토큰 갱신 시도
      if (error instanceof Error && error.message.includes('401')) {
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
          } catch (refreshError) {
            // 리프레시 실패 시 로그아웃
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
    const options: RequestInit = {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
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
