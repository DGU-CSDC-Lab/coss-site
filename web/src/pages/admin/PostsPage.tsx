import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LinkIcon } from '@heroicons/react/24/outline'
import { PagedResponse } from '@/lib/apiClient'
import { postsApi, Post } from '@/lib/api/posts'
import { categoriesApi, Category } from '@/lib/api/categories'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import ConfirmModal from '@/components/common/ConfirmModal'
import { useAlert } from '@/hooks/useAlert'
import { useAuthStore } from '@/store/auth.store'
import { canManagePost } from '@/utils/roleDepth'

export default function AdminPostsPage() {
  const { user, role } = useAuthStore()
  console.log('Current user role:', role)
  console.log('Current user ID:', user?.id)
  const [posts, setPosts] = useState<PagedResponse<Post> | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [searchType, setSearchType] = useState('title')
  const [categorySlug, setCategorySlug] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    post: Post | null
  }>({
    isOpen: false,
    post: null,
  })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const alert = useAlert()

  // 권한 체크 함수들
  const canEditPost = (post: Post) =>
    canManagePost(role ?? undefined, user?.id, post.authorId)

  const canDeletePost = (post: Post) =>
    canManagePost(role ?? undefined, user?.id, post.authorId)

  useEffect(() => {
    fetchCategories()
    fetchPosts()
  }, [currentPage])

  // categorySlug, status, sort 변경 시 자동 검색
  useEffect(() => {
    setCurrentPage(1)
    fetchPosts()
  }, [categorySlug, status, sort])

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getCategories()
      setCategories(response)
    } catch (error) {
      alert.error((error as Error).message)
    }
  }

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await postsApi.getAdminPosts({
        keyword: keyword || undefined,
        searchType: searchType as 'title' | 'author',
        category: categorySlug || undefined,
        status: (status as 'draft' | 'private' | 'public') || undefined,
        sort: sort as 'latest' | 'popular',
        page: currentPage,
        size: 20,
      })
      setPosts(response)
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchPosts()
  }

  const handleReset = () => {
    setKeyword('')
    setSearchType('title')
    setCategorySlug('')
    setStatus('')
    setSort('latest')
    setCurrentPage(1)
    setTimeout(() => fetchPosts(), 0)
  }

  const handleDelete = async () => {
    if (!deleteModal.post) return

    try {
      setDeleteLoading(true)
      await postsApi.deletePost(deleteModal.post.id)
      alert.success('게시글이 삭제되었습니다.')
      setDeleteModal({ isOpen: false, post: null })
      fetchPosts()
    } catch (error) {
      alert.error('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Title>게시글 관리</Title>
        <Link to="/admin/posts/create">
          <Button variant="info" radius="md" size="md">
            새 게시글 작성
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="font-body-18-medium text-gray-900">
          전체{' '}
          <span className="text-pri-500">
            {posts?.meta?.totalElements || 0}
          </span>{' '}
          건
        </div>

        <div className="flex flex-wrap gap-2">
          <Dropdown
            value={searchType}
            onChange={setSearchType}
            options={[
              { value: 'title', label: '제목' },
              { value: 'title', label: '제목' },
              { value: 'author', label: '작성자' },
            ]}
            size="md"
            className="w-24"
          />
          <Input
            type="text"
            placeholder={
              searchType === 'title'
                ? '제목을 입력해주세요.'
                : '작성자를 입력해주세요.'
            }
            value={keyword}
            onChange={setKeyword}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            className="w-full sm:w-60"
            size="md"
          />
          <Dropdown
            value={categorySlug}
            onChange={setCategorySlug}
            options={[
              { value: '', label: '전체 카테고리' },
              ...categories.map(cat => ({ value: cat.slug, label: cat.name })),
            ]}
            size="md"
            className="w-32"
          />
          <Dropdown
            value={status}
            onChange={setStatus}
            options={[
              { value: '', label: '전체 상태' },
              { value: '', label: '전체 상태' },
              { value: 'draft', label: '임시저장' },
              { value: 'private', label: '비공개' },
              { value: 'public', label: '공개' },
            ]}
            size="md"
            className="w-24"
          />
          <Dropdown
            value={sort}
            onChange={setSort}
            options={[
              { value: 'latest', label: '최신순' },
              { value: 'latest', label: '최신순' },
              { value: 'popular', label: '인기순' },
            ]}
            size="md"
            className="w-20 whitespace-nowrap"
          />
          <Button
            variant="point_2"
            radius="md"
            size="md"
            onClick={handleSearch}
          >
            검색
          </Button>
          <Button
            variant="unstyled"
            radius="md"
            size="md"
            onClick={handleReset}
          >
            초기화
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-info-100">
        <table className="w-full min-w-[900px]">
          <thead className="bg-info-50 border-b border-info-100">
            <tr>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-4/10 select-none">
                제목
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-1/10 select-none">
                카테고리
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-1/10 select-none">
                상태
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-1/10 select-none">
                조회수
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-1/10 select-none">
                작성일
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-2/10 select-none">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-info-100">
            {posts?.items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-caption-14 text-gray-600"
                >
                  게시글이 없습니다.
                </td>
              </tr>
            ) : (
              posts?.items.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/news/${post.categorySlug}/${post.id}`}
                        className="font-body-14-medium text-gray-600 hover:text-gray-900 line-clamp-1"
                      >
                        {post.title}
                      </Link>
                      {post.hasFiles && (
                        <div className="flex items-center justify-center p-2 bg-gray-200 rounded-full">
                          <LinkIcon className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body-14-medium text-gray-600">
                    {post.categoryName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        post.status === 'public'
                          ? 'bg-green-100 text-green-800'
                          : post.status === 'private'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {post.status === 'public'
                        ? '공개'
                        : post.status === 'private'
                          ? '비공개'
                          : '임시저장'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body-14-medium text-gray-600">
                    {post.viewCount}
                  </td>
                  <td className="px-4 py-3 font-body-14-medium text-gray-600">
                    {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      {/* 수정 버튼 */}
                      <Link
                        to={
                          canManagePost(
                            role ?? undefined,
                            user?.id,
                            post.authorId
                          )
                            ? `/admin/posts/${post.id}`
                            : '#'
                        }
                      >
                        <Button
                          variant="unstyled"
                          size="sm"
                          radius="md"
                          disabled={
                            !canManagePost(
                              role ?? undefined,
                              user?.id,
                              post.authorId
                            )
                          }
                          className={
                            !canManagePost(
                              role ?? undefined,
                              user?.id,
                              post.authorId
                            )
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }
                        >
                          수정
                        </Button>
                      </Link>

                      {/* 삭제 버튼 */}
                      <Button
                        variant="delete"
                        size="sm"
                        radius="md"
                        disabled={
                          !canManagePost(
                            role ?? undefined,
                            user?.id,
                            post.authorId
                          )
                        }
                        className={
                          !canManagePost(
                            role ?? undefined,
                            user?.id,
                            post.authorId
                          )
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }
                        onClick={() => {
                          if (
                            canManagePost(
                              role ?? undefined,
                              user?.id,
                              post.authorId
                            )
                          ) {
                            setDeleteModal({ isOpen: true, post })
                          }
                        }}
                      >
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-2 mt-8">
        {/* 이전 버튼 */}
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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

        {/* 페이지 번호 */}
        {posts &&
          Array.from(
            { length: Math.min(5, posts.meta?.totalPages || 1) },
            (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-caption-14 rounded ${
                    currentPage === pageNum
                      ? 'text-pri-500 font-semibold'
                      : 'text-gray-900 hover:text-pri-500'
                  }`}
                >
                  {pageNum}
                </button>
              )
            }
          )}

        {/* 마지막 페이지 생략 처리 */}
        {posts && (posts.meta?.totalPages || 0) > 5 && (
          <>
            <span className="px-2 text-gray-900">...</span>
            <button
              onClick={() => setCurrentPage(posts.meta?.totalPages || 1)}
              className="px-3 py-2 text-caption-14 text-text hover:text-pri-500"
            >
              {posts.meta?.totalPages}
            </button>
          </>
        )}

        {/* 다음 버튼 */}
        <button
          onClick={() =>
            setCurrentPage(
              Math.min(posts?.meta?.totalPages || 1, currentPage + 1)
            )
          }
          disabled={currentPage === (posts?.meta?.totalPages || 1)}
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

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, post: null })}
        onConfirm={handleDelete}
        title="게시글 삭제"
        message={`"${deleteModal.post?.title}" 게시글을 삭제하시겠습니까?`}
        warningMessage="삭제된 데이터는 복구할 수 없습니다."
        confirmText="삭제"
        loading={deleteLoading}
      />
    </div>
  )
}
