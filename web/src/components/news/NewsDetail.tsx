import { Link } from 'react-router-dom'
import { PaperClipIcon } from '@heroicons/react/24/outline'
import { PostDetail } from '@/lib/api/posts'
import LoadingSpinner from '../common/loading/LoadingSpinner'
import EmptyState from '../common/EmptyState'

interface NewsDetailProps {
  post: PostDetail | null
  loading: boolean
  backPath: string
}

export default function NewsDetail({
  post,
  loading,
  backPath,
}: NewsDetailProps) {
  if (loading) {
    return <LoadingSpinner size="lg" />
  }

  if (!post) {
    return <EmptyState message="게시글을 찾을 수 없습니다." />
  }

  return (
    <div className="w-full">
      <hr className="border-surface border-1 border-gray-700" />
      <div className="h-4" />
      {/* 헤더 영역 */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-caption-14 text-white rounded-full bg-info-600`}
          >
            {post.categoryName}
          </span>
          <h1 className="text-heading-28 text-text flex-1">{post.title}</h1>
        </div>

        <div className="py-4">
          <hr className="border-surface border-1 border-gray-700" />
        </div>
        <div className="flex items-center gap-4 text-caption-14">
          <span className="inline-flex items-center gap-2">
            <span className="text-gray-500">작성자</span>{' '}
            <span className="text-gray-900">{post.author}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="text-gray-500">작성일</span>{' '}
            <span className="text-gray-900">
              {new Date(post.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="text-gray-500">조회수</span>{' '}
            <span className="text-gray-900">{post.viewCount}</span>
          </span>
        </div>
        <div className="py-4">
          <hr className="border-surface border-1 border-gray-500" />
        </div>
      </div>
      {/* 본문 영역 */}
      <div
        className="py-8 prose max-w-none text-body-14-regular leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {/* 첨부파일 영역 */}
      {post.files && post.files.length > 0 && (
        <div className="bg-gray-100">
          <hr className="border-gray-800" />
          {post.files.map((file, index) => (
            <div key={file.id}>
              <a
                href={file.downloadUrl}
                download={file.originalName}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors group"
              >
                <div className="flex-shrink-0 bg-point-2 p-2 rounded-full">
                  <PaperClipIcon className="w-4 h-4 text-white transition-colors" />
                </div>
                <span className="text-body-14-regular text-gray-900 truncate group-hover:text-info-600 transition-colors">
                  {file.originalName}
                </span>
              </a>
              {index < post.files.length - 1 && (
                <hr className="border-gray-800" />
              )}
            </div>
          ))}
          <hr className="border-gray-800" />
        </div>
      )}

      {/* 이전/다음글 네비게이션 */}
      <div className="">
        {post.prevPost && (
          <>
            <hr className="border-surface border-1 border-gray-700" />
            <Link
              to={`${backPath}/${post.prevPost.id}`}
              className="flex items-center gap-3 px-2 py-4 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span className="px-2 py-1 text-caption-12 text-white rounded-full bg-info-600">
                이전글
              </span>
              <span className="text-body-14-medium text-gray-900 flex-1">
                {post.prevPost.title}
              </span>
            </Link>
          </>
        )}
        {post.nextPost && (
          <>
            <hr className="border-surface border-1 border-gray-700" />
            <Link
              to={`${backPath}/${post.nextPost.id}`}
              className="flex items-center gap-3 px-2 py-4 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span className="px-2 py-1 text-caption-12 text-white rounded-full bg-info-600">
                다음글
              </span>
              <span className="text-body-14-medium text-gray-900 flex-1">
                {post.nextPost.title}
              </span>
            </Link>
          </>
        )}
        <hr className="border-surface border-1 border-gray-700" />
      </div>
      <div className="h-8" />
      {/* 목록보기 버튼 */}
      <div className="text-center">
        <Link
          to={backPath}
          className="inline-block px-8 py-3 bg-info-600 text-white rounded-md text-body-14-medium hover:bg-info-800 transition-colors"
        >
          목록보기
        </Link>
      </div>
    </div>
  )
}
