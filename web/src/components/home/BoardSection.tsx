

import { useState, useEffect } from 'react'
import { PaperClipIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { postsApi, Post } from '@/lib/api/posts'
import Button from '@/components/common/Button'

export default function BoardSection() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await postsApi.getPosts({ size: 4 })
      setPosts(response.items)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
  }

  return (
    <div className="bg-white flex flex-col gap-3 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h2 className="font-body-20-medium text-gray-900">게시판</h2>
        <Link to="/news/news">
          <Button radius="md" size="sm" variant="point_2">
            더보기
          </Button>
        </Link>
      </div>

      <hr className="border-gray-200" />

      <div className="">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <div key={post.id}>
              <div className="flex items-center justify-between py-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center space-x-2 flex-1">
                    <span
                      className={`px-2 py-1 font-caption-12 text-white rounded-full bg-info-600`}
                    >
                      {post.categoryName}
                    </span>
                    <span className="text-point-1 font-caption-14">
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <Link
                    to={`/board/${post.id}`}
                    className="pl-2 font-body-14-regular text-gray-900 hover:text-point-1 flex-1 truncate"
                  >
                    {post.title}
                  </Link>
                </div>
                {post.hasFiles && (
                  <PaperClipIcon className="w-5 h-5 text-gray-400" />
                )}
              </div>
              {index < posts.length - 1 && (
                <div className="border-b border-dashed border-gray-300"></div>
              )}
            </div>
          ))
        ) : (
          <div className="text-left text-gray-400 font-body-14-regular">
            게시글이 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
