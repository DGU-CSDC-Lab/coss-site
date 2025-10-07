import { useState } from 'react'
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { PopupResponse } from '@/lib/api/popups'
import Button from '@/components/common/Button'
import Checkbox from '@/components/common/Checkbox'

interface PopupModalProps {
  popups: PopupResponse[]
  onClose: () => void
  onDontShowAgain: (popupId: string) => void
}

export default function PopupModal({
  popups,
  onClose,
  onDontShowAgain,
}: PopupModalProps) {
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="max-w-xl w-full mx-4 overflow-hidden relative">
        {/* X Button at top of modal */}
        <div className="flex w-full items-center justify-end">
        <Button
          onClick={handleClose}
          iconOnly
          icon={<XMarkIcon className="w-8 h-8" />}
          variant="custom"
          className="text-white text-opacity-60 hover:text-opacity-80 p-2"
        />
        </div>

        {/* Large Image Area */}
        <div className="relative">
          {currentPopup.imageUrl && (
            <img
              src={currentPopup.imageUrl}
              alt={currentPopup.title}
              className="w-full h-auto"
            />
          )}

          {/* Navigation buttons for multiple popups */}
          {popups.length > 1 && (
            <>
              <Button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                iconOnly
                icon={<ChevronLeftIcon className="w-6 h-6" />}
                variant="unstyled"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
              />
              <Button
                onClick={handleNext}
                disabled={currentIndex === popups.length - 1}
                iconOnly
                icon={<ChevronRightIcon className="w-6 h-6" />}
                variant="unstyled"
                className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {popups.length}
              </div>
            </>
          )}
        </div>

        {/* Minimal Text Area */}
        <div className="bg-white p-4">
          <div className="text-caption-14 text-gray-600">
            <p className="whitespace-pre-wrap">
              {currentPopup.content}
            </p>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="flex items-center justify-between p-4 bg-white">
          <Checkbox
            checked={dontShowAgain}
            onChange={setDontShowAgain}
            label="7일간 보지 않기"
            size="md"
            className="text-gray-600 select-none"
          />

          <div className="flex items-center">
            {currentPopup.linkUrl && (
              <a
                href={currentPopup.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 text-caption-14 select-none"
              >
                자세히 보기
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
