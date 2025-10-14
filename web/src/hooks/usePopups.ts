'use client'

import { useState, useEffect } from 'react'
import { popupsApi, PopupResponse } from '@/lib/api/popups'

const POPUP_STORAGE_KEY = 'hiddenPopups'
const POPUP_HIDE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7일

interface HiddenPopup {
  id: string
  hiddenAt: number
}

export const usePopups = () => {
  const [popups, setPopups] = useState<PopupResponse[]>([])
  const [visiblePopups, setVisiblePopups] = useState<PopupResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // 숨겨진 팝업 목록 가져오기
  const getHiddenPopups = (): HiddenPopup[] => {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(POPUP_STORAGE_KEY)
      if (!stored) return []
      
      const hiddenPopups: HiddenPopup[] = JSON.parse(stored)
      const now = Date.now()
      
      // 7일이 지난 항목들 제거
      const validHiddenPopups = hiddenPopups.filter(
        item => now - item.hiddenAt < POPUP_HIDE_DURATION
      )
      
      // 변경된 경우 저장
      if (validHiddenPopups.length !== hiddenPopups.length) {
        localStorage.setItem(POPUP_STORAGE_KEY, JSON.stringify(validHiddenPopups))
      }
      
      return validHiddenPopups
    } catch {
      return []
    }
  }

  // 팝업 숨기기
  const hidePopup = (popupId: string) => {
    const hiddenPopups = getHiddenPopups()
    const newHiddenPopup: HiddenPopup = {
      id: popupId,
      hiddenAt: Date.now()
    }
    
    const updatedHiddenPopups = [
      ...hiddenPopups.filter(item => item.id !== popupId),
      newHiddenPopup
    ]
    
    localStorage.setItem(POPUP_STORAGE_KEY, JSON.stringify(updatedHiddenPopups))
    
    // 현재 보이는 팝업에서 제거
    setVisiblePopups(prev => prev.filter(popup => popup.id !== popupId))
  }

  // 활성 팝업 로드
  const loadActivePopups = async () => {
    try {
      setLoading(true)
      const response = await popupsApi.getActivePopups()
      
      // SuccessResponse에서 data 추출
      const activePopups = Array.isArray(response) ? response : (response as any).data || response
      
      // 현재 날짜에 해당하는 팝업만 필터링
      const now = new Date()
      const currentPopups = activePopups.filter((popup: any) => {
        const startDate = new Date(popup.startDate)
        const endDate = new Date(popup.endDate)
        return now >= startDate && now <= endDate
      })
      
      setPopups(currentPopups)
      
      // 숨겨진 팝업 제외
      const hiddenPopups = getHiddenPopups()
      const hiddenIds = hiddenPopups.map(item => item.id)
      const visiblePopups = currentPopups.filter((popup: any) => !hiddenIds.includes(popup.id))
      
      setVisiblePopups(visiblePopups)
      setShowModal(visiblePopups.length > 0)
    } catch (error) {
      console.error('Failed to load popups:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivePopups()
  }, [])

  return {
    popups,
    visiblePopups,
    loading,
    showModal,
    setShowModal,
    hidePopup,
    refreshPopups: loadActivePopups
  }
}
