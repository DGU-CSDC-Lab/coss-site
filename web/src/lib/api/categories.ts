import { apiRequest, authenticatedRequest } from '../api'

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
  getCategories: (): Promise<Category[]> =>
    apiRequest('/api/categories'),

  // 카테고리 생성 (관리자)
  createCategory: (data: CreateCategoryRequest, token: string): Promise<Category> =>
    authenticatedRequest('/admin/categories', token, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 카테고리 수정 (관리자)
  updateCategory: (id: string, data: UpdateCategoryRequest, token: string): Promise<Category> =>
    authenticatedRequest(`/admin/categories/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 카테고리 삭제 (관리자)
  deleteCategory: (id: string, token: string): Promise<void> =>
    authenticatedRequest(`/admin/categories/${id}`, token, {
      method: 'DELETE',
    }),
}
