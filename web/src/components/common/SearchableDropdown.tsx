import { useState, useEffect, useRef } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface Option {
  value: string
  label: string
}

interface SearchableDropdownProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  placeholder?: string
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function SearchableDropdown({
  options,
  value,
  onChange,
  onSearch,
  placeholder = '검색하여 선택하세요',
  loading = false,
  size = 'md',
  className = '',
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastSearchQuery, setLastSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'px-2 py-1.5 text-caption-12',
    md: 'px-3 py-2 text-caption-14',
    lg: 'px-4 py-3 text-body-14-regular',
  }

  const baseClasses =
    'rounded-md bg-white ring-1 ring-gray-100 focus:outline-none focus:ring-1 focus:bg-gray-100 transition-colors cursor-pointer'

  const selectedOption = options.find(option => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedQuery = searchQuery.trim()
      if (trimmedQuery !== lastSearchQuery) {
        setLastSearchQuery(trimmedQuery)
        onSearch(trimmedQuery)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, lastSearchQuery, onSearch])

  const handleSelect = (option: Option) => {
    onChange(option.value)
    setIsOpen(false)
    setSearchQuery('')
    setLastSearchQuery('')
  }

  const handleInputClick = () => {
    setIsOpen(true)
    // 선택된 값이 있으면 검색어로 설정하여 수정 가능하게 함
    if (selectedOption && !searchQuery) {
      setSearchQuery(selectedOption.label)
    }
    if (!searchQuery && options.length === 0 && lastSearchQuery === '') {
      onSearch('')
      setLastSearchQuery('')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const displayValue = selectedOption ? selectedOption.label : searchQuery

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`${baseClasses} ${sizeClasses[size]} ${className} w-full flex items-center justify-between gap-2`}
        onClick={handleInputClick}
      >
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`flex-1 bg-transparent border-none outline-none ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}
        />
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white ring-1 ring-gray-100 rounded-md max-h-60 overflow-auto">
          {loading ? (
            <div className={`${sizeClasses[size]} text-gray-500 text-center`}>
              검색 중...
            </div>
          ) : options.length === 0 ? (
            <div className={`${sizeClasses[size]} text-gray-500 text-center`}>
              {searchQuery ? '검색 결과가 없습니다' : '검색어를 입력하세요'}
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full ${sizeClasses[size]} text-left hover:bg-gray-100 transition-colors ${
                  value === option.value
                    ? 'bg-gray-50 text-gray-900'
                    : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
