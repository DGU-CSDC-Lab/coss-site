import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { coursesApi } from '@/lib/api/courses'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import { useAlert } from '@/hooks/useAlert'

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/admin/courses" className="text-blue-600 hover:underline">
          ← 목록으로
        </Link>
        <Title className="mt-2">개설 교과목 일괄 업로드</Title>
      </div>

      <div className="space-y-4">
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
