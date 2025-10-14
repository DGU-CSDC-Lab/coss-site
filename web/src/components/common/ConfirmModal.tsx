import { XMarkIcon } from '@heroicons/react/24/outline'
import Button from '@/components/common/Button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  warningMessage?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'delete' | 'info' | 'point_2'
  loading?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  warningMessage,
  confirmText = '확인',
  cancelText = '취소',
  confirmVariant = 'delete',
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-body-18-medium text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-body-14-medium text-gray-900 mb-2">
            {message}
          </p>
          {warningMessage && (
            <p className="text-caption-14 text-red-600">
              {warningMessage}
            </p>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="cancel"
            radius="md"
            size="md"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            radius="md"
            size="md"
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
