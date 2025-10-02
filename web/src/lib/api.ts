const API_BASE_URL = 'http://localhost:3001'

// 공통 타입 정의
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

// PagedResponse 별칭 추가 (새로운 스펙)
export interface PagedResponse<T> extends PaginatedResponse<T> {}

export interface ApiError {
  code: string
  message: string
  traceId: string
}

// 기본 fetch 함수
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

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

  return response.json()
}

// 인증이 필요한 요청
function authenticatedRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
}

export { apiRequest, authenticatedRequest }
