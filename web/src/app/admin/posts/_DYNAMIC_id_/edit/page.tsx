'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { postsApi, PostDetail, UpdatePostRequest } from '@/lib/api/posts'
import { UploadResult } from '@/utils/fileUpload'
import FileUpload from '@/components/admin/FileUpload'
import HtmlEditor from '@/components/admin/HtmlEditor'

const CATEGORIES = [
  { id: 'news', name: '뉴스' },
  { id: 'updates', name: '소식' },
  { id: 'scholarship-info', name: '장학정보' },
  { id: 'resources', name: '자료실' },
  { id: 'notices', name: '공지사항' },
  { id: 'contest', name: '공모전 정보' },
  { id: 'activities', name: '교육/활동/취업 정보' },
]

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [post, setPost] = useState<PostDetail | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    categoryId: 'news',
    thumbnailUrl: '',
    contentHtml: '',
  })
  const [files, setFiles] = useState<UploadResult[]>([])

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string)
    }
  }, [params.id])

  const fetchPost = async (id: string) => {
    try {
      setInitialLoading(true)
      const postData = await postsApi.getPost(id)
      setPost(postData)
      setFormData({
        title: postData.title,
        categoryId: postData.categoryId,
        thumbnailUrl: postData.thumbnailUrl || '',
        contentHtml: postData.contentHtml,
      })

      // 기존 파일들을 UploadResult 형태로 변환
      const existingFiles: UploadResult[] = postData.files.map(file => ({
        fileKey: file.id, // 임시로 id를 fileKey로 사용
        fileUrl: file.downloadUrl,
        originalName: file.originalName,
        fileSize: file.fileSize,
        mimeType: 'application/octet-stream', // 기본값
      }))
      setFiles(existingFiles)
    } catch (error) {
      console.error('Failed to fetch post:', error)
      alert('게시글을 불러올 수 없습니다.')
      router.push('/admin/posts')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    if (!formData.contentHtml.trim()) {
      alert('내용을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const postData: UpdatePostRequest = {
        title: formData.title,
        categoryId: formData.categoryId,
        contentHtml: formData.contentHtml,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        files: files.map(file => ({
          fileKey: file.fileKey,
          originalName: file.originalName,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
        })),
      }

      await postsApi.updatePost(params.id as string, postData)
      alert('게시글이 수정되었습니다.')
      router.push('/admin/posts')
    } catch (error) {
      console.error('Failed to update post:', error)
      alert('게시글 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return <div className="flex justify-center py-8">로딩 중...</div>
  }

  if (!post) {
    return <div className="text-center py-8">게시글을 찾을 수 없습니다.</div>
  }

  return (
    <div className="w-full max-w-full px-4 sm:px-6 py-8 overflow-x-hidden">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/posts"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-caption-14 hover:bg-gray-200"
        >
          ← 목록으로
        </Link>
        <h1 className="font-heading-32 text-text">게시글 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 */}
        <div className="bg-white border border-surface rounded-lg p-8 space-y-6">
          <h2 className="font-heading-24 text-text">기본 정보</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-16-medium text-text mb-3">
                카테고리 *
              </label>
              <select
                value={formData.categoryId}
                onChange={e =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full px-4 py-3 border border-surface rounded-md font-body-16-regular"
              >
                {CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-body-16-medium text-text mb-3">
                썸네일 URL
              </label>
              <input
                type="url"
                value={formData.thumbnailUrl}
                onChange={e =>
                  setFormData({ ...formData, thumbnailUrl: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-surface rounded-md font-body-16-regular"
              />
              <div className="font-caption-12 text-text-light mt-2">
                게시글 목록에 표시될 썸네일 이미지 URL (선택사항)
              </div>
            </div>
          </div>

          <div>
            <label className="block font-body-16-medium text-text mb-3">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="게시글 제목을 입력하세요"
              className="w-full px-4 py-3 border border-surface rounded-md font-body-18-regular"
              required
            />
          </div>
        </div>

        {/* 내용 */}
        <div className="bg-white border border-surface rounded-lg p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading-24 text-text">내용</h2>
            <div className="font-caption-12 text-text-light">
              에디터를 사용하여 내용을 작성하세요
            </div>
          </div>

          <div>
            <HtmlEditor
              value={formData.contentHtml}
              onChange={value =>
                setFormData({ ...formData, contentHtml: value })
              }
              placeholder="게시글 내용을 입력하세요"
              height={500}
            />
          </div>
        </div>

        {/* 파일 첨부 */}
        <div className="bg-white border border-surface rounded-lg p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading-24 text-text">파일 첨부</h2>
            <div className="font-caption-12 text-text-light">
              최대 5개, 10MB 이하의 파일을 첨부할 수 있습니다
            </div>
          </div>
          <FileUpload
            onFilesChange={setFiles}
            maxFiles={5}
            maxSize={10 * 1024 * 1024}
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-4 justify-end pt-4">
          <Link
            href="/admin/posts"
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-md font-body-16-medium hover:bg-gray-200"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-pri-500 text-white rounded-md font-body-16-medium hover:bg-pri-600 disabled:opacity-50"
          >
            {loading ? '수정 중...' : '게시글 수정'}
          </button>
        </div>
      </form>
    </div>
  )
}
