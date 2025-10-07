interface EmptyStateProps {
  message?: string
  className?: string
}

export default function EmptyState({ 
  message = "검색 결과가 없습니다.", 
  className = "" 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-10 text-gray-500 ${className}`}>
      {message}
    </div>
  )
}
