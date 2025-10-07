interface LabelProps {
  children: React.ReactNode
  required?: boolean
  optional?: boolean
  className?: string
  htmlFor?: string
}

export default function Label({
  children,
  required = false,
  optional = false,
  className = '',
  htmlFor,
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-body-16-medium text-text ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
      {optional && <span className="text-gray-400 ml-1">(선택)</span>}
    </label>
  )
}
