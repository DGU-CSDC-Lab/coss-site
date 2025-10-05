import { api } from '../apiClient'
import { PaginatedResponse } from '../apiClient'
import { filesApi } from './files'
import { cleanHtml, isHtmlTooLarge } from '../../utils/htmlUtils'

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
  status: 'draft' | 'private' | 'public'
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
  searchType?: 'title' | 'author'
  page?: number
  size?: number
  sort?: 'latest' | 'popular'
  status?: 'draft' | 'private' | 'public'
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
  categoryName: string // categoryId 대신 categoryName 사용
  status: 'draft' | 'private' | 'public'
  thumbnailUrl?: string | null
  files?: CreatePostFile[]
}

export interface UpdatePostRequest {
  title?: string
  contentHtml?: string
  categoryName?: string
  status?: 'draft' | 'private' | 'public'
  thumbnailUrl?: string
  files?: CreatePostFile[]
}

// 게시글 API 함수들
export const postsApi = {
  // 공개 게시글 목록 조회
  getPosts: (params: PostsQuery = {}): Promise<PaginatedResponse<Post>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return api.get(`/posts?${searchParams.toString()}`)
  },

  // 관리자 게시글 목록 조회 (모든 상태)
  getAdminPosts: (
    params: PostsQuery = {}
  ): Promise<PaginatedResponse<Post>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return api.auth.get(`/admin/posts?${searchParams.toString()}`)
  },

  // 게시글 상세 조회
  getPost: (id: string): Promise<PostDetail> => api.get(`/posts/${id}`),

  // 관리자 게시글 상세 조회
  getAdminPost: (id: string): Promise<PostDetail> =>
    api.auth.get(`/admin/posts/${id}`),

  // 게시글 생성 (관리자)
  createPost: async (data: CreatePostRequest): Promise<Post> => {
    // HTML 정리
    const cleanedContentHtml = cleanHtml(data.contentHtml)

    // HTML 크기 확인
    if (isHtmlTooLarge(cleanedContentHtml)) {
      throw new Error('게시글 내용이 너무 큽니다. 내용을 줄여주세요.')
    }

    // 1. 파일 업로드 완료 처리
    const completedFiles = []
    if (data.files) {
      for (const file of data.files) {
        try {
          await filesApi.completeUpload({
            fileKey: file.fileKey,
            ownerType: 'POST',
            ownerId: 'temp',
          })
          completedFiles.push(file)
        } catch (error) {
          console.error('File completion failed:', error)
        }
      }
    }

    // 2. 게시글 생성
    const postData = {
      ...data,
      contentHtml: cleanedContentHtml,
      files: completedFiles,
    }

    return api.auth.post('/admin/posts', postData)
  },

  // 게시글 수정 (관리자)
  updatePost: (id: string, data: UpdatePostRequest): Promise<Post> =>
    api.auth.put(`/admin/posts/${id}`, data),

  // 게시글 삭제 (관리자)
  deletePost: (id: string): Promise<void> =>
    api.auth.delete(`/admin/posts/${id}`),
}
