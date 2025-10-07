

import { Link } from 'react-router-dom'

import { CalendarIcon, UserIcon, EyeIcon } from '@heroicons/react/24/outline'
import { PaginatedResponse } from '@/lib/apiClient'
import { Post } from '@/lib/api/posts'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import LoadingSpinner from '../common/loading/LoadingSpinner'
import EmptyState from '../common/EmptyState'

interface NewsListProps {
  posts: PaginatedResponse<Post> | null
  loading: boolean
  keyword: string
  searchType: 'title' | 'author' | 'all'
  currentPage: number
  basePath: string
  title?: string
  onKeywordChange: (keyword: string) => void
  onSearchTypeChange: (type: 'title' | 'author' | 'all') => void
  onSearch: () => void
  onPageChange: (page: number) => void
}

export default function NewsList({
  posts,
  loading,
  keyword,
  searchType,
  currentPage,
  basePath,
  onKeywordChange,
  onSearchTypeChange,
  onSearch,
  onPageChange,
}: NewsListProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  const searchTypeOptions = [
    { value: 'title', label: '제목' },
    { value: 'author', label: '작성자' },
  ]

  const getPlaceholder = () => {
    switch (searchType) {
      case 'title':
        return '제목을 입력해주세요.'
      case 'author':
        return '작성자를 입력해주세요.'
      default:
        return '검색어를 입력해주세요.'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      {/* 검색 영역 */}
      <div className="flex justify-between items-start md:items-center gap-4">
        <div className="text-body-18-regular text-gray-700">
          전체{' '}
          <span className="text-pri-500">{posts?.meta.totalElements || 0}</span>{' '}
          건
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Dropdown
            value={searchType}
            onChange={value =>
              onSearchTypeChange(value as 'title' | 'author' | 'all')
            }
            options={searchTypeOptions}
            size="md"
            className="w-full sm:w-auto"
          />

          <Input
            value={keyword}
            onChange={onKeywordChange}
            placeholder={getPlaceholder()}
            onKeyPress={handleKeyPress}
            size="md"
            className="w-full sm:w-80"
          />

          <Button
            onClick={onSearch}
            size="md"
            radius="md"
            variant="point_2"
            className="w-full sm:w-auto"
          >
            검색
          </Button>
        </div>
      </div>

      <div className="h-4" />
      {/* 게시글 목록 (리스트 형태) */}
      <div className="space-y-1">
        {posts?.items.length === 0 ? (
          <EmptyState message="검색 결과가 없습니다." />
        ) : (
          posts?.items.map((post, index) => (
            <Link
              key={post.id}
              to={`${basePath}/${post.categoryName}/${post.id}`}
            >
              <div className="flex items-center gap-4 p-4 hover:bg-gray-100 transition-colors">
                <div className="w-8 text-caption-14 text-point-1 text-center">
                  {(currentPage - 1) * 10 + index + 1}
                </div>

                <div className="flex-1">
                  <h3 className="text-body-18-regular text-text">
                    {post.title}
                  </h3>
                  <div className="h-2" />
                  <div className="flex items-center gap-4 text-caption-12 text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      {post.viewCount}
                    </span>
                  </div>
                </div>
              </div>
              <hr className="border-surface" />
            </Link>
          ))
        )}
      </div>

      <div className="h-8" />
      {/* 페이지네이션 - 항상 표시 */}
      <div className="flex justify-center items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-8 h-8 disabled:opacity-50"
        >
          <img
            src="/assets/icon/chevron_left.svg"
            alt="이전"
            width={16}
            height={16}
          />
        </button>

        {posts &&
          Array.from(
            { length: Math.min(5, posts.meta.totalPages || 1) },
            (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-2 text-caption-14 ${
                    currentPage === pageNum
                      ? 'text-pri-500 text-semibold'
                      : 'text-gray-900 hover-primary'
                  }`}
                >
                  {pageNum}
                </button>
              )
            }
          )}

        {posts && posts.meta.totalPages > 5 && (
          <>
            <span className="px-2 text-gray-900">...</span>
            <button
              onClick={() => onPageChange(posts.meta.totalPages)}
              className="px-3 py-2 text-caption-14 text-text hover-primary"
            >
              {posts.meta.totalPages}
            </button>
          </>
        )}

        <button
          onClick={() =>
            onPageChange(Math.min(posts?.meta.totalPages || 1, currentPage + 1))
          }
          disabled={currentPage === (posts?.meta.totalPages || 1)}
          className="flex items-center justify-center w-8 h-8 disabled:opacity-50"
        >
          <img
            src="/assets/icon/chevron_right.svg"
            alt="다음"
            width={16}
            height={16}
          />
        </button>
      </div>
    </div>
  )
}
