import { api } from '@/lib/apiClient'
import { PagedResponse } from '@/lib/apiClient'

export interface Faculty {
  id: string
  name: string
  jobTitle: string
  appointmentType?: string
  department: string
  college?: string
  email?: string
  phoneNumber?: string
  office?: string
  profileImageUrl?: string
  researchAreas?: string[]
  biography?: string[]
  publications?: string[]
  createdAt: string
  updatedAt: string
}

export interface FacultyQuery {
  department?: string
  position?: string
  page?: number
  size?: number
}

export interface CreateFacultyRequest {
  name: string
  jobTitle: string
  appointmentType: string
  email?: string
  phoneNumber?: string
  office?: string
  profileImageUrl?: string
  department: string
  college: string
  researchAreas?: string[]
  biography?: string
}

export interface UpdateFacultyRequest extends CreateFacultyRequest {}

// 교수진 API 함수들
export const facultyApi = {
  // 교수진 목록 조회 (페이지네이션)
  getFaculty: (params: FacultyQuery = {}): Promise<PagedResponse<Faculty>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return api.get(`/faculty?${searchParams.toString()}`)
  },

  // 교수진 상세 조회
  getFacultyById: (id: string): Promise<Faculty> => api.get(`/faculty/${id}`),

  // 교수진 등록 (관리자)
  createFaculty: (data: CreateFacultyRequest): Promise<Faculty> =>
    api.auth.post('/admin/faculty', data),

  // 교수진 수정 (관리자)
  updateFaculty: (id: string, data: UpdateFacultyRequest): Promise<Faculty> =>
    api.auth.put(`/admin/faculty/${id}`, data),

  // 교수진 삭제 (관리자)
  deleteFaculty: (id: string): Promise<void> =>
    api.auth.delete(`/admin/faculty/${id}`),
}
