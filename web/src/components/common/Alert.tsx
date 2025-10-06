import { useAlertStore } from '@/store/alert.store'
import { useEffect } from 'react'

export default function Alert() {
  const { message, type, isVisible, hideAlert } = useAlertStore()

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        hideAlert()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, hideAlert])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div
        className={`
          transform transition-all duration-300 ease-in-out
          translate-x-0 opacity-100
          px-4 py-3 rounded-lg shadow-lg max-w-md
          ${type === 'success' ? 'bg-green-500' : ''}
          ${type === 'error' ? 'bg-red-500' : ''}
          ${type === 'warning' ? 'bg-yellow-500' : ''}
          ${type === 'info' ? 'bg-blue-500' : ''}
        `}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-2">
            {type === 'success' && <span className="text-white text-lg">✓</span>}
            {type === 'error' && <span className="text-white text-lg">⚠</span>}
            {type === 'warning' && <span className="text-white text-lg">⚠</span>}
            {type === 'info' && <span className="text-white text-lg">ℹ</span>}
          </div>
          <p className="text-white font-18-body-medium">{message}</p>
        </div>
      </div>
    </div>
  )
}
