import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { authApi } from '@/lib/api/auth'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Information from '@/components/common/Information'
import { useAlert } from '@/hooks/useAlert'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'

export default function SetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [checking, setChecking] = useState(true)

  const alert = useAlert()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      alert.error('유효하지 않은 접근입니다.')
      navigate('/login')
      return
    }

    // 토큰 유효성 간단 체크 (실제 검증은 서버에서)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp * 1000 < Date.now()) {
        alert.error('만료된 링크입니다.')
        navigate('/login')
        return
      }
      setTokenValid(true)
    } catch (error) {
      alert.error('유효하지 않은 접근입니다.')
      navigate('/login')
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
      navigate('/login')
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!tokenValid) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full max-w-md text-center">
        <h1 className="text-heading-24 text-text">비밀번호 설정</h1>

        <div className="h-8" />

        <Information type="info">계정 비밀번호를 설정 해주세요.</Information>

        <div className="h-6" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="새 비밀번호 (8자 이상)"
              size="lg"
              className="w-full pr-12"
              required
            />
            <Button
              onClick={() => setShowPassword(!showPassword)}
              variant="custom"
              iconOnly
              icon={
                showPassword ? (
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5" />
                )
              }
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            />
          </div>

          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="비밀번호 확인"
              size="lg"
              className="w-full pr-12"
              required
            />
            <Button
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              variant="custom"
              iconOnly
              icon={
                showConfirmPassword ? (
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5" />
                )
              }
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            />
          </div>

          <div className="h-6" />

          <Button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            size="lg"
            radius="md"
            variant="point_2"
            className="w-full flex items-center justify-center"
          >
            {loading ? <LoadingSpinner size="md" /> : '비밀번호 설정'}
          </Button>
        </form>
      </div>
    </div>
  )
}
