import Button from '@/components/common/Button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="w-full">
      <div className="text-center">
        <h2 className="font-body-18-medium text-gray-500 mb-4">
          요청하신 페이지를 찾을 수 없습니다.
        </h2>
        <div className="h-8" />
        <Link href="/">
          <Button variant="point_2" radius="md" size="lg">
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  )
}
