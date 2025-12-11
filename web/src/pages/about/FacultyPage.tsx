import Title from '@/components/common/title/Title'
import Tabs from '@/components/tabs/Tabs'
import FacultyCard from '@/components/faculty/FacultyCard'
import { useQuery } from '@tanstack/react-query'
import { facultyApi } from '@/lib/api/faculty'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'

export default function FacultyPage() {
  const { data: faculties, isLoading } = useQuery({
    queryKey: ['faculties'],
    queryFn: () => facultyApi.getFaculty(),
  })

  const groupedFaculties = faculties?.items?.reduce((groups: any, faculty: any) => {
    const jobTitle = faculty.jobTitle || '기타'
    if (!groups[jobTitle]) {
      groups[jobTitle] = []
    }
    groups[jobTitle].push(faculty)
    return groups
  }, {})

  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-12">참여 교원</Title>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div>
          {groupedFaculties && Object.keys(groupedFaculties).length > 0 ? (
            <div className="space-y-12">
              {Object.entries(groupedFaculties).map(([jobTitle, facultyList]: [string, any]) => (
                <div key={jobTitle}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">{jobTitle}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    {facultyList.map((faculty: any) => (
                      <FacultyCard key={faculty.id} faculty={faculty} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="등록된 참여 교원이 없습니다." />
          )}
        </div>
      )}
    </div>
  )
}
