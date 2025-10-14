import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PaginatedResponse } from '@/lib/apiClient'
import { postsApi, Post } from '@/lib/api/posts'
import NewsList from '@/components/news/NewsList'
import Tabs from '@/components/tabs/Tabs'
import { useAlert } from '@/hooks/useAlert'

const categoryMap: Record<string, { id: string; title: string }> = {
  'scholarship-info': { id: 'scholarship-info', title: '장학정보' },
  news: { id: 'news', title: '뉴스' },
  resources: { id: 'resources', title: '자료실' },
  notices: { id: 'notices', title: '공지사항' },
  contest: { id: 'contest', title: '공모전 정보' },
  activities: { id: 'activities', title: '교육/활동/취업 정보' },
}

export default function NewsPage() {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') || 'news'

  const [posts, setPosts] = useState<PaginatedResponse<Post> | null>(null)
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [searchType, setSearchType] = useState<'title' | 'author' | 'all'>(
    'title'
  )
  const [currentPage, setCurrentPage] = useState(1)

  const categoryInfo = categoryMap[category] || categoryMap['news']

  const alert = useAlert()

  useEffect(() => {
    fetchPosts()
  }, [currentPage, category])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await postsApi.getPosts({
        category: categoryInfo.id,
        keyword: keyword || undefined,
        page: currentPage,
        size: 5,
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
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
        basePath="/news"
        title={categoryInfo.title}
        onKeywordChange={setKeyword}
        onSearchTypeChange={setSearchType}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
