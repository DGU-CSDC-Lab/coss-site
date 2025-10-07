import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProgramsPage() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/support/programs/co-week', { replace: true })
  }, [navigate])

  return (
    <div>
      <div>리다이렉트 중...</div>
    </div>
  )
}
