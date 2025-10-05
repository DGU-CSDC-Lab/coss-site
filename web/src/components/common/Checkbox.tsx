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
    sm: 'font-body-14-medium',
    md: 'font-body-16-medium',
    lg: 'font-body-18-medium',
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className={`
          ${sizeClasses[size]}
          text-blue-600 bg-gray-100 border-gray-300 rounded
          focus:ring-blue-500 focus:ring-2
        `}
      />
      {label && (
        <label
          htmlFor={id}
          className={`text-gray-900 cursor-pointer ${labelSizeClasses[size]}`}
        >
          {label}
        </label>
      )}
    </div>
  )
}
