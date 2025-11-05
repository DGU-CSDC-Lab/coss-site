import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { coursesApi } from '@/lib/api/courses'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import { useAlert } from '@/hooks/useAlert'
import * as XLSX from 'xlsx'

export default function AdminCourseMasterBulkUploadPage() {
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
      await coursesApi.uploadMasterExcel(file)
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
      ['학기', '학과', '교과목코드', '교과목명', '교과목영문명', '교과목설명', '수강학년', '학점', '강의유형'],
      ['1학기', '지능IoT학과', 'IOT101', 'IoT 기초', 'IoT Fundamentals', 'IoT의 기본 개념과 원리를 학습합니다.', '1학년', 3, '이론'],
      ['1학기', '지능IoT학과', 'IOT102', '프로그래밍 기초', 'Programming Fundamentals', '프로그래밍의 기본 개념을 학습합니다.', '1학년', 3, '실습'],
    ]

    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '마스터교과목')
    XLSX.writeFile(wb, '마스터교과목_업로드_양식.xlsx')
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/admin/courses" className="text-blue-600 hover:underline">
          ← 목록으로
        </Link>
        <Title className="mt-2">마스터 교과목 일괄 업로드</Title>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">업로드 안내</h3>
          <p className="text-sm text-blue-700 mb-3">
            Excel 파일을 업로드하여 마스터 교과목을 일괄 등록할 수 있습니다.
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
