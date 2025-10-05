interface DateInputProps {
  type?: 'date' | 'datetime-local' | 'time'
  value: string
  onChange: (value: string) => void
  required?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function DateInput({
  type = 'date',
  value,
  onChange,
  required = false,
  className = '',
  size = 'md',
}: DateInputProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 font-body-14-medium',
    md: 'px-4 py-2 font-body-16-medium',
    lg: 'px-5 py-3 font-body-18-medium',
  }

  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`
        w-full border border-gray-200 rounded-md text-gray-900 placeholder:text-gray-400 hover:bg-gray-100
        focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent
        ${sizeClasses[size]}
        ${className}
      `}
    />
  )
}
