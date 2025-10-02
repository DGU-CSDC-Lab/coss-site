'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PaginatedResponse } from '@/lib/api'
import { postsApi, Post } from '@/lib/api/posts'
import NewsList from '@/components/news/NewsList'
import Tabs from '@/components/tabs/Tabs'

const categoryMap: Record<string, { id: string; title: string }> = {
  'scholarship-info': { id: 'scholarship-info', title: '장학정보' },
  news: { id: 'news', title: '뉴스' },
  resources: { id: 'resources', title: '자료실' },
  notices: { id: 'notices', title: '공지사항' },
  contest: { id: 'contest', title: '공모전 정보' },
  activities: { id: 'activities', title: '교육/활동/취업 정보' },
}

export default function NewsPage() {
  const params = useParams()
  const category = params.category as string
  const [posts, setPosts] = useState<PaginatedResponse<Post> | null>(null)
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [searchType, setSearchType] = useState<'title' | 'author' | 'all'>(
    'title'
  )
  const [currentPage, setCurrentPage] = useState(1)

  const categoryInfo = categoryMap[category]

  useEffect(() => {
    if (categoryInfo) {
      fetchPosts()
    }
  }, [currentPage, category])

  const fetchPosts = async () => {
    if (!categoryInfo) return

    try {
      setLoading(true)
      const response = await postsApi.getPosts({
        categoryName: categoryInfo.title,
        keyword: keyword || undefined,
        page: currentPage,
        size: 10,
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (!categoryInfo) {
    return <div>카테고리를 찾을 수 없습니다.</div>
  }

  return (
    <div className="w-full">
      <Tabs />
      <NewsList
        posts={posts}
        loading={loading}
        keyword={keyword}
        searchType={searchType}
        currentPage={currentPage}
        basePath={`/news/${category}`}
        title={categoryInfo.title}
        onKeywordChange={setKeyword}
        onSearchTypeChange={setSearchType}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
