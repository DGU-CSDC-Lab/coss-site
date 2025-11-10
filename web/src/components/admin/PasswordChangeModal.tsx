import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { authApi } from '@/lib/api/auth'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { useAlert } from '@/hooks/useAlert'

interface PasswordChangeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PasswordChangeModal({ isOpen, onClose }: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const alert = useAlert()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      alert.error('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (newPassword.length < 8) {
      alert.error('새 비밀번호는 8자 이상이어야 합니다.')
      return
    }

    try {
      setLoading(true)
      await authApi.changePassword({
        currentPassword,
        newPassword
      })
      alert.success('비밀번호가 변경되었습니다.')
      handleClose()
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={handleClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left w-full">
              <h3 className="text-heading-20-bold text-gray-900 mb-6">
                비밀번호 변경
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-body-14-medium text-gray-700 mb-2">
                    현재 비밀번호
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    placeholder="현재 비밀번호를 입력하세요"
                    size="md"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-body-14-medium text-gray-700 mb-2">
                    새 비밀번호
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="8자 이상 입력하세요"
                    size="md"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-body-14-medium text-gray-700 mb-2">
                    새 비밀번호 확인
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    size="md"
                    className="w-full"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="cancel"
                    size="md"
                    radius="md"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    variant="info"
                    size="md"
                    radius="md"
                    disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                    className="flex-1"
                  >
                    {loading ? '변경 중...' : '변경'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
