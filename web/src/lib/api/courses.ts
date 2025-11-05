import { api, PagedResponse } from '@/lib/apiClient'

// 교과목 마스터 정보 (기본 교과목 정보)
export interface CourseMaster {
  id: string
  semester: string // 학기 (예: "1학기")
  department: string // 학과명
  code: string // 교과목 코드 (예: IOT101)
  name: string // 교과목명 (예: IoT 기초)
  englishName?: string // 교과목 영문명
  description: string // 교과목 설명
  grade?: string // 수강학년 (예: "1학년")
  credit?: number // 학점
  courseType?: string // 강의유형 (예: "이론")
  createdAt: string
  updatedAt: string
}

// 교과목 개설 정보 (특정 년도/학기 개설 정보)
export interface CourseOffering {
  id: string
  master: CourseMaster // 마스터 교과목 정보
  year: number // 개설년도
  semester: string // 학기
  classTime?: string // 수업 시간 (예: "월 09:00-12:00")
  instructor?: string // 담당교원
  classroom?: string // 강의실
  syllabusUrl?: string // 강의계획서 URL
  createdAt: string
  updatedAt: string
}

export interface CoursesQuery {
  name?: string // 교과목명 검색
  department?: string // 학과명 검색
  code?: string // 교과목 코드 검색
  grade?: string // 학년 검색
  year?: number // 년도 필터 (offering 검색시만)
  semester?: string // 학기 필터
  sortBy?: 'name' | 'code' | 'department' | 'grade' | 'credit' | 'createdAt'
  sortOrder?: 'ASC' | 'DESC'
  page?: number
  size?: number
}

// 마스터 교과목 생성 요청
export interface CreateCourseMasterRequest {
  semester: string
  department: string
  courseCode: string
  subjectName: string
  englishName: string
  description: string
  grade: string
  credit: number
  courseType: string
}

// 개설 교과목 생성 요청
export interface CreateCourseOfferingRequest {
  masterId: string // 마스터 교과목 ID
  year: number
  semester: string
  classTime?: string
  instructor?: string
  classroom?: string
  syllabusUrl?: string
}

// 마스터 교과목 수정 요청
export interface UpdateCourseMasterRequest {
  semester?: string
  department?: string
  courseCode?: string
  subjectName?: string
  englishName?: string
  description?: string
  grade?: string
  credit?: number
  courseType?: string
}

// 개설 교과목 수정 요청
export interface UpdateCourseOfferingRequest {
  year?: number
  semester?: string
  classTime?: string
  instructor?: string
  classroom?: string
  syllabusUrl?: string
}

export interface CourseUploadResult {
  successCount: number
  errorCount: number
  errors: string[]
  totalCount: number
}

// 마스터 교과목 일괄 초기화 요청
export interface CourseMasterBulkInitRequest {
  year: number
  semester: string
  courses: {
    semester: string
    department: string
    courseCode: string
    subjectName: string
    englishName?: string
    description: string
    grade?: string
    credit?: number
    courseType?: string
  }[]
}

// 개설 교과목 일괄 초기화 요청
export interface CourseOfferingBulkInitRequest {
  year: number
  semester: string
  courses: {
    masterId: string
    year: number
    semester: string
    classTime?: string
    instructor?: string
    classroom?: string
    syllabusUrl?: string
  }[]
}

// 교과목 API 함수들
export const coursesApi = {
  // === 개설 교과목 (Offering) API ===
  
  // 개설 교과목 목록 조회
  getOfferings: (params: CoursesQuery = {}): Promise<PagedResponse<CourseOffering>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    return api.get(`/courses/offering/search?${searchParams.toString()}`)
  },

  // 개설 교과목 상세 조회
  getOffering: (id: string): Promise<CourseOffering> => 
    api.get(`/courses/offering/${id}`),

  // 개설 교과목 생성 (관리자)
  createOffering: (data: CreateCourseOfferingRequest): Promise<CourseOffering> =>
    api.auth.post('/admin/courses/offering', data),

  // 개설 교과목 수정 (관리자)
  updateOffering: (id: string, data: UpdateCourseOfferingRequest): Promise<CourseOffering> =>
    api.auth.put(`/admin/courses/offering/${id}`, data),

  // 개설 교과목 삭제 (관리자)
  deleteOffering: (id: string): Promise<void> =>
    api.auth.delete(`/admin/courses/offering/${id}`),

  // 개설 교과목 일괄 업로드 (관리자)
  uploadOfferingExcel: (file: File): Promise<CourseUploadResult> => {
    const formData = new FormData()
    formData.append('file', file)
    return api.auth.post('/admin/courses/offering/upload', formData)
  },

  // 개설 교과목 일괄 초기화 (관리자)
  bulkInitOfferings: (data: CourseOfferingBulkInitRequest): Promise<CourseUploadResult> =>
    api.auth.post('/admin/courses/offering/bulk-init', data),

  // === 마스터 교과목 (Master) API ===
  
  // 마스터 교과목 목록 조회
  getMasters: (params: CoursesQuery = {}): Promise<PagedResponse<CourseMaster>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    return api.get(`/courses/master/search?${searchParams.toString()}`)
  },

  // 마스터 교과목 생성 (관리자)
  createMaster: (data: CreateCourseMasterRequest): Promise<CourseMaster> =>
    api.auth.post('/admin/courses/master', data),

  // 마스터 교과목 수정 (관리자)
  updateMaster: (id: string, data: UpdateCourseMasterRequest): Promise<CourseMaster> =>
    api.auth.put(`/admin/courses/master/${id}`, data),

  // 마스터 교과목 삭제 (관리자)
  deleteMaster: (id: string): Promise<void> =>
    api.auth.delete(`/admin/courses/master/${id}`),

  // 마스터 교과목 일괄 업로드 (관리자)
  uploadMasterExcel: (file: File): Promise<CourseUploadResult> => {
    const formData = new FormData()
    formData.append('file', file)
    return api.auth.post('/admin/courses/master/upload', formData)
  },

  // 마스터 교과목 일괄 초기화 (관리자)
  bulkInitMasters: (data: CourseMasterBulkInitRequest): Promise<CourseUploadResult> =>
    api.auth.post('/admin/courses/master/bulk-init', data),
}
