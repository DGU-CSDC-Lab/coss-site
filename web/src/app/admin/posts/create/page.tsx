'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { postsApi, CreatePostRequest } from '@/lib/api/posts'
import { UploadResult, uploadImage } from '@/utils/fileUpload'
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

export default function CreatePostPage() {
  // Router
  const router = useRouter()

  // Custom Alert Components
  const alert = useAlert()

  const [loading, setLoading] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [showTitle, setShowTitle] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    categoryId: 'news',
    contentHtml: '',
  })
  const [files, setFiles] = useState<UploadResult[]>([])
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const [getEditorImageFileKeys, setGetEditorImageFileKeys] = useState<
    (() => string[]) | null
  >(null)

  // 스크롤 이벤트 핸들러
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    setShowTitle(scrollTop < 100) // 100px 이상 스크롤하면 제목 숨김
  }

  // 페이지 로드 시 localStorage에서 데이터 복원
  useEffect(() => {
    const savedData = localStorage.getItem('draft-post')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.formData) {
          setFormData(parsed.formData)
        }
        if (parsed.files) {
          setFiles(parsed.files)
        }
        if (parsed.thumbnailUrl) {
          setThumbnailUrl(parsed.thumbnailUrl)
        }
        if (parsed.isPublic !== undefined) {
          setIsPublic(parsed.isPublic)
        }
        console.log('Draft restored:', parsed)
      } catch (error) {
        console.error('Failed to restore draft:', error)
      }
    }
  }, []) // 빈 배열로 한 번만 실행

  // 데이터 변경 시 localStorage에 자동 저장 (디바운싱 적용)
  useEffect(() => {
    const timer = setTimeout(() => {
      const draftData = {
        formData,
        files,
        thumbnailUrl,
        isPublic,
        lastSaved: new Date().toISOString(),
      }
      localStorage.setItem('draft-post', JSON.stringify(draftData))
      console.log('Draft saved:', draftData)
    }, 500) // 500ms 지연

    return () => clearTimeout(timer)
  }, [formData, files, thumbnailUrl, isPublic])

  // 썸네일 이미지 변경 함수
  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setThumbnailUrl(URL.createObjectURL(file))
    setThumbnailUploading(true)

    try {
      const result = await uploadImage(file)
      setThumbnailUrl(result.fileUrl)
    } catch (error) {
      console.error('Thumbnail upload failed:', error)
      alert.error('썸네일 업로드 중 오류가 발생했습니다.')
    } finally {
      setThumbnailUploading(false)
    }
  }

  // 출간하기 버튼 클릭
  const handlePublish = () => {
    if (!formData.title.trim() || formData.title === '') {
      alert.error('제목을 입력해주세요.')
      return
    }
    setShowPublishModal(true)
  }

  // 임시 저장 버튼 클릭
  const handleDraftSave = () => {
    if (!formData.title.trim() || formData.title === '') {
      alert.error('제목을 입력해주세요.')
      return
    }

    handleSubmit(true)
  }

  // Create, Update Post 메서드
  const handleSubmit = async (isDraft = false) => {
    setLoading(true) // 로딩 시작

    try {
      // 에디터 내 이미지 파일키 수집
      const editorImageFileKeys = getEditorImageFileKeys
        ? getEditorImageFileKeys()
        : []

      // 모든 파일 정보 합치기 (첨부파일 + 에디터 이미지)
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

      // 게시글 생성 데이터 준비
      const postData: CreatePostRequest = {
        title: formData.title,
        contentHtml: formData.contentHtml,
        categoryName:
          CATEGORIES.find(cat => cat.value === formData.categoryId)?.label ||
          '뉴스',
        status: isDraft ? 'draft' : isPublic ? 'public' : 'private',
        thumbnailUrl: thumbnailUrl || null,
        files: allFiles,
      }

      // postsApi 사용하여 게시글 생성 (파일 완료 처리 포함)
      await postsApi.createPost(postData)

      // 성공 시 임시저장 데이터 삭제
      localStorage.removeItem('draft-post')

      // 성공 알림 및 목록 페이지로 이동
      alert.success(
        isDraft ? '임시저장 되었습니다.' : '게시글이 생성되었습니다.'
      )
      router.push('/admin/posts')
    } catch (error) {
      console.error('Failed to create post:', error)
      alert.error(`게시글 생성 중 오류가 발생했습니다. \n${error}`)
    } finally {
      // 로딩, 출간 모달 해제
      setLoading(false)
      setShowPublishModal(false)
    }
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
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
          {/* Title Input - Fixed */}
          <div
            className={`border-b flex-shrink-0 transition-all duration-300 ${
              showTitle
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-full absolute z-10 pointer-events-none'
            }`}
          >
            <Input
              className="w-full"
              size="lg"
              type="text"
              value={formData.title}
              onChange={value => setFormData({ ...formData, title: value })}
              placeholder="제목을 입력하세요"
            />
            <div className="w-24 h-2 my-4 bg-point-1"></div>
          </div>

          {/* Content Editor */}
          <div className="flex-1 overflow-hidden">
            <HtmlEditor
              value={formData.contentHtml}
              onChange={value =>
                setFormData({ ...formData, contentHtml: value })
              }
              onScroll={handleScroll}
              height="100%"
              showToolbar={true}
              onGetImageFileKeys={setGetEditorImageFileKeys}
            />
          </div>
        </div>

        {/* Right Panel - Preview with independent scroll */}
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
              {/* Left Side - Thumbnail Preview */}
              <div className="flex-1">
                <div className="mb-4">
                  <div className="border rounded-lg overflow-hidden">
                    {thumbnailUrl ? (
                      <Image
                        src={thumbnailUrl}
                        alt="썸네일"
                        width={400}
                        height={300}
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

              {/* Right Side - Settings */}
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

            {/* Actions */}
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
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="md" /> : '출간하기'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
