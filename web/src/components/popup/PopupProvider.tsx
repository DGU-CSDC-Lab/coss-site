import { useLocation } from 'react-router-dom'
import { usePopups } from '@/hooks/usePopups'
import PopupModal from '@/components/popup/PopupModal'

export default function PopupProvider() {
  const { visiblePopups, showModal, setShowModal, hidePopup } = usePopups()

  if (!showModal || visiblePopups.length === 0) return null

  // "/" 경로에서만 표시
  const isHomePage = location.pathname === '/'

  if (!isHomePage || !showModal || visiblePopups.length === 0) return null

  return (
    <PopupModal
      popups={visiblePopups}
      onClose={() => setShowModal(false)}
      onDontShowAgain={hidePopup}
    />
  )
}
