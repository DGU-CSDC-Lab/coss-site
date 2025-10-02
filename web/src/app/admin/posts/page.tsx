'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { PaginatedResponse } from '@/lib/api'
import { postsApi, Post } from '@/lib/api/posts'
import Title from '@/components/common/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PaginatedResponse<Post> | null>(null)
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchPosts()
  }, [currentPage])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await postsApi.getPosts({
        keyword: keyword || undefined,
        page: currentPage,
        size: 20,
      })
      setPosts(response)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchPosts()
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 게시글을 삭제하시겠습니까?`)) return

    try {
      await postsApi.deletePost(id)
      alert('게시글이 삭제되었습니다.')
      fetchPosts()
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('삭제 중 오류가 발생했습니다.')
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
        <Link href="/admin/posts/create">
          <Button variant="primary">새 게시글 작성</Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="font-body-18-medium text-gray-900">
          전체{' '}
          <span className="text-pri-500">{posts?.meta.totalElements || 0}</span>{' '}
          건
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="제목을 입력해주세요."
            value={keyword}
            onChange={setKeyword}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            className="w-80"
          />
          <Button variant="secondary" onClick={handleSearch}>
            <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
            검색
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                제목
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-32">
                카테고리
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-24">
                조회수
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-32">
                작성일
              </th>
              <th className="px-4 py-3 text-center font-body-18-medium text-gray-900 w-32">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {posts?.items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center font-caption-14 text-gray-600"
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
                        href={`/news/${post.categoryId}/${post.id}`}
                        className="font-body-18-medium text-gray-900 hover:text-pri-500 line-clamp-1"
                      >
                        {post.title}
                      </Link>
                      {post.hasFiles && (
                        <span className="text-xs bg-info-100 text-info-600 px-2 py-1 rounded">
                          파일 {post.fileCount}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {post.categoryId}
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {post.viewCount}
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <Link href={`/admin/posts/${post.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          수정
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(post.id, post.title)}
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
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          이전
        </Button>

        {posts &&
          Array.from(
            { length: Math.min(5, posts.meta.totalPages || 1) },
            (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            }
          )}

        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            setCurrentPage(
              Math.min(posts?.meta.totalPages || 1, currentPage + 1)
            )
          }
          disabled={currentPage === (posts?.meta.totalPages || 1)}
        >
          다음
        </Button>
      </div>
    </div>
  )
}
