import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api/auth'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { useAlert } from '@/hooks/useAlert'

export default function SetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [checking, setChecking] = useState(true)
  
  const alert = useAlert()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      alert.error('유효하지 않은 접근입니다.')
      navigate('/auth/login')
      return
    }
    
    // 토큰 유효성 간단 체크 (실제 검증은 서버에서)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp * 1000 < Date.now()) {
        alert.error('만료된 링크입니다.')
        navigate('/auth/login')
        return
      }
      setTokenValid(true)
    } catch (error) {
      alert.error('유효하지 않은 토큰입니다.')
      navigate('/auth/login')
      return
    } finally {
      setChecking(false)
    }
  }, [token, navigate, alert])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      alert.error('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 8) {
      alert.error('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    try {
      setLoading(true)
      await authApi.setPassword({ token: token!, password })
      alert.success('비밀번호가 설정되었습니다. 로그인해주세요.')
      navigate('/auth/login')
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pri-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">토큰을 확인하고 있습니다...</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-heading-24-bold text-gray-900">
            비밀번호 설정
          </h2>
          <p className="mt-2 text-body-14 text-gray-600">
            관리자 계정의 비밀번호를 설정해주세요.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-body-14-medium text-gray-700 mb-2">
                새 비밀번호
              </label>
              <Input
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="8자 이상 입력해주세요"
                size="lg"
                required
              />
            </div>

            <div>
              <label className="block text-body-14-medium text-gray-700 mb-2">
                비밀번호 확인
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="비밀번호를 다시 입력해주세요"
                size="lg"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="info"
            size="lg"
            radius="md"
            className="w-full"
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? '설정 중...' : '비밀번호 설정'}
          </Button>
        </form>
      </div>
    </div>
  )
}
