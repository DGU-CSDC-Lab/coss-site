import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { coursesApi } from '@/lib/api/courses'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import { useAlert } from '@/hooks/useAlert'
import * as XLSX from 'xlsx'

export default function AdminCourseOfferingBulkUploadPage() {
  const navigate = useNavigate()
  const alert = useAlert()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert.error('파일을 선택해주세요.')
      return
    }

    setLoading(true)
    try {
      await coursesApi.uploadOfferingExcel(file)
      alert.success('파일이 업로드되었습니다.')
      navigate('/admin/courses')
    } catch (error) {
      alert.error('업로드 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const templateData = [
      ['마스터교과목ID', '개설년도', '학기', '수업시간', '담당교원', '강의실', '강의계획서URL'],
      ['master-id-1', 2024, '1학기', '월 09:00-12:00', '김교수', 'A101', 'https://example.com/syllabus1.pdf'],
      ['master-id-2', 2024, '1학기', '화 13:00-16:00', '이교수', 'B201', 'https://example.com/syllabus2.pdf'],
    ]

    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '개설교과목')
    XLSX.writeFile(wb, '개설교과목_업로드_양식.xlsx')
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/admin/courses" className="text-blue-600 hover:underline">
          ← 목록으로
        </Link>
        <Title className="mt-2">개설 교과목 일괄 업로드</Title>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">업로드 안내</h3>
          <p className="text-sm text-blue-700 mb-3">
            Excel 파일을 업로드하여 개설 교과목을 일괄 등록할 수 있습니다. 
            마스터교과목ID는 기존에 등록된 마스터 교과목의 ID를 입력해야 합니다.
          </p>
          <Button
            onClick={downloadTemplate}
            variant="info"
            size="sm"
          >
            📥 양식 다운로드
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excel 파일 선택
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={() => navigate('/admin/courses')}
            variant="cancel"
            disabled={loading}
          >
            취소
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? '업로드 중...' : '업로드'}
          </Button>
        </div>
      </div>
    </div>
  )
}
