import { useState } from 'react'
import { PhotoIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { facultyApi, CreateFacultyRequest } from '@/lib/api/faculty'
import { useImageUpload } from '@/hooks/useImageUpload'
import Button from '@/components/common/Button'
import Title from '@/components/common/title/Title'
import Input from '@/components/common/Input'
import Textarea from '@/components/common/Textarea'
import Dropdown from '@/components/common/Dropdown'
import Label from '@/components/common/Label'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import { useAlert } from '@/hooks/useAlert'

export default function AdminFacultyCreatePage() {
  const navigate = useNavigate()
  const alert = useAlert()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    department: '',
    email: '',
    phoneNumber: '',
    office: '',
    biography: '',
    researchAreas: '',
  })

  const {
    imageUrl: profileImageUrl,
    uploading: imageUploading,
    fileName: imageFileName,
    fileKey: imageFileKey,
    handleImageChange,
  } = useImageUpload({
    ownerType: 'FACULTY',
    ownerId: 'temp',
    onError: (error) => {
      console.error('Image upload failed:', error)
    }
  })

  const positionOptions = [
    { value: '직책 선택', label: '직책 선택' },
    { value: '교수', label: '교수' },
    { value: '부교수', label: '부교수' },
    { value: '조교수', label: '조교수' },
    { value: '겸임교수', label: '겸임교수' },
    { value: '초빙교수', label: '초빙교수' },
  ]

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '')
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`
    if (numbers.length <= 10)
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert.error('이름을 입력해주세요.')
      return
    }

    if (!formData.jobTitle.trim()) {
      alert.error('직책을 입력해주세요.')
      return
    }

    if (!formData.email.trim()) {
      alert.error('이메일을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const facultyData: CreateFacultyRequest = {
        name: formData.name,
        jobTitle: formData.jobTitle,
        department: formData.department,
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        office: formData.office || undefined,
        profileImageUrl: profileImageUrl || undefined,
        biography: formData.biography || undefined,
        researchAreas: formData.researchAreas
          ? formData.researchAreas.split(',').map(area => area.trim())
          : undefined,
      }

      await facultyApi.createFaculty(facultyData)
      alert.success('교원이 생성되었습니다.')
      navigate('/admin/faculty')
    } catch (error) {
      console.error('Failed to create faculty:', error)
      alert.error(
        `교원 생성 중 오류가 발생했습니다. \n ${error instanceof Error ? error.message : ''}`
      )
    } finally {
      setLoading(false)
    }
  }

  const handleButtonSubmit = () => {
    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex items-center justify-between gap-4 p-6">
        <Title>새 교원 추가</Title>
        <Link to="/admin/faculty">
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
                  이름
                </Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={value => setFormData({ ...formData, name: value })}
                  placeholder="교원 이름을 입력하세요"
                  className="w-full"
                  size="lg"
                />
              </div>

              <div>
                <Label required={true} className="mb-2">
                  직책
                </Label>
                <Dropdown
                  options={positionOptions}
                  value={formData.jobTitle}
                  onChange={value =>
                    setFormData({ ...formData, jobTitle: value })
                  }
                  placeholder="직책을 선택해주세요."
                  size="lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label required={true} className="mb-2">
                  학과
                </Label>
                <Input
                  type="text"
                  value={formData.department}
                  onChange={value =>
                    setFormData({ ...formData, department: value })
                  }
                  placeholder="학과를 입력하세요"
                  className="w-full"
                  size="lg"
                />
              </div>
              <div>
                <Label required={true} className="mb-2">
                  이메일
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={value => setFormData({ ...formData, email: value })}
                  placeholder="이메일을 입력하세요"
                  className="w-full"
                  size="lg"
                />
              </div>

              <div>
                <Label className="mb-2" optional={true}>
                  전화번호
                </Label>
                <Input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={value => {
                    const formatted = formatPhoneNumber(value)
                    setFormData({ ...formData, phoneNumber: formatted })
                  }}
                  placeholder="전화번호를 입력하세요"
                  className="w-full"
                  size="lg"
                />
              </div>
              <div>
                <Label className="mb-2" optional={true}>
                  연구실
                </Label>
                <Input
                  type="text"
                  value={formData.office}
                  onChange={value =>
                    setFormData({ ...formData, office: value })
                  }
                  placeholder="연구실을 입력하세요"
                  className="w-full"
                  size="lg"
                />
              </div>

              <div>
                <Label className="mb-2" optional={true}>
                  연구 분야
                </Label>
                <Input
                  type="text"
                  value={formData.researchAreas}
                  onChange={value =>
                    setFormData({ ...formData, researchAreas: value })
                  }
                  placeholder="연구 분야를 쉼표로 구분하여 입력하세요"
                  className="w-full"
                  size="lg"
                />
              </div>

              <div>
                <Label className="mb-2" optional={true}>
                  프로필 이미지
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  onFileChange={handleImageChange}
                  value={imageFileName}
                  size="lg"
                />
                {imageUploading && <LoadingSpinner size="md" />}
                <div className="mt-4">
                  <div className="w-48 aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt="프로필 미리보기"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PhotoIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label className="mb-2" optional={true}>
                  소개
                </Label>
                <Textarea
                  value={formData.biography}
                  onChange={value =>
                    setFormData({ ...formData, biography: value })
                  }
                  placeholder="교원 소개를 입력하세요"
                  rows={4}
                  size="lg"
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="flex gap-4 justify-end p-6 bg-white flex-shrink-0">
        <Link to="/admin/faculty">
          <Button variant="cancel" size="lg" radius="md">
            취소
          </Button>
        </Link>
        <Button
          onClick={handleButtonSubmit}
          variant="info"
          size="lg"
          radius="md"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="md" /> : '교원 생성'}
        </Button>
      </div>
    </div>
  )
}
