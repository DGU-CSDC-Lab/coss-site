'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { popupsApi, CreatePopupRequest } from '@/lib/api/popups'
import { useImageUpload } from '@/hooks/useImageUpload'
import Title from '@/components/common/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Textarea from '@/components/common/Textarea'
import Label from '@/components/common/Label'
import Checkbox from '@/components/common/Checkbox'
import { useAlert } from '@/hooks/useAlert'

export default function CreatePopupPage() {
  const router = useRouter()
  const alert = useAlert()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    linkUrl: '',
    startDate: '',
    endDate: '',
    isActive: true,
  })

  const {
    imageUrl,
    uploading: imageUploading,
    handleImageChange,
  } = useImageUpload({
    onError: (error) => {
      alert.error('이미지 업로드 중 오류가 발생했습니다.')
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert.error('제목을 입력해주세요.')
      return
    }

    if (!formData.content.trim()) {
      alert.error('내용을 입력해주세요.')
      return
    }

    if (!formData.startDate) {
      alert.error('시작일을 선택해주세요.')
      return
    }

    if (!formData.endDate) {
      alert.error('종료일을 선택해주세요.')
      return
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert.error('종료일은 시작일보다 늦어야 합니다.')
      return
    }

    setLoading(true)

    try {
      const popupData: CreatePopupRequest = {
        title: formData.title,
        content: formData.content,
        imageUrl: imageUrl || undefined,
        linkUrl: formData.linkUrl || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
      }

      await popupsApi.createPopup(popupData)
      alert.success('팝업이 생성되었습니다.')
      router.push('/admin/popups')
    } catch (error) {
      console.error('Failed to create popup:', error)
      alert.error('팝업 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex items-center justify-between gap-4 p-6">
        <Title>새 팝업 추가</Title>
        <Link href="/admin/popups">
          <Button variant="delete" size="md" radius="md">
            나가기
          </Button>
        </Link>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label required={true} className="mb-2">
                  제목
                </Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={value => setFormData({ ...formData, title: value })}
                  placeholder="팝업 제목을 입력하세요"
                  className="w-full"
                  size="lg"
                  required
                />
              </div>

              <div>
                <Label className="mb-2" optional={true}>
                  링크 URL
                </Label>
                <Input
                  type="url"
                  value={formData.linkUrl}
                  onChange={value => setFormData({ ...formData, linkUrl: value })}
                  placeholder="https://example.com"
                  className="w-full"
                  size="lg"
                />
              </div>
            </div>

            <div>
              <Label required={true} className="mb-2">
                내용
              </Label>
              <Textarea
                value={formData.content}
                onChange={value => setFormData({ ...formData, content: value })}
                placeholder="팝업 내용을 입력하세요"
                rows={6}
                size="lg"
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label required={true} className="mb-2">
                  시작일
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={value => setFormData({ ...formData, startDate: value })}
                  className="w-full"
                  size="lg"
                  required
                />
              </div>

              <div>
                <Label required={true} className="mb-2">
                  종료일
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={value => setFormData({ ...formData, endDate: value })}
                  className="w-full"
                  size="lg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2" optional={true}>
                  이미지
                </Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                />
                {imageUploading && (
                  <p className="mt-2 font-caption-14 text-gray-600">
                    업로드 중...
                  </p>
                )}
                {imageUrl && (
                  <div className="mt-3">
                    <p className="font-caption-14 text-gray-600 mb-2">
                      미리보기:
                    </p>
                    <img
                      src={imageUrl}
                      alt="미리보기"
                      className="w-full max-w-xs h-auto rounded-md border"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center pt-8">
                <Checkbox
                  checked={formData.isActive}
                  onChange={checked => setFormData({ ...formData, isActive: checked })}
                  label="활성화"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Link href="/admin/popups">
              <Button variant="cancel" radius="md" size="md">취소</Button>
            </Link>
            <Button type="submit" variant="info" radius="md" size="md" disabled={loading}>
              {loading ? '생성 중...' : '팝업 생성'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
