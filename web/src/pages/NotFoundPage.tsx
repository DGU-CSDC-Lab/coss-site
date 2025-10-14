import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import NewsDetail from '@/components/news/NewsDetail'
import { PostDetail, postsApi } from '@/lib/api/posts'
import EmptyState from '@/components/common/EmptyState'
import { categoryNameToKey } from '@/config/categoryConfig'
import { useAlert } from '@/hooks/useAlert'

export default function NotFoundPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  const alert = useAlert()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // news/카테고리/id 패턴 체크 및 처리
  const newsDetailPattern = /^\/news\/([^\/]+)\/([a-f0-9-]{36})$/i
  const newsMatch = location.pathname.match(newsDetailPattern)

  if (newsMatch) {
    const [, category, id] = newsMatch

    // 직접 뉴스 상세 컴포넌트 구현
    const CustomNewsDetail = () => {
      const [post, setPost] = useState<PostDetail | null>(null)
      const [loading, setLoading] = useState(true)

      useEffect(() => {
        const fetchPost = async () => {
          try {
            const response = await postsApi.getPost(id)
            setPost(response)
          } catch (error) {
            alert.error((error as Error).message)
          } finally {
            setLoading(false)
          }
        }

        fetchPost()
      }, [])

      if (loading) {
        return (
          <div className="flex flex-col w-full items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )
      }

      if (!post) {
        return <EmptyState message="존재하지 않는 게시글입니다." />
      }

      const getBackPath = () => {
        const decodedCategory = decodeURIComponent(category)
        const categoryKey = categoryNameToKey[decodedCategory]

        if (categoryKey) {
          return `/news?category=${categoryKey}`
        }
        return `/news?category=${encodeURIComponent(decodedCategory)}`
      }

      return <NewsDetail post={post} loading={false} backPath={getBackPath()} />
    }

    return <CustomNewsDetail />
  }

  // 실제 404 페이지
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl text-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">페이지를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  )
}
