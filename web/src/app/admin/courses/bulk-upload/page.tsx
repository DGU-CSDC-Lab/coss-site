'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, InformationCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { coursesApi, CourseBulkInitRequest } from '@/lib/api/courses'
import Title from '@/components/common/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import * as XLSX from 'xlsx'

interface CourseData {
  year: number
  semester: string
  department: string
  courseCode: string
  subjectName: string
  englishName?: string
  grade?: string
  credit?: number
  classTime?: string
  instructor?: string
  classroom?: string
  courseType?: string
  syllabusUrl?: string
}

export default function CourseBulkUploadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  const [semester, setSemester] = useState('1학기')
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<CourseData[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const semesterOptions = [
    { value: '1학기', label: '1학기' },
    { value: '2학기', label: '2학기' },
    { value: '여름학기', label: '여름학기' },
    { value: '겨울학기', label: '겨울학기' },
  ]

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    
    try {
      const data = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

      // 첫 번째 행은 헤더로 가정하고 제외
      const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''))
      
      // 정확한 Excel 컬럼 매핑:
      const courses: CourseData[] = rows.map(row => ({
        year: year,
        semester: semester,
        department: row[22] || '', // 개설학과
        courseCode: row[4] || '', // 학수강좌번호
        subjectName: row[5] || '', // 교과목명
        englishName: row[26] || null, // 교과목영문명
        grade: row[3] || undefined, // 대상학년
        credit: parseFloat(row[9]) || 0, // 학점
        classTime: row[7] || undefined, // 요일/교시
        instructor: row[6] || undefined, // 담당교원
        classroom: row[8] || undefined, // 강의실
        courseType: String(row[1]) || undefined, // 교과과정
        syllabusUrl: null,
      }))

      setPreviewData(courses)
      setShowPreview(true)
    } catch (error) {
      console.error('Excel 파일 읽기 실패:', error)
      alert('Excel 파일을 읽는 중 오류가 발생했습니다.')
    }
  }

  const handleSubmit = async () => {
    if (!file || previewData.length === 0) {
      alert('파일을 선택하고 미리보기를 확인해주세요.')
      return
    }

    console.log('API 요청 시작:', { year, semester, coursesCount: previewData.length })
    setLoading(true)

    try {
      const requestData: CourseBulkInitRequest = {
        year,
        semester,
        courses: previewData
      }

      console.log('API 요청 데이터:', requestData)
      const result = await coursesApi.bulkInit(requestData)
      console.log('API 응답:', result)
      
      if (result.failureCount > 0) {
        alert(`등록 완료!\n성공: ${result.successCount}건\n실패: ${result.failureCount}건\n\n오류:\n${result.errors.join('\n')}`)
      } else {
        alert(`${result.successCount}건의 과목이 성공적으로 등록되었습니다.`)
      }
      
      router.push('/admin/courses')
    } catch (error) {
      console.error('과목 등록 실패:', error)
      alert('과목 등록 중 오류가 발생했습니다.')
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
        <Title>개설과목 일괄 등록</Title>
      </div>

      {/* 안내 정보 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-body-18-medium text-blue-900 mb-2">개설과목 등록 안내</h3>
            <div className="font-caption-14 text-blue-800 space-y-1">
              <p>• <strong>일괄 등록</strong>: 선택한 년도/학기의 모든 기존 과목을 삭제하고 새로운 과목으로 초기화합니다.</p>
              <p>• <strong>개별 관리</strong>: 개설과목 관리 페이지에서 년도/학기를 선택하여 개별 과목의 생성/수정/삭제가 가능합니다.</p>
              <p>• <strong>Excel 형식</strong>: 과목유형, 학점, 과목명, 학년, 학수번호, 강의시간, 교수명, 강의실 순서</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block font-body-18-medium text-gray-900 mb-3">
              년도 *
            </label>
            <Input
              type="number"
              value={year.toString()}
              onChange={e => setYear(parseInt(e) || new Date().getFullYear())}
              min="2000"
              max="2100"
            />
          </div>

          <div>
            <label className="block font-body-18-medium text-gray-900 mb-3">
              학기 *
            </label>
            <Dropdown
              options={semesterOptions}
              value={semester}
              onChange={setSemester}
              placeholder="학기 선택"
            />
          </div>
        </div>

        <div>
          <label className="block font-body-18-medium text-gray-900 mb-3">
            Excel 파일 *
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          />
          <p className="mt-2 font-caption-14 text-gray-600">
            Excel 파일(.xlsx, .xls)을 업로드하세요. 첫 번째 행은 헤더로 처리됩니다.
          </p>
        </div>

        {showPreview && previewData.length > 0 && (
          <div>
            <h3 className="font-body-18-medium text-gray-900 mb-4">
              미리보기 ({previewData.length}건)
            </h3>
            <div className="max-h-96 overflow-auto border border-gray-300 rounded-lg">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">개설학과</th>
                    <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">학수강좌번호</th>
                    <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">교과목명</th>
                    <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">교과목영문명</th>
                    <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">대상학년</th>
                    <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">학점</th>
                    <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">요일/교시</th>
                    <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">담당교원</th>
                    <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">강의실</th>
                    <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">교과과정</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((course, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-caption-14 text-gray-900 border-b">{course.department}</td>
                      <td className="px-3 py-2 font-caption-14 text-gray-900 border-b">{course.courseCode}</td>
                      <td className="px-3 py-2 font-caption-14 text-gray-900 border-b">{course.subjectName}</td>
                      <td className="px-3 py-2 font-caption-14 text-gray-600 border-b">{course.englishName || '-'}</td>
                      <td className="px-3 py-2 font-caption-14 text-gray-600 border-b">{course.grade || '-'}</td>
                      <td className="px-3 py-2 font-caption-14 text-gray-600 border-b">{course.credit || '-'}</td>
                      <td className="px-3 py-2 font-caption-14 text-gray-600 border-b">{course.classTime || '-'}</td>
                      <td className="px-3 py-2 font-caption-14 text-gray-600 border-b">{course.instructor || '-'}</td>
                      <td className="px-3 py-2 font-caption-14 text-gray-600 border-b">{course.classroom || '-'}</td>
                      <td className="px-3 py-2 font-caption-14 text-gray-600 border-b">{course.courseType || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-end pt-4">
          <Link href="/admin/courses">
            <Button variant="secondary">취소</Button>
          </Link>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || !showPreview || previewData.length === 0}
          >
            {loading ? '등록 중...' : `${previewData.length}건 등록`}
          </Button>
        </div>
      </div>
    </div>
  )
}
