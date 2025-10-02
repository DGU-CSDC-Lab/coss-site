'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { coursesApi, CreateCourseRequest } from '@/lib/api/courses'
import Title from '@/components/common/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'

export default function CreateCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    englishName: '',
    code: '',
    department: '지능IoT학과',
    grade: '',
    year: new Date().getFullYear(),
    semester: '1학기',
    instructor: '',
    classroom: '',
    courseType: '',
    credit: 3,
  })

  const semesterOptions = [
    { value: '1학기', label: '1학기' },
    { value: '2학기', label: '2학기' },
    { value: '여름학기', label: '여름학기' },
    { value: '겨울학기', label: '겨울학기' },
  ]

  const gradeOptions = [
    { value: '', label: '학년 선택' },
    { value: '1학년', label: '1학년' },
    { value: '2학년', label: '2학년' },
    { value: '3학년', label: '3학년' },
    { value: '4학년', label: '4학년' },
    { value: '1,2학년', label: '1,2학년' },
    { value: '2,3학년', label: '2,3학년' },
    { value: '3,4학년', label: '3,4학년' },
    { value: '전학년', label: '전학년' },
  ]

  const courseTypeOptions = [
    { value: '', label: '과목유형 선택' },
    { value: '전공필수', label: '전공필수' },
    { value: '전공선택', label: '전공선택' },
    { value: '교양필수', label: '교양필수' },
    { value: '교양선택', label: '교양선택' },
    { value: '공통기초', label: '공통기초' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('과목명을 입력해주세요.')
      return
    }

    if (!formData.code.trim()) {
      alert('학수번호를 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const courseData: CreateCourseRequest = {
        name: formData.name,
        englishName: formData.englishName || undefined,
        code: formData.code,
        department: formData.department,
        grade: formData.grade,
        year: formData.year,
        semester: formData.semester,
        instructor: formData.instructor || undefined,
        classroom: formData.classroom || undefined,
        courseType: formData.courseType || undefined,
        credit: formData.credit,
      }

      await coursesApi.createCourse(courseData)
      alert('과목이 생성되었습니다.')
      router.push('/admin/courses')
    } catch (error) {
      console.error('Failed to create course:', error)
      alert('과목 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/courses">
          <Button variant="secondary" size="sm">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </Link>
        <Title>새 과목 추가</Title>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <h2 className="font-body-18-medium text-gray-900">기본 정보</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                과목명 *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="과목명을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                영문명
              </label>
              <Input
                type="text"
                value={formData.englishName}
                onChange={e => setFormData({ ...formData, englishName: e.target.value })}
                placeholder="영문 과목명을 입력하세요"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                학수번호 *
              </label>
              <Input
                type="text"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="예: IOT101-01"
                required
              />
            </div>

            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                학과
              </label>
              <Input
                type="text"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                placeholder="학과명을 입력하세요"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                년도
              </label>
              <Input
                type="number"
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                min="2000"
                max="2100"
              />
            </div>

            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                학기
              </label>
              <Dropdown
                options={semesterOptions}
                value={formData.semester}
                onChange={value => setFormData({ ...formData, semester: value })}
              />
            </div>

            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                학점
              </label>
              <Input
                type="number"
                value={formData.credit}
                onChange={e => setFormData({ ...formData, credit: parseFloat(e.target.value) || 0 })}
                min="0"
                max="10"
                step="0.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                수강학년
              </label>
              <Dropdown
                options={gradeOptions}
                value={formData.grade}
                onChange={value => setFormData({ ...formData, grade: value })}
                placeholder="학년 선택"
              />
            </div>

            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                과목유형
              </label>
              <Dropdown
                options={courseTypeOptions}
                value={formData.courseType}
                onChange={value => setFormData({ ...formData, courseType: value })}
                placeholder="과목유형 선택"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                담당교수
              </label>
              <Input
                type="text"
                value={formData.instructor}
                onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                placeholder="담당교수명을 입력하세요"
              />
            </div>

            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                강의실
              </label>
              <Input
                type="text"
                value={formData.classroom}
                onChange={e => setFormData({ ...formData, classroom: e.target.value })}
                placeholder="강의실을 입력하세요"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-4">
          <Link href="/admin/courses">
            <Button variant="secondary">취소</Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? '생성 중...' : '과목 생성'}
          </Button>
        </div>
      </form>
    </div>
  )
}
