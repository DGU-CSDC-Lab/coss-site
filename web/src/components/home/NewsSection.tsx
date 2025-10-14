

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { postsApi, Post } from '@/lib/api/posts'
import Button from '@/components/common/Button'
import EmptyState from '@/components/common/EmptyState'

export default function NewsSection() {
  const [news, setNews] = useState<Post[]>([])

  useEffect(() => {
    fetchNews()
  }, [])

  // 뉴스 카테고리 데이터만 조회
  const fetchNews = async () => {
    try {
      const response = await postsApi.getPosts({
        categorySlug: 'news',
        size: 4,
      })
      setNews(response.items)
    } catch (error) {
      console.error('Failed to fetch news:', error)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h2 className="text-body-20-medium text-gray-900">소식</h2>
        <Link to="/news/news">
          <Button radius="md" size="sm" variant="point_2">
            더보기
          </Button>
        </Link>
      </div>

      <hr className="border-gray-300 mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {news.length > 0 ? (
          news.map(item => (
            <Link key={item.id} to={`/news/${item.categorySlug || item.categoryName}/${item.id}`} className="group">
              <div className="bg-white rounded-lg overflow-hidden rounded-lg">
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="w-full h-full opacity-30 bg-gray-300 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]"></div>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1 flex flex-col">
                  <div className="flex items-center">
                    <span className="px-2 py-1 bg-info-600 text-caption-12 text-white rounded-full">
                      {item.categoryName}
                    </span>
                  </div>
                  <h3 className="text-body-14-regular text-gray-900 line-clamp-2 group-hover:text-point-1 transition-colors">
                    {item.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <EmptyState message="소식이 없습니다." />
        )}
      </div>
    </div>
  )
}
