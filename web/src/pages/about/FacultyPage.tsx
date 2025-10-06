import Title from '@/components/common/Title'
import Tabs from '@/components/tabs/Tabs'
import FacultyCard from '@/components/faculty/FacultyCard'
import { useQuery } from '@tanstack/react-query'
import { facultyApi } from '@/lib/api/faculty'
import LoadingSpinner from '@/components/common/LoadingSpinner'

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculties?.items?.map((faculty: any) => (
            <FacultyCard key={faculty.id} faculty={faculty} />
          ))}
        </div>
      )}
    </div>
  )
}
