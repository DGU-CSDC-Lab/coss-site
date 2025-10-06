import { useParams } from 'react-router-dom'

export default function AdminPopupsEditPage() {
  const { id } = useParams()
  
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">팝업 수정</h1>
      <div className="text-center py-8">
        <p className="text-gray-600">팝업 수정 페이지입니다. (ID: {id})</p>
      </div>
    </div>
  )
}
