import { useState, useEffect } from 'react'

interface UseUnsavedChangesProps {
  hasChanges: boolean
  onSaveDraft?: () => Promise<void>
}

export function useUnsavedChanges({ hasChanges, onSaveDraft }: UseUnsavedChangesProps) {
  const [showExitModal, setShowExitModal] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)

  const handleExit = (navigateCallback: () => void) => {
    if (hasChanges) {
      setPendingNavigation(() => navigateCallback)
      setShowExitModal(true)
    } else {
      navigateCallback()
    }
  }

  const confirmExit = () => {
    setShowExitModal(false)
    if (pendingNavigation) {
      pendingNavigation()
      setPendingNavigation(null)
    }
  }

  const cancelExit = () => {
    setShowExitModal(false)
    setPendingNavigation(null)
  }

  const saveDraftAndExit = async () => {
    if (onSaveDraft) {
      await onSaveDraft()
    }
    confirmExit()
  }

  return {
    showExitModal,
    handleExit,
    confirmExit,
    cancelExit,
    saveDraftAndExit,
  }
}
