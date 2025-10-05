import { useAlertStore } from '@/stores/alertStore'

export const useAlert = () => {
  const { addAlert } = useAlertStore()

  return {
    success: (message: string) => addAlert('success', message),
    error: (message: string) => addAlert('error', message),
    warning: (message: string) => addAlert('warning', message),
    info: (message: string) => addAlert('info', message)
  }
}
