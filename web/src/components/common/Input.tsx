interface InputProps {
  value?: string
  fileUrl?: string
  onChange?: (value: string) => void
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'search'
    | 'number'
    | 'tel'
    | 'url'
    | 'file'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  required?: boolean
  min?: string
  max?: string
  step?: string
  accept?: string
  className?: string
  onKeyPress?: (e: React.KeyboardEvent) => void
  onFocus?: () => void
  onBlur?: () => void
}

export default function Input({
  value = '',
  fileUrl = '',
  onChange,
  onFileChange,
  placeholder = '',
  type = 'text',
  size = 'md',
  disabled = false,
  required = false,
  min,
  max,
  step,
  accept,
  className = '',
  onKeyPress,
  onFocus,
  onBlur,
}: InputProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-caption-12',
    md: 'px-4 py-2 text-caption-14',
    lg: 'px-5 py-3 text-body-14-regular',
  }

  const baseClasses =
    'rounded-md bg-white hover:bg-gray-100 placeholder:text-gray-400 ring-inset ring-1 ring-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors'

  {
    /* 파일 입력일 경우 */
  }
  if (type === 'file') {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={e => {
              const file = e.target.files?.[0]
              onChange?.(file ? file.name : '')
              onFileChange?.(e)
            }}
            disabled={disabled}
            required={required}
            onFocus={onFocus}
            onBlur={onBlur}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <button
            type="button"
            className={`${baseClasses} ${sizeClasses[size]}`}
          >
            파일 선택
          </button>
        </div>
        <span className="text-body-14-regular text-gray-600">
          {value ? (
            <a
              href={fileUrl}
              download
              className="text-info-600 hover:text-info-800 underline"
            >
              {value}
            </a>
          ) : (
            '선택된 파일 없음'
          )}
        </span>
      </div>
    )
  }

  {
    /* 파일 입력이 아닌 경우 */
  }
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      min={min}
      max={max}
      step={step}
      onKeyPress={onKeyPress}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
    />
  )
}
