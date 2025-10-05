import { api } from '../apiClient'

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  parentId: string
  displayOrder: number
  children: Category[]
}

export interface CreateCategoryRequest {
  name: string
  slug: string
  description: string
  parentId?: string
  displayOrder: number
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {}

// 카테고리 API 함수들
export const categoriesApi = {
  // 카테고리 목록 조회 (계층구조)
  getCategories: (): Promise<Category[]> => api.get('/categories'),

  // 카테고리 생성 (관리자)
  createCategory: (data: CreateCategoryRequest): Promise<Category> =>
    api.auth.post('/admin/categories', data),

  // 카테고리 수정 (관리자)
  updateCategory: (
    id: string,
    data: UpdateCategoryRequest
  ): Promise<Category> => api.auth.put(`/admin/categories/${id}`, data),

  // 카테고리 삭제 (관리자)
  deleteCategory: (id: string): Promise<void> =>
    api.auth.delete(`/admin/categories/${id}`),
}
