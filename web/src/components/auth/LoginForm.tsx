import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth.store'
import { getErrorMessage } from '@/lib/utils/errorHandler'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Information from '@/components/common/Information'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'

export default function LoginForm() {
  const navigate = useNavigate()
  const { login, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    logout()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      })

      login(
        {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
        {
          id: response.userId,
          email: formData.email,
          username: "",
        },
        response.role as 'ADMINISTRATOR' | 'SUPER_ADMIN' | 'ADMIN' | null
      )

      navigate('/')
    } catch (error) {
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center">
        <h1 className="text-heading-24 text-text">로그인</h1>

        <div className="h-8" />

        <Information type="info">
          관리자 계정만 로그인할 수 있습니다.
        </Information>
      </div>

      <div className="h-6" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            value={formData.email}
            onChange={value => setFormData({ ...formData, email: value })}
            placeholder="이메일"
            size="lg"
            className="w-full"
          />
        </div>

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={value => setFormData({ ...formData, password: value })}
            placeholder="비밀번호"
            size="lg"
            className="w-full pr-12"
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

        {error && <p className="text-caption-14 text-error-500 ml-2">{error}</p>}

        <div className="h-6" />

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          radius="md"
          variant="point_2"
          className="w-full flex items-center justify-center"
        >
          {loading ? <LoadingSpinner size="md" /> : '로그인'}
        </Button>
        <Button
          type="button"
          onClick={() => navigate('/reset-password')}
          variant="custom"
          className="w-full text-info-600 hover:underline"
        >
          비밀번호를 잊으셨나요?
        </Button>
      </form>
    </div>
  )
}
