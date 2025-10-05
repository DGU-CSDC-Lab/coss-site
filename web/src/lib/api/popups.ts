import { api } from '../apiClient'

export interface PopupResponse {
  id: string
  title: string
  content: string
  imageUrl?: string
  linkUrl?: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePopupRequest {
  title: string
  content: string
  imageUrl?: string
  linkUrl?: string
  startDate: string
  endDate: string
  isActive: boolean
}

export interface UpdatePopupRequest {
  title?: string
  content?: string
  imageUrl?: string
  linkUrl?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
}

export interface PopupQuery {
  isActive?: boolean
  page?: number
  size?: number
}

export const popupsApi = {
  getPopups: (params?: PopupQuery) => {
    const searchParams = new URLSearchParams()
    if (params?.isActive !== undefined) searchParams.append('isActive', String(params.isActive))
    if (params?.page) searchParams.append('page', String(params.page))
    if (params?.size) searchParams.append('size', String(params.size))
    
    const queryString = searchParams.toString()
    return api.get(`/popups${queryString ? `?${queryString}` : ''}`)
  },
  getActivePopups: (): Promise<PopupResponse[]> => api.get('/popups/active'),
  getPopup: (id: string): Promise<PopupResponse> => api.get(`/popups/${id}`),
  createPopup: (data: CreatePopupRequest): Promise<PopupResponse> =>
    api.auth.post('/admin/popups', data),
  updatePopup: (id: string, data: UpdatePopupRequest): Promise<PopupResponse> =>
    api.auth.put(`/admin/popups/${id}`, data),
  deletePopup: (id: string): Promise<void> => api.auth.delete(`/admin/popups/${id}`),
}
