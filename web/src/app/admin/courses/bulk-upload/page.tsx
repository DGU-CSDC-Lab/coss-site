'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { coursesApi, CourseBulkInitRequest } from '@/lib/api/courses'
import Title from '@/components/common/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import Label from '@/components/common/Label'
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
  const [showConfirmModal, setShowConfirmModal] = useState(false)

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
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      }) as any[][]

      // 첫 번째 행은 헤더로 가정하고 제외
      const rows = jsonData
        .slice(1)
        .filter(row => row.some(cell => cell !== undefined && cell !== ''))

      // 정확한 Excel 컬럼 매핑:
      const courses: CourseData[] = rows.map(row => ({
        year: year,
        semester: semester,
        department: (row[22] && String(row[22]).trim()) || '', // 개설학과
        courseCode: (row[4] && String(row[4]).trim()) || '', // 학수강좌번호
        subjectName: (row[5] && String(row[5]).trim()) || '', // 교과목명
        englishName: row[26] ? String(row[26]).trim() : undefined, // 교과목영문명
        grade: row[3] ? String(row[3]).trim() : undefined, // 대상학년
        credit: row[9] !== undefined && row[9] !== null && !isNaN(parseFloat(row[9])) ? parseFloat(row[9]) : undefined, // 학점 (0 포함)
        classTime: row[7] ? String(row[7]).trim() : undefined, // 요일/교시
        instructor: row[6] ? String(row[6]).trim() : undefined, // 담당교원
        classroom: row[8] ? String(row[8]).trim() : undefined, // 강의실
        courseType: row[1] ? String(row[1]).trim() : undefined, // 교과과정
        syllabusUrl: undefined,
      })).filter(course => 
        // 필수 필드가 있는 과목만 포함
        course.department && course.courseCode && course.subjectName
      )

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

    // 데이터 검증
    const invalidCourses = previewData.filter(course => 
      !course.department || !course.courseCode || !course.subjectName
    )
    
    if (invalidCourses.length > 0) {
      alert(`필수 필드가 누락된 과목이 ${invalidCourses.length}개 있습니다. (학과, 교과목코드, 교과목명은 필수입니다)`)
      console.log('Invalid courses:', invalidCourses)
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = async () => {
    console.log('API 요청 시작:', {
      year,
      semester,
      coursesCount: previewData.length,
    })
    setLoading(true)
    setShowConfirmModal(false)

    try {
      const requestData: CourseBulkInitRequest = {
        year,
        semester,
        courses: previewData,
      }

      console.log('API 요청 데이터:', JSON.stringify(requestData, null, 2))
      console.log('첫 번째 course 샘플:', previewData[0])
      console.log('courses 배열 길이:', previewData.length)
      
      const result = await coursesApi.bulkInit(requestData)
      console.log('API 응답:', result)

      if (result.failureCount > 0) {
        alert(
          `등록 완료!\n성공: ${result.successCount}건\n실패: ${result.failureCount}건\n\n오류:\n${result.errors.join('\n')}`
        )
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
    <div className="w-full h-screen flex flex-col">
      <div className="flex items-center justify-between gap-4 p-6">
        <Title>개설과목 일괄 등록</Title>
        <Link href="/admin/courses">
          <Button variant="delete" size="md" radius="md">
            나가기
          </Button>
        </Link>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {/* 안내 정보 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-body-18-medium text-blue-900 mb-2">
                개설과목 등록 안내
              </h3>
              <div className="font-caption-14 text-blue-800 space-y-1">
                <p>
                  • <strong>일괄 등록</strong>: 선택한 년도/학기의 모든 기존
                  과목을 삭제하고 새로운 과목으로 초기화합니다.
                </p>
                <p>
                  • <strong>개별 관리</strong>: 개설과목 관리 페이지에서
                  년도/학기를 선택하여 개별 과목의 생성/수정/삭제가 가능합니다.
                </p>
                <p>
                  • <strong>Excel 형식</strong>: 과목유형, 학점, 과목명, 학년,
                  학수번호, 강의시간, 교수명, 강의실 순서
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label required={true} className="mb-2">
                년도
              </Label>
              <Input
                type="number"
                value={year.toString()}
                onChange={e => setYear(parseInt(e) || new Date().getFullYear())}
                min="2000"
                max="2100"
                className="w-full"
                size="lg"
              />
            </div>

            <div>
              <Label required={true} className="mb-2">
                학기
              </Label>
              <Dropdown
                options={semesterOptions}
                value={semester}
                onChange={setSemester}
                placeholder="학기 선택"
                size="lg"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <Label required={true} className="mb-2">
              Excel 파일
            </Label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />
            <p className="mt-2 font-caption-14 text-gray-600">
              Excel 파일(.xlsx, .xls)을 업로드하세요. 첫 번째 행은 헤더로
              처리됩니다.
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
                      <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">
                        개설학과
                      </th>
                      <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">
                        학수강좌번호
                      </th>
                      <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">
                        교과목명
                      </th>
                      <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">
                        교과목영문명
                      </th>
                      <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">
                        대상학년
                      </th>
                      <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">
                        학점
                      </th>
                      <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">
                        요일/교시
                      </th>
                      <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">
                        담당교원
                      </th>
                      <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">
                        강의실
                      </th>
                      <th className="px-3 py-2 text-left font-body-18-medium text-gray-900 border-b">
                        교과과정
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((course, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-caption-14 text-gray-900 border-b">
                          {course.department}
                        </td>
                        <td className="px-3 py-2 font-caption-14 text-gray-900 border-b">
                          {course.courseCode}
                        </td>
                        <td className="px-3 py-2 font-caption-14 text-gray-900 border-b">
                          {course.subjectName}
                        </td>
                        <td className="px-3 py-2 font-caption-14 text-gray-600 border-b">
                          {course.englishName || '-'}
                        </td>
                        <td className="px-3 py-2 font-caption-14 text-gray-600 border-b">
                          {course.grade || '-'}
                        </td>
                        <td className="px-3 py-2 font-caption-14 text-gray-600 border-b">
                          {course.credit || '-'}
                        </td>
                        <td className="px-3 py-2 font-caption-14 text-gray-600 border-b">
                          {course.classTime || '-'}
                        </td>
                        <td className="px-3 py-2 font-caption-14 text-gray-600 border-b">
                          {course.instructor || '-'}
                        </td>
                        <td className="px-3 py-2 font-caption-14 text-gray-600 border-b">
                          {course.classroom || '-'}
                        </td>
                        <td className="px-3 py-2 font-caption-14 text-gray-600 border-b">
                          {course.courseType || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 justify-end p-6 border-t bg-white flex-shrink-0">
        <Link href="/admin/courses">
          <Button variant="cancel" radius="md" size="md">취소</Button>
        </Link>
        <Button
          variant="info"
          radius="md"
          size="md"
          onClick={handleSubmit}
          disabled={loading || !showPreview || previewData.length === 0}
        >
          {loading ? '등록 중...' : `${previewData.length}건 등록`}
        </Button>
      </div>

      {/* 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-body-18-medium text-gray-900">등록 확인</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="font-body-14-medium text-gray-900 mb-2">
                <strong>{year}년 {semester}</strong>의 모든 과목이 덮어씌워집니다.
              </p>
              <p className="font-caption-14 text-red-600">
                기존 과목 데이터는 복구할 수 없습니다. 정말 진행하시겠습니까?
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="cancel"
                radius="md"
                size="md"
                onClick={() => setShowConfirmModal(false)}
              >
                취소
              </Button>
              <Button
                variant="delete"
                radius="md"
                size="md"
                onClick={handleConfirmSubmit}
                disabled={loading}
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
