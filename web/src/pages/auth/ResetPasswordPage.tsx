import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { authApi } from '@/lib/api/auth'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Information from '@/components/common/Information'
import { useAlert } from '@/hooks/useAlert'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'

type Step = 'email' | 'verify' | 'password'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const alert = useAlert()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      alert.error('이메일을 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      await authApi.forgotPassword({ email })
      alert.success('인증번호가 발송되었습니다.')
      setStep('verify')
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code.trim()) {
      alert.error('인증번호를 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      await authApi.verifyCode({ email, code })
      alert.success('인증번호가 확인되었습니다.')
      setStep('password')
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
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
      await authApi.resetPassword({ email, code, newPassword: password })
      alert.success('비밀번호가 재설정되었습니다. 로그인해주세요.')
      navigate('/login')
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="이메일 주소"
          size="lg"
          className="w-full"
          required
        />
      </div>
      <Button
        type="submit"
        disabled={loading || !email}
        size="lg"
        radius="md"
        variant="point_2"
        className="w-full flex items-center justify-center"
      >
        {loading ? <LoadingSpinner size="md" /> : '인증번호 발송'}
      </Button>
    </form>
  )

  const renderVerifyStep = () => (
    <form onSubmit={handleVerifySubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          value={code}
          onChange={setCode}
          placeholder="인증번호 6자리"
          size="lg"
          className="w-full"
          required
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => setStep('email')}
          variant="cancel"
          size="lg"
          radius="md"
          className="flex-1"
        >
          이전
        </Button>
        <Button
          type="submit"
          disabled={loading || !code}
          size="lg"
          radius="md"
          variant="point_2"
          className="flex-1 flex items-center justify-center"
        >
          {loading ? <LoadingSpinner size="md" /> : '인증 확인'}
        </Button>
      </div>
    </form>
  )

  const renderPasswordStep = () => (
    <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => setStep('verify')}
          variant="cancel"
          size="lg"
          radius="md"
          className="flex-1"
        >
          이전
        </Button>
        <Button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          size="lg"
          radius="md"
          variant="point_2"
          className="flex-1 flex items-center justify-center"
        >
          {loading ? <LoadingSpinner size="md" /> : '비밀번호 재설정'}
        </Button>
      </div>
    </form>
  )

  const getTitle = () => {
    switch (step) {
      case 'email':
        return '비밀번호 재설정'
      case 'verify':
        return '인증번호 확인'
      case 'password':
        return '새 비밀번호 설정'
    }
  }

  const getInfo = () => {
    switch (step) {
      case 'email':
        return '등록된 이메일 주소를 입력하면 인증번호를 발송해드립니다.'
      case 'verify':
        return `${email}로 발송된 인증번호를 입력해주세요.`
      case 'password':
        return '새로운 비밀번호를 설정해주세요.'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full max-w-md text-center">
        <h1 className="text-heading-24 text-text">{getTitle()}</h1>

        <div className="h-8" />

        <Information type="info">{getInfo()}</Information>

        <div className="h-6" />

        {step === 'email' && renderEmailStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'password' && renderPasswordStep()}

        <div className="h-2" />

        <Button
          type="button"
          onClick={() => navigate('/login')}
          variant="custom"
          className="text-info-600 hover:underline"
        >
          로그인으로 돌아가기
        </Button>
      </div>
    </div>
  )
}
