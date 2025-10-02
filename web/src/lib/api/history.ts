import { apiRequest, authenticatedRequest } from '../api'
import { PagedResponse } from '../api'

export interface History {
  id: string
  year: number
  month: number
  title: string
  description: string
}

export interface HistoryQuery {
  sort?: 'asc' | 'desc'
  year?: number
  page?: number
  size?: number
}

export interface CreateHistoryRequest {
  year: number
  month: number
  title: string
  description: string
}

export interface UpdateHistoryRequest extends CreateHistoryRequest {}

// 연혁 API 함수들
export const historyApi = {
  // 연혁 목록 조회 (페이지네이션)
  getHistory: (params: HistoryQuery = {}): Promise<PagedResponse<History>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return apiRequest(`/api/history?${searchParams.toString()}`)
  },

  // 연혁 상세 조회
  getHistoryById: (id: string): Promise<History> =>
    apiRequest(`/api/history/${id}`),

  // 연혁 등록 (관리자)
  createHistory: (
    data: CreateHistoryRequest,
    token: string
  ): Promise<History> =>
    authenticatedRequest('/admin/history', token, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 연혁 수정 (관리자)
  updateHistory: (
    id: string,
    data: UpdateHistoryRequest,
    token: string
  ): Promise<History> =>
    authenticatedRequest(`/admin/history/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 연혁 삭제 (관리자)
  deleteHistory: (id: string, token: string): Promise<void> =>
    authenticatedRequest(`/admin/history/${id}`, token, {
      method: 'DELETE',
    }),
}
