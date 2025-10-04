import { api } from '../apiClient'
import { PagedResponse } from '../apiClient'

export interface Popup {
  id: string
  title: string
  content: string
  imageUrl?: string
  linkUrl?: string
  isActive: boolean
  startDate: string
  endDate: string
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  width: number
  height: number
  createdAt: string
  updatedAt: string
}

export interface PopupsQuery {
  isActive?: boolean
  page?: number
  size?: number
}

export interface CreatePopupRequest {
  title: string
  content: string
  imageUrl?: string
  linkUrl?: string
  isActive: boolean
  startDate: string
  endDate: string
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  width: number
  height: number
}

export interface UpdatePopupRequest extends CreatePopupRequest {}

// 팝업 API 함수들
export const popupsApi = {
  // 팝업 목록 조회 (페이지네이션)
  getPopups: (params: PopupsQuery = {}): Promise<PagedResponse<Popup>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return api.get(`/popups?${searchParams.toString()}`)
  },

  // 팝업 상세 조회
  getPopup: (id: string): Promise<Popup> => api.get(`/popups/${id}`),

  // 팝업 생성 (관리자)
  createPopup: (data: CreatePopupRequest): Promise<Popup> =>
    api.auth.post('/admin/popups', data),

  // 팝업 수정 (관리자)
  updatePopup: (id: string, data: UpdatePopupRequest): Promise<Popup> =>
    api.auth.put(`/admin/popups/${id}`, data),

  // 팝업 삭제 (관리자)
  deletePopup: (id: string): Promise<void> =>
    api.auth.delete(`/admin/popups/${id}`),
}
