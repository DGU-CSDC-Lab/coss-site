import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { historyApi, CreateHistoryRequest, UpdateHistoryRequest, History } from '@/lib/api/history'
import Input from '@/components/common/Input'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Label from '@/components/common/Label'
import Textarea from '@/components/common/Textarea'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import { useAlert } from '@/hooks/useAlert'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import ExitWarningModal from '@/components/common/ExitWarningModal'

export default function AdminHistoryCreatePage() {
  const navigate = useNavigate()
  const params = useParams()
  const isEdit = !!params.id
  const alert = useAlert()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [history, setHistory] = useState<History | null>(null)
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    title: '',
    description: '',
  })

  const [originalData, setOriginalData] = useState(formData)
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)
  const exitWarning = useUnsavedChanges({ hasChanges })

  useEffect(() => {
    if (isEdit && params.id) {
      fetchHistory(params.id)
    }
  }, [isEdit, params.id])

  const fetchHistory = async (id: string) => {
    try {
      setInitialLoading(true)
      const historyData = await historyApi.getHistoryById(id)
      setHistory(historyData)
      
      const data = {
        year: historyData.year,
        month: historyData.month,
        title: historyData.title,
        description: historyData.description,
      }
      
      setFormData(data)
      setOriginalData(data)
    } catch (error) {
      alert.error('연혁 정보를 불러올 수 없습니다.')
      navigate('/admin/history')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert.error('제목과 내용을 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      
      if (isEdit && params.id) {
        await historyApi.updateHistory(params.id, formData as UpdateHistoryRequest)
        alert.success('연혁이 수정되었습니다.')
      } else {
        await historyApi.createHistory(formData as CreateHistoryRequest)
        alert.success('연혁이 등록되었습니다.')
      }
      
      navigate('/admin/history')
    } catch (error) {
      alert.error(`연혁 ${isEdit ? '수정' : '등록'} 중 오류가 발생했습니다.`)
    } finally {
      setLoading(false)
    }
  }

  const handleButtonSubmit = () => {
    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
  }

  if (initialLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <div className="w-full h-screen flex flex-col">
        <div className="flex items-center justify-between gap-4 p-6">
          <Title>{isEdit ? '연혁 수정' : '새 연혁 추가'}</Title>
          <Link to="/admin/history">
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
                    연도
                  </Label>
                  <Input
                    type="number"
                    min="1900"
                    max="2100"
                    value={formData.year.toString()}
                    onChange={(value) => setFormData({ ...formData, year: parseInt(value) || new Date().getFullYear() })}
                    placeholder="연도를 입력하세요"
                    className="w-full"
                    size="lg"
                  />
                </div>
                
                <div>
                  <Label required={true} className="mb-2">
                    월
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.month.toString()}
                    onChange={(value) => setFormData({ ...formData, month: parseInt(value) || 1 })}
                    placeholder="월을 입력하세요"
                    className="w-full"
                    size="lg"
                  />
                </div>
              </div>

              <div>
                <Label required={true} className="mb-2">
                  제목
                </Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(value) => setFormData({ ...formData, title: value })}
                  placeholder="연혁 제목을 입력하세요"
                  className="w-full"
                  size="lg"
                />
              </div>

              <div>
                <Label required={true} className="mb-2">
                  내용
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="연혁 내용을 입력하세요"
                  rows={6}
                  size="lg"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="flex gap-4 justify-end p-6 bg-white flex-shrink-0">
          <Link to="/admin/history">
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
            {loading ? <LoadingSpinner size="md" /> : (isEdit ? '연혁 수정' : '연혁 생성')}
          </Button>
        </div>
      </div>

      <ExitWarningModal
        isOpen={exitWarning.showExitModal}
        onClose={exitWarning.cancelExit}
        onConfirmExit={exitWarning.confirmExit}
        onSaveDraft={exitWarning.saveDraftAndExit}
        showDraftOption={true}
      />
    </>
  )
}
