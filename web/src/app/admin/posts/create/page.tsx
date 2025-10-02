'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { postsApi, CreatePostRequest } from '@/lib/api/posts'
import { UploadResult, uploadImage } from '@/utils/fileUpload'
import FileUpload from '@/components/admin/FileUpload'
import HtmlEditor from '@/components/admin/HtmlEditor'
import Button from '@/components/common/Button'
import Title from '@/components/common/Title'
import Dropdown from '@/components/common/Dropdown'
import Input from '@/components/common/Input'

const CATEGORIES = [
  { value: 'news', label: '뉴스' },
  { value: 'updates', label: '소식' },
  { value: 'scholarship-info', label: '장학정보' },
  { value: 'resources', label: '자료실' },
  { value: 'notices', label: '공지사항' },
  { value: 'contest', label: '공모전 정보' },
  { value: 'activities', label: '교육/활동/취업 정보' },
]

export default function CreatePostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    categoryId: 'news',
    contentHtml: '',
  })
  const [files, setFiles] = useState<UploadResult[]>([])
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const [thumbnailUploading, setThumbnailUploading] = useState(false)

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setThumbnailFile(file)
    setThumbnailUploading(true)

    try {
      const result = await uploadImage(file)
      setThumbnailUrl(result.fileUrl)
    } catch (error) {
      console.error('Thumbnail upload failed:', error)
      alert('썸네일 업로드 중 오류가 발생했습니다.')
    } finally {
      setThumbnailUploading(false)
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
      const postData: CreatePostRequest = {
        title: formData.title,
        categoryId: formData.categoryId,
        contentHtml: formData.contentHtml,
        thumbnailUrl: thumbnailUrl || undefined,
        files: files.map(file => ({
          fileKey: file.fileKey,
          originalName: file.originalName,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
        })),
      }

      await postsApi.createPost(postData)
      alert('게시글이 생성되었습니다.')
      router.push('/admin/posts')
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('게시글 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Title className="mb-8">새 게시글 생성</Title>
        <Link href="/admin/posts">
          <Button size="md" variant="info" radius="md">
            목록보기
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 */}
        <div className="">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-16-medium mb-3">
                카테고리 *
              </label>
              <Dropdown
                options={CATEGORIES}
                value={formData.categoryId}
                onChange={value =>
                  setFormData({ ...formData, categoryId: value })
                }
                placeholder="카테고리 선택"
                className="w-full"
              />
            </div>

            <div>
              <label className="block font-body-16-medium text-text mb-3">
                썸네일 이미지
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="w-full px-4 py-3 border border-gray-50 rounded-md font-body-16-regular"
                />
                {thumbnailUploading && (
                  <div className="text-sm text-blue-600">업로드 중...</div>
                )}
                {thumbnailUrl && (
                  <div className="space-y-2">
                    <img
                      src={thumbnailUrl}
                      alt="썸네일 미리보기"
                      className="w-32 h-32 object-cover rounded-md border border-gray-50"
                    />
                    <div className="text-sm text-green-600">업로드 완료</div>
                  </div>
                )}
              </div>
              <div className="font-caption-12 text-text-light mt-2">
                게시글 목록에 표시될 썸네일 이미지 (선택사항)
              </div>
            </div>
          </div>

          <div>
            <label className="block font-body-16-medium text-text mb-3">
              제목 *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={value => setFormData({ ...formData, title: value })}
              placeholder="게시글 제목을 입력하세요"
              required
            />
          </div>
        </div>

        {/* 내용 */}
        <div className="space-y-6">
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
        <div className="space-y-6">
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
            {loading ? '생성 중...' : '게시글 생성'}
          </button>
        </div>
      </form>
    </div>
  )
}
