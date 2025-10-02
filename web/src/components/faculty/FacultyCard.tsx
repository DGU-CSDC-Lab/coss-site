import Link from 'next/link'
import { Faculty } from '@/lib/api/faculty'
import Image from 'next/image'

interface FacultyCardProps {
  faculty: Faculty
}

export default function FacultyCard({ faculty }: FacultyCardProps) {
  return (
    <div className="transition-all flex gap-6 items-start">
      {/* 프로필 이미지 */}
      <div className="flex-shrink-0 aspect-[3/4] w-32 bg-gray-100 relative overflow-hidden self-start">
        {faculty.profileImage ? (
          <Image
            src={faculty.profileImage}
            alt={faculty.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 128px"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <span className="font-caption-12 text-gray-400">사진 없음</span>
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="flex-1 flex flex-col justify-start">
        <h3 className="font-body-20-medium text-gray-900">{faculty.name}</h3>
        <div className="h-4" />
        <div className="space-y-1 text-gray-600">
          <p className="font-caption-14 text-gray-500">{faculty.jobTitle}</p>
          <p className="font-caption-14">{faculty.email}</p>
          <p className="font-caption-14">{faculty.phoneNumber}</p>
          <p className="font-caption-14">{faculty.office}</p>
        </div>
        {/** 
        <div className="h-4" />
        <Link
          href={`/about/faculty/${faculty.id}`}
          className="inline-flex items-center gap-2 text-info-500 hover:text-info-600 font-caption-14 underline underline-offset-2 transition-colors"
        >
          more information
        </Link>
              */}
      </div>
    </div>
  )
}
