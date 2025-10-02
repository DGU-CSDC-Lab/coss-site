import Image from 'next/image'

interface InformationProps {
  type: 'info' | 'warning' | 'error'
  children: React.ReactNode
  className?: string
}

export default function Information({
  type,
  children,
  className = '',
}: InformationProps) {
  const typeStyles = {
    info: {
      bg: 'bg-info-50',
      text: 'text-info-500',
    },
    warning: {
      bg: 'bg-warning-50',
      text: 'text-warning-500',
    },
    error: {
      bg: 'bg-error-50',
      text: 'text-error-500',
    },
  }

  const styles = typeStyles[type]

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${styles.bg} ${className}`}
    >
      <div className={`flex-shrink-0`}>
        <Image
          src={
            type === 'info'
              ? '/assets/icon/info/blue.svg'
              : type === 'warning'
                ? '/assets/icon/info/yellow.svg'
                : '/assets/icon/info/red.svg'
          }
          alt={type}
          width={16}
          height={16}
        />
      </div>
      <div className={`font-caption-14 leading-relaxed ${styles.text}`}>
        {children}
      </div>
    </div>
  )
}
