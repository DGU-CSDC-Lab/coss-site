'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { facultyApi, CreateFacultyRequest } from '@/lib/api/faculty'
import { uploadImage } from '@/utils/fileUpload'
import Button from '@/components/common/Button'
import Title from '@/components/common/Title'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'

export default function CreateFacultyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    office: '',
    bio: '',
    research: '',
    education: '',
  })
  const [profileImageUrl, setProfileImageUrl] = useState<string>('')
  const [imageUploading, setImageUploading] = useState(false)

  const positionOptions = [
    { value: '', label: '직책 선택' },
    { value: '교수', label: '교수' },
    { value: '부교수', label: '부교수' },
    { value: '조교수', label: '조교수' },
    { value: '겸임교수', label: '겸임교수' },
    { value: '초빙교수', label: '초빙교수' },
  ]

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setProfileImageFile(file)
    setImageUploading(true)

    try {
      const result = await uploadImage(file)
      setProfileImageUrl(result.fileUrl)
    } catch (error) {
      console.error('Image upload failed:', error)
      alert('이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('이름을 입력해주세요.')
      return
    }

    if (!formData.position.trim()) {
      alert('직책을 입력해주세요.')
      return
    }

    if (!formData.email.trim()) {
      alert('이메일을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const facultyData: CreateFacultyRequest = {
        name: formData.name,
        position: formData.position,
        email: formData.email,
        phone: formData.phone || undefined,
        office: formData.office || undefined,
        profileImage: profileImageUrl || undefined,
        bio: formData.bio || undefined,
        research: formData.research || undefined,
        education: formData.education || undefined,
      }

      await facultyApi.createFacultyMember(facultyData)
      alert('교원이 생성되었습니다.')
      router.push('/admin/faculty')
    } catch (error) {
      console.error('Failed to create faculty:', error)
      alert('교원 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Title>새 교원 추가</Title>
        <Link href="/admin/faculty">
          <Button variant="secondary">목록보기</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <h2 className="font-body-18-medium text-gray-900">기본 정보</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                이름 *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="교원 이름을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                직책 *
              </label>
              <Dropdown
                options={positionOptions}
                value={formData.position}
                onChange={value => setFormData({ ...formData, position: value })}
                placeholder="직책 선택"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                이메일 *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="이메일을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                전화번호
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="전화번호를 입력하세요"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                연구실
              </label>
              <Input
                type="text"
                value={formData.office}
                onChange={e => setFormData({ ...formData, office: e.target.value })}
                placeholder="연구실을 입력하세요"
              />
            </div>

            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                프로필 이미지
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
              />
              {imageUploading && (
                <p className="mt-2 font-caption-14 text-gray-600">업로드 중...</p>
              )}
              {profileImageUrl && (
                <p className="mt-2 font-caption-14 text-gray-600">업로드 완료</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-body-18-medium text-gray-900">상세 정보</h2>

          <div>
            <label className="block font-body-18-medium text-gray-900 mb-3">
              소개
            </label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="교원 소개를 입력하세요"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900 resize-vertical"
            />
          </div>

          <div>
            <label className="block font-body-18-medium text-gray-900 mb-3">
              연구 분야
            </label>
            <textarea
              value={formData.research}
              onChange={e => setFormData({ ...formData, research: e.target.value })}
              placeholder="연구 분야를 입력하세요"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900 resize-vertical"
            />
          </div>

          <div>
            <label className="block font-body-18-medium text-gray-900 mb-3">
              학력
            </label>
            <textarea
              value={formData.education}
              onChange={e => setFormData({ ...formData, education: e.target.value })}
              placeholder="학력을 입력하세요"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900 resize-vertical"
            />
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-4">
          <Link href="/admin/faculty">
            <Button variant="secondary">취소</Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? '생성 중...' : '교원 생성'}
          </Button>
        </div>
      </form>
    </div>
  )
}
