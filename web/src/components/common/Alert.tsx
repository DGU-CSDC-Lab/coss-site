'use client'

import { useAlertStore } from '@/stores/alertStore'
import { useEffect, useState } from 'react'

export default function Alert() {
  const { alerts, removeAlert } = useAlertStore()

  if (alerts.length === 0) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-3">
      {alerts.map(alert => (
        <AlertItem key={alert.id} alert={alert} onRemove={removeAlert} />
      ))}
    </div>
  )
}

function AlertItem({
  alert,
  onRemove,
}: {
  alert: any
  onRemove: (id: string) => void
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 바로 나타나게
    setIsVisible(true)

    // 3초 후 사라지게
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onRemove(alert.id), 300) // 애니메이션 후 제거
    }, 3000)

    return () => clearTimeout(timer)
  }, [alert.id, onRemove])

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
        px-4 py-3 rounded-lg shadow-lg max-w-md
        ${alert.type === 'success' ? 'bg-green-500' : ''}
        ${alert.type === 'error' ? 'bg-red-500' : ''}
        ${alert.type === 'warning' ? 'bg-yellow-500' : ''}
        ${alert.type === 'info' ? 'bg-blue-500' : ''}
      `}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-2">
          {alert.type === 'success' && <span className="text-white text-lg">✓</span>}
          {alert.type === 'error' && <span className="text-white text-lg">⚠</span>}
          {alert.type === 'warning' && <span className="text-white text-lg">⚠</span>}
          {alert.type === 'info' && <span className="text-white text-lg">ℹ</span>}
        </div>
        <p className="text-white font-18-body-medium">{alert.message}</p>
      </div>
    </div>
  )
}
