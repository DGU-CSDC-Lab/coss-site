import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  adminApi,
  AdminUser,
  UpdateUserPermissionRequest,
} from '@/lib/api/admin'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import Dropdown from '@/components/common/Dropdown'
import ConfirmModal from '@/components/common/ConfirmModal'
import { useAlert } from '@/hooks/useAlert'

const ROLE_OPTIONS = [
  { value: '', label: '권한 선택' },
  { value: 'ADMIN', label: '관리자' },
  { value: 'SUPER_ADMIN', label: '최고 관리자' },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: AdminUser | null }>({
    isOpen: false,
    user: null,
  })
  const [deleteLoading, setDeleteLoading] = useState(false)

  const alert = useAlert()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getAllAdmins()
      setUsers(response)
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (updating) return

    try {
      setUpdating(userId)
      const data: UpdateUserPermissionRequest = {
        userId,
        permission: newRole,
      }
      await adminApi.updateUserPermission(data)
      alert.success('권한이 변경되었습니다.')
      fetchUsers()
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.user) return

    try {
      setDeleteLoading(true)
      await adminApi.removeAdmin(deleteModal.user.id)
      alert.success('관리자가 제거되었습니다.')
      setDeleteModal({ isOpen: false, user: null })
      fetchUsers()
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Title>관리자 관리</Title>
          <p className="text-body-14 text-gray-600 mt-2">
            총 {users.length}명의 관리자가 있습니다.
          </p>
        </div>
        <Link to="/admin/users/create">
          <Button variant="info" radius="md" size="md">
            관리자 추가
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-info-100">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-info-50 border-b border-info-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                      사용자명
                    </th>
                    <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                      이메일
                    </th>
                    <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                      권한
                    </th>
                    <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                      생성일
                    </th>
                    <th className="px-4 py-3 text-center font-body-18-medium text-gray-900">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-info-100">
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-caption-14 text-gray-600"
                      >
                        등록된 관리자가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-body-14-medium text-gray-900">
                          {user.username}
                        </td>
                        <td className="px-4 py-3 font-body-14-medium text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {user.role === 'SUPER_ADMIN' ? (
                            <Button
                              variant="info"
                              size="sm"
                              radius="md"
                              onClick={() => handleRoleChange(user.id, 'ADMIN')}
                              disabled={user.role !== 'SUPER_ADMIN' || updating === user.id}
                            >
                              관리자로 변경
                            </Button>
                          ) : (
                            <Button
                              variant="info"
                              size="sm"
                              radius="md"
                              onClick={() =>
                                handleRoleChange(user.id, 'SUPER_ADMIN')
                              }
                              disabled={user.role === 'SUPER_ADMIN' || updating === user.id}
                            >
                              최고 관리자로 변경
                            </Button>
                          )}
                        </td>
                        <td className="px-4 py-3 font-body-14-medium text-gray-600 whitespace-nowrap">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-center">
                            {user.role !== 'SUPER_ADMIN' && (
                              <Button
                                variant="delete"
                                size="sm"
                                radius="md"
                                onClick={() =>
                                  setDeleteModal({ isOpen: true, user })
                                }
                                disabled={updating === user.id}
                              >
                                삭제
                              </Button>
                            )}
                            {updating === user.id && (
                              <LoadingSpinner size="sm" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={handleDelete}
        title="관리자 제거"
        message={`"${deleteModal.user?.username}" 관리자를 제거하시겠습니까?`}
        warningMessage="제거된 관리자는 복구할 수 없습니다."
        confirmText="제거"
        loading={deleteLoading}
      />
    </div>
  )
}
