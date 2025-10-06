import { useNavigate } from 'react-router-dom'

export default function AdminCoursesPage() {
  const navigate = useNavigate()
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">개설과목 관리</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/courses/create')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            과목 추가
          </button>
          <button
            onClick={() => navigate('/admin/courses/bulk-upload')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            일괄 업로드
          </button>
        </div>
      </div>
      <div className="text-center py-8">
        <p className="text-gray-600">개설과목 관리 페이지입니다.</p>
      </div>
    </div>
  )
}
