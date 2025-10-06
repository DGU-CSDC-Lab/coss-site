import { useAlertStore } from '@/store/alert.store'

export const useAlert = () => {
  const { showAlert } = useAlertStore()

  return {
    success: (message: string) => showAlert(message, 'success'),
    error: (message: string) => showAlert(message, 'error'),
    warning: (message: string) => showAlert(message, 'warning'),
    info: (message: string) => showAlert(message, 'info')
  }
}
