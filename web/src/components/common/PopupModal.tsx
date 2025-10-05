'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { PopupResponse } from '@/lib/api/popups'
import Button from './Button'

interface PopupModalProps {
  popups: PopupResponse[]
  onClose: () => void
  onDontShowAgain: (popupId: string) => void
}

export default function PopupModal({ popups, onClose, onDontShowAgain }: PopupModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  if (popups.length === 0) return null

  const currentPopup = popups[currentIndex]

  const handleNext = () => {
    if (currentIndex < popups.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setDontShowAgain(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setDontShowAgain(false)
    }
  }

  const handleClose = () => {
    if (dontShowAgain) {
      onDontShowAgain(currentPopup.id)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full mx-4 shadow-2xl border-2 border-gray-300">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            {popups.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-600 px-2">
                  {currentIndex + 1} / {popups.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === popups.length - 1}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <button 
            onClick={handleClose} 
            className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-800"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4 text-center">{currentPopup.title}</h2>
          
          {currentPopup.imageUrl && (
            <div className="mb-4 text-center">
              <img
                src={currentPopup.imageUrl}
                alt={currentPopup.title}
                className="max-w-full h-auto rounded border mx-auto"
                style={{ maxHeight: '300px' }}
              />
            </div>
          )}

          <div className="text-sm leading-relaxed text-gray-700 mb-4">
            <p className="whitespace-pre-wrap">{currentPopup.content}</p>
          </div>

          {currentPopup.linkUrl && (
            <div className="text-center mb-4">
              <a
                href={currentPopup.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                자세히 보기
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-lg">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-gray-300"
            />
            7일간 보지 않기
          </label>
          
          <div className="flex gap-2">
            {popups.length > 1 && currentIndex < popups.length - 1 && (
              <Button variant="info" size="sm" onClick={handleNext}>
                다음
              </Button>
            )}
            <Button variant="cancel" size="sm" onClick={handleClose}>
              닫기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
