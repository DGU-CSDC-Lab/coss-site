interface TitleProps {
  children: React.ReactNode
  className?: string
}

export default function Title({ children, className = '' }: TitleProps) {
  return (
    <div className={`${className}`}>
      <div className="w-14 h-2 bg-point-1"></div>
      <h1 className="font-body-20-medium text-gray-900 mt-2">{children}</h1>
    </div>
  )
}
