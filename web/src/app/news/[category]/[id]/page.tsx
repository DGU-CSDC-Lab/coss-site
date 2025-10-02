'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { postsApi, PostDetail } from '@/lib/api/posts'
import NewsDetail from '@/components/news/NewsDetail'
import LoadingSpinner from '@/components/common/LoadingSpinner'

// 카테고리명을 영어 키로 매핑
const categoryNameToKey: Record<string, string> = {
  '뉴스': 'news',
  '소식': 'updates', 
  '장학정보': 'scholarship-info',
  '자료실': 'resources',
  '공지사항': 'notices'
}

export default function NewsDetailPage() {
  const params = useParams()
  const { category, id } = params
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await postsApi.getPost(id as string)
      setPost(response)
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setLoading(false)
    }
  }

  // 카테고리명을 영어 키로 변환하여 쿼리 파라미터로 처리
  const getBackPath = () => {
    const categoryKey = categoryNameToKey[decodeURIComponent(category as string)]
    if (categoryKey) {
      return `/news?category=${categoryKey}`
    }
    // 매핑되지 않으면 원본 카테고리명 사용
    return `/news?category=${encodeURIComponent(category as string)}`
  }

  if (loading) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <NewsDetail post={post} loading={loading} backPath={getBackPath()} />
  )
}
