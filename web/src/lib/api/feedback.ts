import { api } from '@/lib/apiClient'

export interface CreateFeedbackRequest {
  title: string
  content: string
  type: 'BUG' | 'FEATURE' | 'IMPROVEMENT' | 'OTHER'
  imageUrls?: string[]
}

export interface FeedbackResponse {
  id: string
  title: string
  content: string
  type: 'BUG' | 'FEATURE' | 'IMPROVEMENT' | 'OTHER'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
  imageUrls?: string[]
  username: string
  createdAt: string
}

export const feedbackApi = {
  create: (data: CreateFeedbackRequest): Promise<FeedbackResponse> =>
    api.auth.post('/feedback', data),

  getMyFeedbacks: (): Promise<FeedbackResponse[]> =>
    api.auth.get('/feedback'),
}
