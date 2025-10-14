import { usePopups } from '@/hooks/usePopups'
import PopupModal from '@/components/popup/PopupModal'

export default function PopupProvider() {
  const { visiblePopups, showModal, setShowModal, hidePopup } = usePopups()

  if (!showModal || visiblePopups.length === 0) return null

  return (
    <PopupModal
      popups={visiblePopups}
      onClose={() => setShowModal(false)}
      onDontShowAgain={hidePopup}
    />
  )
}
