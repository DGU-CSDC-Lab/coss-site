interface CheckboxProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Checkbox({
  id,
  checked,
  onChange,
  label,
  className = '',
  size = 'md',
}: CheckboxProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const labelSizeClasses = {
    sm: 'text-caption-12',
    md: 'text-caption-14',
    lg: 'text-body-16-medium',
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className={`
          ${sizeClasses[size]}
          text-info-600 bg-gray-100 border-gray-100 rounded
          focus:ring-info-500 focus:ring-1 cursor-pointer
        `}
      />
      {label && (
        <label
          htmlFor={id}
          className={`text-gray-600 ${labelSizeClasses[size]}`}
        >
          {label}
        </label>
      )}
    </div>
  )
}
