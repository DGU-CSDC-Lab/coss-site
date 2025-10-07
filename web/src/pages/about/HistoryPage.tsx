import Title from '@/components/common/title/Title'
import Tabs from '@/components/tabs/Tabs'
import { useQuery } from '@tanstack/react-query'
import { historyApi } from '@/lib/api/history'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'

export default function HistoryPage() {
  const { data: histories, isLoading } = useQuery({
    queryKey: ['histories'],
    queryFn: () => historyApi.getHistory(),
  })

  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-12">연혁</Title>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-8">
          {histories?.items && histories.items.length > 0 ? (
            histories.items.map((history: any) => (
              <div key={history.id} className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-xl text-semibold text-gray-900 mb-2">
                  {history.year}년 {history.month}월
                </h3>
                <p className="text-gray-700">{history.content}</p>
              </div>
            ))
          ) : (
            <EmptyState message="등록된 연혁이 없습니다." />
          )}
        </div>
      )}
    </div>
  )
}
