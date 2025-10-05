interface TextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  required?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  className = '',
  size = 'md',
}: TextareaProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 font-caption-12',
    md: 'px-4 py-2 font-caption-14',
    lg: 'px-5 py-3 font-body-14-medium',
  }

  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className={`
        w-full border border-gray-100 rounded-md text-gray-900 resize-vertical
        focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-transparent
        ${sizeClasses[size]}
        ${className}
      `}
    />
  )
}
