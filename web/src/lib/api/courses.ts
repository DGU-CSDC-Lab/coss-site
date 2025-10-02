import { api } from '../apiClient'
import { PagedResponse } from '../api'

export interface Course {
  id: string
  year: number // 개설년도
  semester: string // 학기 (예: "1학기")
  department: string // 학과명
  courseCode: string // 학수번호 (예: HIS4031-01)
  subjectName: string // 과목명 (예: 서양사연습)
  englishName?: string // 과목명(영문) - 있을 경우만
  grade?: string // 수강학년 (예: "3,4학년")
  credit?: number // 학점 (float, 없을 수도 있음)
  classTime?: string // 강의 시간 (예: "화 8교시(16:00) ~ 9교시(17:30)")
  instructor?: string // 담당 교수
  classroom?: string // 강의실
  courseType?: string // 과목 유형 (공통기초, 전공 등)
  syllabusUrl?: string // 강의계획서 URL
  createdAt: string
  updatedAt: string
}

export interface CoursesQuery {
  name?: string // 키워드 검색
  department?: string // 키워드 검색
  code?: string // 키워드 검색
  grade?: string // 키워드 검색
  year?: number // 정확 일치
  semester?: string // 정확 일치
  sortBy?: 'name' | 'code' | 'department' | 'grade' | 'credit' | 'createdAt'
  sortOrder?: 'ASC' | 'DESC'
  page?: number
  size?: number
}

export interface CreateCourseRequest {
  name: string
  englishName?: string
  code: string
  department: string
  grade: string
  year: number
  semester: string
  instructor?: string
  classroom?: string
  courseType?: string
  credit: number
}

export interface UpdateCourseRequest extends CreateCourseRequest {}

export interface CourseUploadResult {
  successCount: number
  errorCount: number
  errors: string[]
  totalCount: number
}

export interface CourseBulkInitRequest {
  year: number
  semester: string
  courses: {
    year: number
    semester: string
    department: string
    courseCode: string
    subjectName: string
    englishName?: string
    grade?: string
    credit?: number
    classTime?: string
    instructor?: string
    classroom?: string
    courseType?: string
    syllabusUrl?: string
  }[]
}

export interface CourseBulkInitResult {
  successCount: number
  failureCount: number
  errors: string[]
}

// 교과목 API 함수들
export const coursesApi = {
  // 교과목 목록 조회 (페이지네이션 + 검색 + 정렬)
  getCourses: (params: CoursesQuery = {}): Promise<PagedResponse<Course>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return api.get(`/api/courses?${searchParams.toString()}`)
  },

  // 교과목 상세 조회
  getCourse: (id: string): Promise<Course> => api.get(`/api/courses/${id}`),

  // 교과목 생성 (관리자)
  createCourse: (data: CreateCourseRequest): Promise<Course> =>
    api.auth.post('/admin/courses', data),

  // 교과목 수정 (관리자)
  updateCourse: (id: string, data: UpdateCourseRequest): Promise<Course> =>
    api.auth.put(`/admin/courses/${id}`, data),

  // 교과목 삭제 (관리자)
  deleteCourse: (id: string): Promise<void> =>
    api.auth.delete(`/admin/courses/${id}`),

  // Excel 템플릿 다운로드 (관리자)
  downloadTemplate: (): Promise<Blob> =>
    api.auth.get('/admin/courses/template'),

  // Excel 업로드 (관리자)
  uploadExcel: (
    file: File,
    year: number,
    semester: string
  ): Promise<CourseUploadResult> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('year', String(year))
    formData.append('semester', semester)

    return api.auth.post('/admin/courses/upload', formData)
  },

  // 개설 과목 초기화 (관리자)
  bulkInit: (data: CourseBulkInitRequest): Promise<CourseBulkInitResult> =>
    api.auth.post('/admin/courses/bulk-init', data),
}
