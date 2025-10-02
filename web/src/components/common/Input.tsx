interface InputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'search'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  onKeyPress?: (e: React.KeyboardEvent) => void
  onFocus?: () => void
  onBlur?: () => void
}

export default function Input({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  size = 'md',
  disabled = false,
  className = '',
  onKeyPress,
  onFocus,
  onBlur,
}: InputProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  }

  const baseClasses =
    'rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors'

  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      onKeyPress={onKeyPress}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
    />
  )
}
