import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { postsApi, UpdatePostRequest, PostDetail } from '@/lib/api/posts'
import { UploadResult } from '@/utils/fileUpload'
import { useImageUpload } from '@/hooks/useImageUpload'
import FileUpload from '@/components/admin/FileUpload'
import HtmlEditor from '@/components/admin/HtmlEditor'
import Button from '@/components/common/Button'
import Dropdown from '@/components/common/Dropdown'
import Input from '@/components/common/Input'
import Label from '@/components/common/Label'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import SubTitle from '@/components/common/SubTitle'
import { useAlert } from '@/hooks/useAlert'

const CATEGORIES = [
  { value: 'news', label: '뉴스' },
  { value: 'updates', label: '소식' },
  { value: 'scholarship-infos', label: '장학정보' },
  { value: 'resources', label: '자료실' },
  { value: 'notices', label: '공지사항' },
  { value: 'contests', label: '공모전 정보' },
  { value: 'activities', label: '교육/활동/취업 정보' },
]

export default function AdminPostsEditPage() {
  const params = useParams()
  const navigate = useNavigate()
  const alert = useAlert()

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    categoryId: 'news',
    contentHtml: '',
  })
  const [files, setFiles] = useState<UploadResult[]>([])

  const {
    imageUrl: thumbnailUrl,
    uploading: thumbnailUploading,
    handleImageChange: handleThumbnailChange,
  } = useImageUpload({
    onError: error => {
      alert.error('썸네일 업로드 중 오류가 발생했습니다.')
    },
  })

  useEffect(() => {
    if (params.id) {
      loadPost()
    }
  }, [params.id])

  const loadPost = async () => {
    try {
      setInitialLoading(true)
      const post = await postsApi.getPost(params.id as string)
      setFormData({
        title: post.title,
        categoryId:
          CATEGORIES.find(cat => cat.label === post.categoryName)?.value ||
          'news',
        contentHtml: post.contentHtml,
      })
      setIsPublic(post.status === 'public')
    } catch (error) {
      console.error('Failed to load post:', error)
      alert.error('게시글 정보를 불러올 수 없습니다.')
      navigate('/admin/posts')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (isDraft = false) => {
    setLoading(true)

    try {
      const postData: UpdatePostRequest = {
        title: formData.title,
        contentHtml: formData.contentHtml,
        categoryName:
          CATEGORIES.find(cat => cat.value === formData.categoryId)?.label ||
          '뉴스',
        status: isDraft ? 'draft' : isPublic ? 'public' : 'private',
        thumbnailUrl: thumbnailUrl || null,
        files: files.map(file => ({
          fileKey: file.fileKey,
          originalName: file.originalName,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
        })),
      }

      await postsApi.updatePost(params.id as string, postData)
      alert.success(
        isDraft ? '임시저장 되었습니다.' : '게시글이 수정되었습니다.'
      )
      navigate('/admin/posts')
    } catch (error) {
      console.error('Failed to update post:', error)
      alert.error('게시글 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
      setShowPublishModal(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/admin/posts">
            <Button variant="delete" size="md" radius="md">
              나가기
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="md"
            variant="cancel"
            radius="md"
            onClick={() => handleSubmit(true)}
            disabled={loading}
          >
            임시저장
          </Button>
          <Button
            size="md"
            variant="info"
            radius="md"
            onClick={() => setShowPublishModal(true)}
          >
            수정하기
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-full p-6 lg:w-1/2 flex flex-col overflow-hidden">
          <div className="border-b flex-shrink-0 mb-4">
            <Input
              className="w-full"
              size="lg"
              type="text"
              value={formData.title}
              onChange={value =>
                setFormData(prev => ({ ...prev, title: value }))
              }
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <HtmlEditor
              value={formData.contentHtml}
              onChange={value =>
                setFormData(prev => ({ ...prev, contentHtml: value }))
              }
              height="100%"
              showToolbar={true}
            />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="hidden lg:block w-1/2 bg-gray-50 overflow-hidden">
          <div className="h-full overflow-auto p-6">
            <div className="bg-gray-100 bg-opacity-70 h-full rounded-lg p-6">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: formData.contentHtml }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <SubTitle>게시글 설정</SubTitle>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-8">
              <div className="flex-1">
                <div className="mb-4">
                  <div className="border rounded-lg overflow-hidden">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt="썸네일"
                        className="w-full aspect-[4/3] object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-[4/3] bg-gray-200 flex items-center justify-center">
                        <PhotoIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                <Label className="mb-2" required={true}>
                  썸네일 이미지
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  onFileChange={handleThumbnailChange}
                />
                {thumbnailUploading && <LoadingSpinner size="sm" />}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <Label className="mb-2" required={true}>
                    공개 여부
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={isPublic ? 'info' : 'unstyled'}
                      radius="full"
                      onClick={() => setIsPublic(true)}
                    >
                      전체 공개
                    </Button>
                    <Button
                      size="sm"
                      variant={!isPublic ? 'info' : 'unstyled'}
                      radius="full"
                      onClick={() => setIsPublic(false)}
                    >
                      비공개
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="mb-2" required={true}>
                    카테고리 설정
                  </Label>
                  <Dropdown
                    options={CATEGORIES}
                    value={formData.categoryId}
                    onChange={value =>
                      setFormData({ ...formData, categoryId: value })
                    }
                    size="md"
                    placeholder="카테고리 선택"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="mb-2" optional={true}>
                    파일 등록
                  </Label>
                  <FileUpload
                    onFilesChange={setFiles}
                    maxFiles={5}
                    maxSize={10 * 1024 * 1024}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button
                size="md"
                variant="cancel"
                radius="md"
                onClick={() => setShowPublishModal(false)}
              >
                취소
              </Button>
              <Button
                size="md"
                variant="info"
                radius="md"
                onClick={() => handleSubmit()}
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="md" /> : '수정하기'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
