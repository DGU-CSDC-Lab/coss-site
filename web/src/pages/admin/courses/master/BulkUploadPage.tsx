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

export default function AdminCourseMasterBulkUploadPage() {
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
      await coursesApi.uploadMasterExcel(file)
      alert.success('파일이 업로드되었습니다.')
      navigate('/admin/courses/master')
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
      [
        '학기',
        '학과',
        '교과목코드',
        '교과목명',
        '교과목영문명',
        '교과목설명',
        '수강학년',
        '학점',
        '강의유형',
      ],
      [
        '1학기',
        '지능IoT학과',
        'IOT101',
        'IoT 기초',
        'IoT Fundamentals',
        'IoT의 기본 개념과 원리를 학습합니다.',
        '1학년',
        3,
        '이론',
      ],
      [
        '1학기',
        '지능IoT학과',
        'IOT102',
        '프로그래밍 기초',
        'Programming Fundamentals',
        '프로그래밍의 기본 개념을 학습합니다.',
        '1학년',
        3,
        '실습',
      ],
    ]

    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '운영교과목')
    XLSX.writeFile(wb, '운영교과목_업로드_양식.xlsx')
  }

  return (
    <>
      <div className="w-full h-screen flex flex-col">
        <div className="flex items-center justify-between gap-4 p-6">
          <Title>운영 교과목 일괄 업로드</Title>
          <Link to="/admin/courses/master">
            <Button variant="delete" size="md" radius="md">
              나가기
            </Button>
          </Link>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="space-y-8">
            <Information type="info">
              Excel 파일을 업로드하여 운영 교과목을 일괄 등록할 수 있습니다.
              먼저 양식을 다운로드하여 데이터를 입력해주세요.
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
          <Link to="/admin/courses/master">
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
