import { Link } from 'react-router-dom'
import { Faculty } from '@/lib/api/faculty'


interface FacultyCardProps {
  faculty: Faculty
}

export default function FacultyCard({ faculty }: FacultyCardProps) {
  return (
    <div className="transition-all flex gap-6 items-start">
      {/* 프로필 이미지 */}
      <div className="flex-shrink-0 aspect-[3/4] w-48 bg-gray-100 relative overflow-hidden self-start">
        {faculty.profileImageUrl ? (
          <img
            src={faculty.profileImageUrl}
            alt={faculty.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <span className="text-caption-12 text-gray-400">사진 없음</span>
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="flex-1 flex flex-col justify-start">
        <h3 className="text-body-20-medium text-gray-900">{faculty.name}</h3>
        <div className="h-4" />
        <div className="space-y-1 text-gray-600">
          <p className="text-body-14-regular text-gray-500">
            {faculty.jobTitle}
          </p>
          <p className="text-body-14-regular text-gray-500 break-all">{faculty.email}</p>
          <p className="text-body-14-regular text-gray-500">
            {faculty.phoneNumber}
          </p>
          <p className="text-body-14-regular text-gray-500 break-all">{faculty.office}</p>
        </div>
        {/** 
        <div className="h-4" />
        <Link
          to={`/about/faculty/${faculty.id}`}
          className="inline-flex items-center gap-2 text-info-500 hover:text-info-600 text-caption-14 underline underline-offset-2 transition-colors"
        >
          more information
        </Link>
              */}
      </div>
    </div>
  )
}
