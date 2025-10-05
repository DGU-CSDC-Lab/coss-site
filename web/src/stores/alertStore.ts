import { create } from 'zustand'

interface Alert {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

interface AlertStore {
  alerts: Alert[]
  addAlert: (type: Alert['type'], message: string) => void
  removeAlert: (id: string) => void
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  addAlert: (type, message) => {
    const id = Date.now().toString()
    set((state) => ({
      alerts: [...state.alerts, { id, type, message }]
    }))
  },
  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id)
    }))
}))
