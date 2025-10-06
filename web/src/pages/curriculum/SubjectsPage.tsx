import Title from '@/components/common/Title'
import Tabs from '@/components/tabs/Tabs'
import { useQuery } from '@tanstack/react-query'
import { coursesApi } from '@/lib/api/courses'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function SubjectsPage() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getCourses(),
  })

  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-12">교과목 소개</Title>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {courses?.items?.map((course: any) => (
            <div key={course.id} className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{course.name}</h3>
              <p className="text-gray-600 mb-2">학점: {course.credits}</p>
              <p className="text-gray-700">{course.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
