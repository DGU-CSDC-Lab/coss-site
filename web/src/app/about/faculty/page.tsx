'use client'

import { useState, useEffect } from 'react'
import { facultyApi, Faculty } from '@/lib/api/faculty'
import Title from '@/components/common/Title'
import FacultyCard from '@/components/faculty/FacultyCard'
import Tabs from '@/components/tabs/Tabs'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const response = await facultyApi.getFaculty()
      setFaculty(response.items)
    } catch (error) {
      console.error('Failed to fetch faculty:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-12">참여 교원</Title>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-y-12">
        {faculty.map(member => (
          <FacultyCard key={member.id} faculty={member} />
        ))}
      </div>

      {faculty.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          등록된 교원 정보가 없습니다.
        </div>
      )}
    </div>
  )
}
