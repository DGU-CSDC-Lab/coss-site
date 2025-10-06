import { Link } from 'react-router-dom'
import { PostDetail } from '@/lib/api/posts'
import LoadingSpinner from '../common/LoadingSpinner'

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
    return <div className="text-center py-8">게시글을 찾을 수 없습니다.</div>
  }

  return (
    <div className="w-full">
      <hr className="border-surface border-1 border-gray-700" />
      <div className="h-4" />
      {/* 헤더 영역 */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 font-caption-14 text-white rounded-full bg-info-600`}
          >
            {post.categoryName}
          </span>
          <h1 className="font-heading-28 text-text flex-1">{post.title}</h1>
        </div>

        <div className="py-4">
          <hr className="border-surface border-1 border-gray-700" />
        </div>
        <div className="flex items-center gap-4 font-caption-14">
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
        className="py-8 prose max-w-none font-body-14-regular leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {/* 첨부파일 영역 */}
      {post.files && post.files.length > 0 && (
        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-body-14-medium text-gray-800">
                첨부파일
              </span>
            </div>
            <div className="space-y-2">
              {post.files.map(file => (
                <a
                  key={file.id}
                  href={file.downloadUrl}
                  download={file.originalName}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-body-14-regular text-gray-700 flex-1">
                    {file.originalName}
                  </span>
                  <span className="font-caption-12 text-gray-500">
                    {(file.fileSize / 1024).toFixed(1)}KB
                  </span>
                </a>
              ))}
            </div>
          </div>
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
              <span className="px-2 py-1 font-caption-12 text-white rounded-full bg-info-600">
                이전글
              </span>
              <span className="font-body-14-medium font-gray-900 flex-1">
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
              <span className="px-2 py-1 font-caption-12 text-white rounded-full bg-info-600">
                다음글
              </span>
              <span className="font-body-14-medium font-gray-900 flex-1">
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
          className="inline-block px-8 py-3 bg-info-600 text-white rounded-md font-body-14-medium hover:bg-info-800 transition-colors"
        >
          목록보기
        </Link>
      </div>
    </div>
  )
}
