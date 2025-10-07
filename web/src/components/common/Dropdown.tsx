'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

interface DropdownProps {
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = '선택하세요',
  size = 'md',
  disabled = false,
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const sizeClasses = {
    sm: 'px-2 py-1.5 text-caption-12',
    md: 'px-3 py-2 text-caption-14',
    lg: 'px-4 py-3 text-body-14-regular',
  }

  const baseClasses =
    'rounded-md bg-white ring-1 ring-gray-100 focus:outline-none focus:ring-1 focus:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors cursor-pointer'

  const selectedOption = options.find(option => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`${baseClasses} ${sizeClasses[size]} ${className} w-full text-left flex items-center justify-between gap-2`}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white ring-1 ring-gray-100 rounded-md ring-1 max-h-60 overflow-auto">
          {options.slice(1).map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => !option.disabled && handleSelect(option.value)}
              disabled={option.disabled}
              className={`w-full ${sizeClasses[size]} text-left hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors ${
                value === option.value
                  ? 'bg-gray-50 text-gray-900'
                  : 'text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
