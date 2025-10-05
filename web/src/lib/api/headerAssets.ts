import { api } from '../apiClient'
import { PagedResponse } from '../apiClient'

export enum HeaderAssetType {
  LOGO = 'logo',
  BANNER = 'banner',
  BACKGROUND = 'background',
  ANNOUNCEMENT = 'announcement',
}

export interface HeaderAsset {
  id: string
  title: string
  imageUrl: string
  linkUrl: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface HeaderAssetsQuery {
  isActive?: boolean
  page?: number
  size?: number
}

export interface CreateHeaderAssetRequest {
  title: string
  imageUrl: string
  linkUrl: string
  isActive?: boolean
}

export interface UpdateHeaderAssetRequest {
  title?: string
  imageUrl?: string
  linkUrl?: string
  isActive?: boolean
}

// Header Assets API 함수들
export const headerAssetsApi = {
  // 헤더 요소 목록 조회 (페이지네이션)
  getHeaderAssets: (
    params: HeaderAssetsQuery = {}
  ): Promise<PagedResponse<HeaderAsset>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return api.get(`/header-assets?${searchParams.toString()}`)
  },

  // 헤더 요소 상세 조회
  getHeaderAsset: (id: string): Promise<HeaderAsset> =>
    api.get(`/header-assets/${id}`),

  // 헤더 요소 생성 (관리자)
  createHeaderAsset: (data: CreateHeaderAssetRequest): Promise<HeaderAsset> =>
    api.auth.post('/admin/header-assets', data),

  // 헤더 요소 수정 (관리자)
  updateHeaderAsset: (
    id: string,
    data: UpdateHeaderAssetRequest
  ): Promise<HeaderAsset> => api.auth.put(`/admin/header-assets/${id}`, data),

  // 헤더 요소 삭제 (관리자)
  deleteHeaderAsset: (id: string): Promise<void> =>
    api.auth.delete(`/admin/header-assets/${id}`),
}
