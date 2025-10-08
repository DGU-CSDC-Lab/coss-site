import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { postsApi } from '@/lib/api/posts'
import NewsDetail from '@/components/news/NewsDetail'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'

export default function DetailPage() {
  const { id, category } = useParams()

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.getPost(id!),
    enabled: !!id,
  })

  const getBackPath = () => {
    if (category && post?.categorySlug) {
      return `/news?category=${post.categorySlug}`
    }
    if (category) {
      // categorySlug가 없는 경우 URL의 category 파라미터 사용
      return `/news?category=${category}`
    }
    return '/news'
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <EmptyState message="게시글을 찾을 수 없습니다." />
      </div>
    )
  }

  return <NewsDetail post={post} loading={false} backPath={getBackPath()} />
}
