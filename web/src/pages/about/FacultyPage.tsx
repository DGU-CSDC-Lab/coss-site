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

  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-12">교수진</Title>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div>
          {faculties?.items && faculties.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {faculties.items.map((faculty: any) => (
                <FacultyCard key={faculty.id} faculty={faculty} />
              ))}
            </div>
          ) : (
            <EmptyState message="등록된 교수진이 없습니다." />
          )}
        </div>
      )}
    </div>
  )
}
