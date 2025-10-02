interface SubTitleProps {
  children: React.ReactNode
  className?: string
}

export default function SubTitle({ children, className = '' }: SubTitleProps) {
  return (
    <div className={`${className}`}>
      <h1 className="font-body-20-medium text-gray-900">{children}</h1>
    </div>
  )
}
