'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { facultyApi, Faculty, UpdateFacultyRequest } from '@/lib/api/faculty'
import { uploadImage } from '@/utils/fileUpload'
import Title from '@/components/common/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function EditFacultyPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [faculty, setFaculty] = useState<Faculty | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    office: '',
    profileImage: '',
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

  useEffect(() => {
    if (params.id) {
      fetchFaculty(params.id as string)
    }
  }, [params.id])

  const fetchFaculty = async (id: string) => {
    try {
      setInitialLoading(true)
      const facultyData = await facultyApi.getFacultyById(id)
      setFaculty(facultyData)
      setFormData({
        name: facultyData.name,
        position: facultyData.jobTitle,
        department: facultyData.department || '',
        email: facultyData.email || '',
        phone: facultyData.phoneNumber || '',
        office: facultyData.office || '',
        profileImage: facultyData.profileImage || '',
        bio: Array.isArray(facultyData.biography)
          ? facultyData.biography.join(', ')
          : facultyData.biography || '',
        research: Array.isArray(facultyData.researchAreas)
          ? facultyData.researchAreas.join(', ')
          : facultyData.researchAreas || '',
        education: Array.isArray(facultyData.biography)
          ? facultyData.biography.join(', ')
          : facultyData.biography || '',
      })
      setProfileImageUrl(facultyData.profileImage || '')
    } catch (error) {
      console.error('Failed to fetch faculty:', error)
      alert('교원 정보를 불러올 수 없습니다.')
      router.push('/admin/faculty')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
      const facultyData: UpdateFacultyRequest = {
        name: formData.name,
        jobTitle: formData.position,
        department: formData.department,
        email: formData.email,
        phoneNumber: formData.phone || undefined,
        office: formData.office || undefined,
        profileImageUrl: profileImageUrl || undefined,
        biography: formData.bio || undefined,
        researchAreas: formData.research ? [formData.research] : undefined,
      }

      await facultyApi.updateFaculty(params.id as string, facultyData)
      alert('교원 정보가 수정되었습니다.')
      router.push('/admin/faculty')
    } catch (error) {
      console.error('Failed to update faculty:', error)
      alert('교원 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="w-full">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!faculty) {
    return (
      <div className="w-full">
        <div className="text-center py-8 font-caption-14 text-gray-600">
          교원을 찾을 수 없습니다.
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/faculty">
          <Button variant="cancel" size="sm">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </Link>
        <Title>교원 수정</Title>
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
                onChange={value =>
                  setFormData({ ...formData, name: value })
                }
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
                onChange={value =>
                  setFormData({ ...formData, position: value })
                }
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
                onChange={value =>
                  setFormData({ ...formData, email: value })
                }
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
                onChange={value =>
                  setFormData({ ...formData, phone: value })
                }
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
                onChange={value =>
                  setFormData({ ...formData, office: value })
                }
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
                <p className="mt-2 font-caption-14 text-gray-600">
                  업로드 중...
                </p>
              )}
              {profileImageUrl && (
                <p className="mt-2 font-caption-14 text-gray-600">
                  업로드 완료
                </p>
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
              onChange={e =>
                setFormData({ ...formData, research: e.target.value })
              }
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
              onChange={e =>
                setFormData({ ...formData, education: e.target.value })
              }
              placeholder="학력을 입력하세요"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900 resize-vertical"
            />
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-4">
          <Link href="/admin/faculty">
            <Button variant="cancel">취소</Button>
          </Link>
          <Button type="submit" variant="info" disabled={loading}>
            {loading ? '수정 중...' : '교원 수정'}
          </Button>
        </div>
      </form>
    </div>
  )
}
