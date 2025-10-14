import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { postsApi, CreatePostRequest, UpdatePostRequest, Post } from '@/lib/api/posts'
import { UploadResult } from '@/utils/fileUpload'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import FileUpload from '@/components/admin/FileUpload'
import HtmlEditor from '@/components/admin/HtmlEditor'
import Button from '@/components/common/Button'
import Dropdown from '@/components/common/Dropdown'
import Input from '@/components/common/Input'
import Label from '@/components/common/Label'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import SubTitle from '@/components/common/title/SubTitle'
import ExitWarningModal from '@/components/common/ExitWarningModal'
import { useAlert } from '@/hooks/useAlert'
import { getCategoryOptions } from '@/config/categoryConfig'

const CATEGORIES = getCategoryOptions()

export default function AdminPostsCreatePage() {
  const navigate = useNavigate()
  const params = useParams()
  const isEdit = !!params.id
  const alert = useAlert()

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [post, setPost] = useState<Post | null>(null)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [showTitle, setShowTitle] = useState(true)
  const [thumbnailFileName, setThumbnailFileName] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    categoryId: 'announcements',
    contentHtml: '',
  })
  const [files, setFiles] = useState<UploadResult[]>([])
  const [getEditorImageFileKeys, setGetEditorImageFileKeys] = useState<
    (() => string[]) | null
  >(null)

  useEffect(() => {
    if (isEdit && params.id) {
      fetchPost(params.id)
    }
  }, [isEdit, params.id])

  const fetchPost = async (id: string) => {
    try {
      setInitialLoading(true)
      const postData = await postsApi.getPostById(id)
      setPost(postData)
      setFormData({
        title: postData.title,
        categoryId: postData.categorySlug,
        contentHtml: postData.contentHtml,
      })
      setIsPublic(postData.status === 'public')
      if (postData.thumbnailUrl) {
        setThumbnailFileName('기존 썸네일')
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
      alert.error('게시글 정보를 불러올 수 없습니다.')
      navigate('/admin/posts')
    } finally {
      setInitialLoading(false)
    }
  }

  const {
    imageUrl: thumbnailUrl,
    uploading: thumbnailUploading,
    handleImageChange: handleThumbnailChange,
  } = useImageUpload({
    onError: (error) => {
      alert.error('썸네일 업로드 중 오류가 발생했습니다.')
    },
    onSuccess: (result, file) => {
      setThumbnailFileName(file.name)
    }
  })

  // Check if there are unsaved changes
  const hasChanges = !!(formData.title.trim() || formData.contentHtml.trim() || files.length > 0 || thumbnailUrl)

  const {
    showExitModal,
    handleExit,
    confirmExit,
    cancelExit,
    saveDraftAndExit,
  } = useUnsavedChanges({
    hasChanges,
    onSaveDraft: async () => {
      if (formData.title.trim()) {
        await handleSubmit(true)
      }
    }
  })

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    setShowTitle(scrollTop < 50)
  }

  const handlePublish = () => {
    if (!formData.title.trim()) {
      alert.error('제목을 입력해주세요.')
      return
    }
    setShowPublishModal(true)
  }

  const handleDraftSave = () => {
    if (!formData.title.trim()) {
      alert.error('제목을 입력해주세요.')
      return
    }
    handleSubmit(true)
  }

  const handleSubmit = async (isDraft = false) => {
    if (formData.categoryId === 'department-news' && !thumbnailUrl && !post?.thumbnailUrl) {
      alert.error('뉴스 카테고리는 썸네일 이미지가 필수입니다.')
      return
    }
    
    setLoading(true)

    try {
      const editorImageFileKeys = getEditorImageFileKeys && typeof getEditorImageFileKeys === 'function' 
        ? getEditorImageFileKeys() 
        : []
      const allFiles = [
        ...files.map(file => ({
          fileKey: file.fileKey,
          originalName: file.originalName,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
        })),
        ...editorImageFileKeys.map(fileKey => ({
          fileKey,
          originalName: 'editor-image',
          fileSize: 0,
          mimeType: 'image/*',
        })),
      ]

      if (isEdit && params.id) {
        const postData: UpdatePostRequest = {
          title: formData.title,
          contentHtml: formData.contentHtml,
          category: formData.categoryId,
          status: isDraft ? 'draft' : isPublic ? 'public' : 'private',
          thumbnailUrl: thumbnailUrl || post?.thumbnailUrl || undefined,
          files: allFiles,
        }

        await postsApi.updatePost(params.id, postData)
        alert.success(isDraft ? '임시저장 되었습니다.' : '게시글이 수정되었습니다.')
      } else {
        const postData: CreatePostRequest = {
          title: formData.title,
          contentHtml: formData.contentHtml,
          category: formData.categoryId,
          status: isDraft ? 'draft' : isPublic ? 'public' : 'private',
          thumbnailUrl: thumbnailUrl || null,
          files: allFiles,
        }

        await postsApi.createPost(postData)
        alert.success(isDraft ? '임시저장 되었습니다.' : '게시글이 생성되었습니다.')
      }
      navigate('/admin/posts')
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'create'} post:`, error)
      alert.error(`게시글 ${isEdit ? '수정' : '생성'} 중 오류가 발생했습니다.`)
    } finally {
      setLoading(false)
      setShowPublishModal(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button 
            variant="delete" 
            size="md" 
            radius="md"
            onClick={() => handleExit(() => navigate('/admin/posts'))}
          >
            나가기
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="md"
            variant="cancel"
            radius="md"
            onClick={handleDraftSave}
            disabled={loading}
          >
            임시저장
          </Button>
          <Button size="md" variant="info" radius="md" onClick={handlePublish}>
            출간하기
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-full p-6 lg:w-1/2 flex flex-col overflow-hidden">
          <div
            className={`border-b flex-shrink-0 transition-all duration-300 ${
              showTitle
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-full pointer-events-none'
            }`}
            style={{
              height: showTitle ? 'auto' : '0px',
              overflow: showTitle ? 'visible' : 'hidden'
            }}
          >
            <Input
              className="w-full"
              size="lg"
              type="text"
              value={formData.title}
              onChange={value => setFormData(prev => ({ ...prev, title: value }))}
              placeholder="제목을 입력하세요"
            />
            <div className="w-24 h-2 my-4 bg-point-1"></div>
          </div>

          <div className="flex-1 overflow-hidden">
            <HtmlEditor
              value={formData.contentHtml}
              onChange={value =>
                setFormData(prev => ({ ...prev, contentHtml: value }))
              }
              onScroll={handleScroll}
              height="100%"
              showToolbar={true}
              onGetImageFileKeys={setGetEditorImageFileKeys}
              ownerData={{ ownerType: 'post', ownerId: params.id || 'temp' }}
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
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-8">
              {/* 썸네일 영역 - 뉴스 카테고리인 경우에만 표시 */}
              {formData.categoryId === 'department-news' && (
                <div className="flex-1">
                  <div className="mb-4">
                    <div className="border rounded-lg overflow-hidden">
                      {thumbnailUrl || post?.thumbnailUrl ? (
                        <img
                          src={thumbnailUrl || post?.thumbnailUrl}
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
                    value={thumbnailFileName}
                    onChange={() => {}}
                    onFileChange={handleThumbnailChange}
                  />
                  {thumbnailUploading && <LoadingSpinner size="sm" />}
                </div>
              )}

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
                    ownerType="post"
                    ownerId={params.id || 'temp'}
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
                onClick={() => handleSubmit(false)}
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="md" /> : '출간하기'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ExitWarningModal
        isOpen={showExitModal}
        onClose={cancelExit}
        onConfirmExit={confirmExit}
        onSaveDraft={saveDraftAndExit}
        showDraftOption={true}
      />
    </div>
  )
}
