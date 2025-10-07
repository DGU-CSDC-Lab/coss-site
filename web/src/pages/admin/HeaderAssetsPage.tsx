import { useNavigate } from 'react-router-dom'

export default function AdminHeaderAssetsPage() {
  const navigate = useNavigate()
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-bold">헤더 배너 관리</h1>
        <button
          onClick={() => navigate('/admin/header-assets/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          배너 추가
        </button>
      </div>
      <div className="text-center py-8">
        <p className="text-gray-600">헤더 배너 관리 페이지입니다.</p>
      </div>
    </div>
  )
}
