'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { postsApi, PostDetail } from '@/lib/api/posts'
import NewsDetail from '@/components/news/NewsDetail'

export default function UpdatesDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string)
    }
  }, [params.id])

  const fetchPost = async (id: string) => {
    try {
      setLoading(true)
      const response = await postsApi.getPost(id)
      setPost(response)
    } catch (error) {
      console.error('Failed to fetch post:', error)
      router.push('/news/updates')
    } finally {
      setLoading(false)
    }
  }

  return <NewsDetail post={post} loading={loading} backPath="/news/updates" />
}
