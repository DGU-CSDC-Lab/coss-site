import { api } from '../apiClient'
import { PaginatedResponse } from '../api'

export interface PostFile {
  id: string
  originalName: string
  fileSize: number
  downloadUrl: string
}

export interface Post {
  id: string
  title: string
  categoryId: string
  categoryName: string
  author: string
  viewCount: number
  thumbnailUrl: string
  hasFiles: boolean
  fileCount: number
  createdAt: string
  updatedAt: string
}

export interface PostDetail extends Omit<Post, 'hasFiles' | 'fileCount'> {
  contentHtml: string
  files: PostFile[]
  hasFiles: boolean
  fileCount: number
  prevPost?: {
    id: string
    title: string
  }
  nextPost?: {
    id: string
    title: string
  }
}

export interface PostsQuery {
  categoryName?: string
  keyword?: string
  page?: number
  size?: number
  sort?: 'latest' | 'popular'
}

export interface CreatePostFile {
  fileKey: string
  originalName: string
  fileSize: number
  mimeType: string
}

export interface CreatePostRequest {
  title: string
  contentHtml: string
  categoryId: string
  thumbnailUrl?: string
  files?: CreatePostFile[]
}

export interface UpdatePostRequest extends CreatePostRequest {}

// 게시글 API 함수들
export const postsApi = {
  // 게시글 목록 조회
  getPosts: (params: PostsQuery = {}): Promise<PaginatedResponse<Post>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return api.get(`/api/posts?${searchParams.toString()}`)
  },

  // 게시글 상세 조회
  getPost: (id: string): Promise<PostDetail> => api.get(`/api/posts/${id}`),

  // 게시글 생성 (관리자)
  createPost: (data: CreatePostRequest): Promise<Post> =>
    api.auth.post('/admin/posts', data),

  // 게시글 수정 (관리자)
  updatePost: (id: string, data: UpdatePostRequest): Promise<Post> =>
    api.auth.put(`/admin/posts/${id}`, data),

  // 게시글 삭제 (관리자)
  deletePost: (id: string): Promise<void> =>
    api.auth.delete(`/admin/posts/${id}`),
}
