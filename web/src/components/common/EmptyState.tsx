interface EmptyStateProps {
  message?: string
  className?: string
}

export default function EmptyState({ 
  message = "검색 결과가 없습니다.", 
  className = "" 
}: EmptyStateProps) {
  return (
    <div className={`text-left text-gray-500 ${className}`}>
      {message}
    </div>
  )
}
