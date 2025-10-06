import { useParams } from 'react-router-dom'
import Tabs from '@/components/tabs/Tabs'

export default function CategoryPage() {
  const { category } = useParams()
  
  return (
    <div className="w-full">
      <Tabs />
      <div className="text-center py-8">
        <p className="text-gray-600">{category} 카테고리 페이지입니다.</p>
      </div>
    </div>
  )
}
