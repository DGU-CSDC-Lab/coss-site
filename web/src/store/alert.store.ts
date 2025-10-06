import { create } from 'zustand'

interface AlertState {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  isVisible: boolean
  showAlert: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
  hideAlert: () => void
}

export const useAlertStore = create<AlertState>((set) => ({
  message: '',
  type: 'info',
  isVisible: false,
  showAlert: (message, type = 'info') =>
    set({ message, type, isVisible: true }),
  hideAlert: () => set({ isVisible: false }),
}))
