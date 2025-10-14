import { XMarkIcon } from '@heroicons/react/24/outline'
import Button from '@/components/common/Button'

interface ExitWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmExit: () => void
  onSaveDraft?: () => void
  showDraftOption?: boolean
}

export default function ExitWarningModal({
  isOpen,
  onClose,
  onConfirmExit,
  onSaveDraft,
  showDraftOption = false,
}: ExitWarningModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-body-18-medium text-gray-900">작성 중인 내용이 있습니다</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-body-14-medium text-gray-900 mb-2">
            작성 중인 내용이 저장되지 않습니다.
          </p>
          <p className="text-caption-14 text-red-600">
            정말 나가시겠습니까?
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="cancel"
            radius="md"
            size="md"
            onClick={onClose}
          >
            계속 작성
          </Button>
          {showDraftOption && onSaveDraft && (
            <Button
              variant="info"
              radius="md"
              size="md"
              onClick={onSaveDraft}
            >
              임시저장 후 나가기
            </Button>
          )}
          <Button
            variant="delete"
            radius="md"
            size="md"
            onClick={onConfirmExit}
          >
            나가기
          </Button>
        </div>
      </div>
    </div>
  )
}
