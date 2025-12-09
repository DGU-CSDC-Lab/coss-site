import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { coursesApi } from '@/lib/api/courses'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Label from '@/components/common/Label'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import Information from '@/components/common/Information'
import { useAlert } from '@/hooks/useAlert'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import ExitWarningModal from '@/components/common/ExitWarningModal'
import * as XLSX from 'xlsx'

export default function AdminCourseOfferingBulkUploadPage() {
  const navigate = useNavigate()
  const alert = useAlert()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')

  const hasChanges = !!file
  const exitWarning = useUnsavedChanges({ hasChanges })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFileName(selectedFile.name)
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
      navigate('/admin/courses/offering')
    } catch (error) {
      alert.error('업로드 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleButtonUpload = () => {
    handleUpload()
  }

  const downloadTemplate = () => {
    const templateData = [
      ['운영교과목ID', '개설년도', '학기', '수업시간', '담당교원', '강의실', '강의계획서URL'],
      ['master-id-1', 2024, '1학기', '월 09:00-12:00', '김교수', 'A101', 'https://example.com/syllabus1.pdf'],
      ['master-id-2', 2024, '1학기', '화 13:00-16:00', '이교수', 'B201', 'https://example.com/syllabus2.pdf'],
    ]

    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '개설교과목')
    XLSX.writeFile(wb, '개설교과목_업로드_양식.xlsx')
  }

  return (
    <>
      <div className="w-full h-screen flex flex-col">
        <div className="flex items-center justify-between gap-4 p-6">
          <Title>개설 교과목 일괄 업로드</Title>
          <Link to="/admin/courses/offering">
            <Button variant="delete" size="md" radius="md">
              나가기
            </Button>
          </Link>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="space-y-8">
            <Information type="info">
              Excel 파일을 업로드하여 개설 교과목을 일괄 등록할 수 있습니다. 운영교과목ID는 기존에 등록된 운영 교과목의 ID를 입력해야 합니다.
            </Information>

            <div className="space-y-4">
              <div>
                <Label className="mb-2">업로드 양식</Label>
                <Button
                  onClick={downloadTemplate}
                  variant="custom"
                  size="lg"
                  radius="md"
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  xlsx 양식 다운로드
                </Button>
              </div>

              <div>
                <Label required={true} className="mb-2">
                  Excel 파일 선택
                </Label>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  value={fileName}
                  onFileChange={handleFileChange}
                  onChange={setFileName}
                  size="lg"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end p-6 bg-white flex-shrink-0">
          <Link to="/admin/courses/offering">
            <Button variant="cancel" size="lg" radius="md">
              취소
            </Button>
          </Link>
          <Button
            onClick={handleButtonUpload}
            variant="info"
            size="lg"
            radius="md"
            disabled={!file || loading}
          >
            {loading ? <LoadingSpinner size="md" /> : '업로드'}
          </Button>
        </div>
      </div>

      <ExitWarningModal
        isOpen={exitWarning.showExitModal}
        onClose={exitWarning.cancelExit}
        onConfirmExit={exitWarning.confirmExit}
        onSaveDraft={exitWarning.saveDraftAndExit}
        showDraftOption={false}
      />
    </>
  )
}
