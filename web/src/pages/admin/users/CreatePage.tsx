import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { adminApi, CreateSubAdminRequest } from '@/lib/api/admin'
import Button from '@/components/common/Button'
import Title from '@/components/common/title/Title'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import Label from '@/components/common/Label'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import { useAlert } from '@/hooks/useAlert'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import ExitWarningModal from '@/components/common/ExitWarningModal'
import { useAuthStore } from '@/store/auth.store'
import { getRoleOptions } from '@/utils/roleDepth'

export default function AdminUsersCreatePage() {
  const navigate = useNavigate()
  const alert = useAlert()
  const { role } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    permission: '',
  })

  // 권한 체크
  useEffect(() => {
    if (role === 'ADMIN') {
      alert.error('권한이 부족합니다.')
      navigate('/admin/users')
    }
  }, [role, navigate, alert])

  const [originalData, setOriginalData] = useState(formData)
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)
  const exitWarning = useUnsavedChanges({ hasChanges })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email.trim()) {
      alert.error('이메일을 입력해주세요.')
      return
    }

    if (!formData.username.trim()) {
      alert.error('사용자명을 입력해주세요.')
      return
    }

    if (!formData.permission) {
      alert.error('권한을 선택해주세요.')
      return
    }

    setLoading(true)

    try {
      const adminData: CreateSubAdminRequest = {
        email: formData.email,
        username: formData.username,
        permission: formData.permission,
      }

      await adminApi.createSubAdmin(adminData)
      alert.success('관리자가 생성되었습니다.')
      navigate('/admin/users')
    } catch (error) {
      alert.error(
        `관리자 생성 중 오류가 발생했습니다. \n ${error instanceof Error ? error.message : ''}`
      )
    } finally {
      setLoading(false)
    }
  }

  const handleButtonSubmit = () => {
    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
  }

  return (
    <>
      <div className="w-full h-screen flex flex-col">
        <div className="flex items-center justify-between gap-4 p-6">
          <Title>새 관리자 추가</Title>
          <Link to="/admin/users">
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
                    이메일
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={value =>
                      setFormData({ ...formData, email: value })
                    }
                    placeholder="관리자 이메일을 입력하세요"
                    className="w-full"
                    size="lg"
                  />
                </div>

                <div>
                  <Label required={true} className="mb-2">
                    사용자명
                  </Label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={value =>
                      setFormData({ ...formData, username: value })
                    }
                    placeholder="사용자명을 입력하세요"
                    className="w-full"
                    size="lg"
                  />
                </div>
              </div>

              <div>
                <Label required={true} className="mb-2">
                  권한
                </Label>
                <Dropdown
                  options={getRoleOptions(role || '')}
                  value={formData.permission}
                  onChange={value =>
                    setFormData({ ...formData, permission: value })
                  }
                  placeholder="권한을 선택해주세요."
                  size="lg"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="flex gap-4 justify-end p-6 bg-white flex-shrink-0">
          <Link to="/admin/users">
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
            {loading ? <LoadingSpinner size="md" /> : '관리자 생성'}
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
