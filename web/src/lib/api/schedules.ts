import { api } from '../apiClient'
import { PagedResponse } from '../apiClient'

export interface Schedule {
  id: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  location?: string
  category?: string
  isAllDay?: boolean
  createdAt: string
  updatedAt: string
}

export interface SchedulesQuery {
  year?: number
  month?: string // YYYY-MM 형식
  category?: string
  page?: number
  size?: number
}

export interface CreateScheduleRequest {
  title: string
  description?: string
  startDate: string
  endDate?: string
  location?: string
  category?: string
  isAllDay?: boolean
}

export interface UpdateScheduleRequest extends CreateScheduleRequest {}

// 학사일정 API 함수들
export const schedulesApi = {
  // 학사일정 목록 조회 (페이지네이션)
  getSchedules: (
    params: SchedulesQuery = {}
  ): Promise<PagedResponse<Schedule>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return api.get(`/schedules?${searchParams.toString()}`)
  },

  // 학사일정 상세 조회
  getSchedule: (id: string): Promise<Schedule> => api.get(`/schedules/${id}`),

  // 학사일정 생성 (관리자)
  createSchedule: (data: CreateScheduleRequest): Promise<Schedule> =>
    api.auth.post('/admin/schedules', data),

  // 학사일정 수정 (관리자)
  updateSchedule: (
    id: string,
    data: UpdateScheduleRequest
  ): Promise<Schedule> => api.auth.put(`/admin/schedules/${id}`, data),

  // 학사일정 삭제 (관리자)
  deleteSchedule: (id: string): Promise<void> =>
    api.auth.delete(`/admin/schedules/${id}`),
}
