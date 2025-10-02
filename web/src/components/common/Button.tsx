import Image from 'next/image'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'point_2' | 'info' | 'outline'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  iconUrl?: string
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({
  children,
  onClick,
  size = 'md',
  variant = 'point_2',
  radius = 'full',
  iconUrl,
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variantClasses = {
    point_2: 'bg-point-2 text-white hover:bg-gray-600',
    info: 'bg-info-600 text-white hover:bg-info-800',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  }

  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }

  const baseClasses =
    'font-medium transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${radiusClasses[radius]} ${className}`}
    >
      <div className="flex items-center gap-2">
        <span>{children}</span>
        {iconUrl && (
          <Image
            src={iconUrl}
            alt=""
            width={16}
            height={16}
            className="flex-shrink-0"
          />
        )}
      </div>
    </button>
  )
}
