import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import NewsDetail from '@/components/news/NewsDetail'
import { PostDetail, postsApi } from '@/lib/api/posts'

export default function NotFoundPage() {
  const location = useLocation()
  const params = useParams()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

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
            console.error('Failed to fetch post:', error)
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
        return (
          <div className="text-gray-400 font-body-14-regular">
            게시글을 찾을 수 없습니다.
          </div>
        )
      }

      const getBackPath = () => {
        const categoryNameToKey: Record<string, string> = {
          뉴스: 'news',
          소식: 'updates',
          장학정보: 'scholarship-infos',
          자료실: 'resources',
          공지사항: 'notices',
          '공모전 정보': 'contests',
          '교육/활동/취업 정보': 'activities',
        }

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
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
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
