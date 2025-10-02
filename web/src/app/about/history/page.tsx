'use client'

import { useState, useEffect } from 'react'
import { historyApi, History } from '@/lib/api/history'
import Title from '@/components/common/Title'
import Tabs from '@/components/tabs/Tabs'

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState<History[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await historyApi.getHistory({ sort: 'desc' })
      setHistoryData(response.items)
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  // 연도별로 그룹화
  const groupedHistory = historyData.reduce(
    (acc, item) => {
      if (!acc[item.year]) {
        acc[item.year] = []
      }
      acc[item.year].push(item)
      return acc
    },
    {} as Record<number, History[]>
  )

  if (loading) {
    return <div className="flex justify-center py-8">로딩 중...</div>
  }

  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-12">연혁</Title>
      {/* 연혁 목록 */}
      <div className="flex flex-col gap-4">
        {Object.entries(groupedHistory)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([year, items]) => (
            <div
              key={year}
              className="flex items-center p-4 gap-8 justify-center bg-white rounded-lg"
            >
              {/* 연도 */}
              <div className="font-body-24-medium text-gray-800 min-w-[80px] text-center">
                {year}
              </div>

              {/* 연혁 내용 */}
              <div className="flex-1 flex flex-col justify-center gap-2">
                {items
                  .sort((a, b) => b.month - a.month)
                  .map(item => (
                    <div key={item.id}>
                      <h3 className="font-body-18-regular text-gray-500">
                        {item.title}
                      </h3>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
