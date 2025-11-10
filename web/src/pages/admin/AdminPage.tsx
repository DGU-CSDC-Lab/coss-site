import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  PhotoIcon,
  AcademicCapIcon,
  ChevronRightIcon,
  SpeakerWaveIcon,
  ClockIcon,
  BookOpenIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { postsApi } from '@/lib/api/posts'
import PasswordChangeModal from '@/components/admin/PasswordChangeModal'
import { schedulesApi } from '@/lib/api/schedules'
import { facultyApi } from '@/lib/api/faculty'
import { coursesApi } from '@/lib/api/courses'
import { headerAssetsApi } from '@/lib/api/headerAssets'
import { popupsApi } from '@/lib/api/popups'
import { historyApi } from '@/lib/api/history'
import { useAuthStore } from '@/store/auth.store'
import Information from '@/components/common/Information'
import Title from '@/components/common/title/Title'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import { useAlert } from '@/hooks/useAlert'

interface DashboardStats {
  posts: number
  schedules: number
  faculty: number
  courses: number
  banners: number
  popups: number
  history: number
  masterCourses: number
}

export default function AdminPage() {
  const { user, role } = useAuthStore()
  const isSuperAdmin = role === 'SUPER_ADMIN'
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    posts: 0,
    schedules: 0,
    faculty: 0,
    courses: 0,
    banners: 0,
    popups: 0,
    history: 0,
    masterCourses: 0,
  })
  const [loading, setLoading] = useState(true)

  const alert = useAlert()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [postsRes, schedulesRes, facultyRes, coursesRes, bannersRes, popupsRes, historyRes, masterCoursesRes] =
        await Promise.all([
          postsApi.getAdminPosts({ page: 1, size: 1 }),
          schedulesApi.getSchedules({ page: 1, size: 1 }),
          facultyApi.getFaculty({ page: 1, size: 1 }),
          coursesApi.getOfferings({ page: 1, size: 1 }),
          headerAssetsApi.getHeaderAssets({ page: 1, size: 1 }),
          popupsApi.getPopups({ page: 1, size: 1 }),
          historyApi.getHistory({ page: 1, size: 1 }),
          coursesApi.getMasters({ page: 1, size: 1 }),
        ])

      setStats({
        posts: postsRes.meta.totalElements,
        schedules: schedulesRes.meta.totalElements,
        faculty: facultyRes.meta.totalElements,
        courses: coursesRes.meta.totalElements,
        banners: bannersRes.meta.totalElements,
        popups: (popupsRes as any).meta.totalElements,
        history: historyRes.meta.totalElements,
        masterCourses: masterCoursesRes.meta.totalElements,
      })
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: '게시글 등록',
      description: '공지사항 및 소식을 등록합니다.',
      icon: DocumentTextIcon,
      href: '/admin/posts/create',
    },
    {
      title: '학사일정 등록',
      description: '학사일정을 관리합니다.',
      icon: CalendarIcon,
      href: '/admin/schedules/create',
    },
    {
      title: '교수진 등록',
      description: '교수진 정보를 추가합니다.',
      icon: UserGroupIcon,
      href: '/admin/faculty/create',
    },
    {
      title: '팝업 등록',
      description: '사이트 팝업을 등록합니다.',
      icon: SpeakerWaveIcon,
      href: '/admin/popups/create',
    },
    {
      title: '개설과목 등록',
      description: '특정 년도/학기 개설과목을 등록합니다.',
      icon: AcademicCapIcon,
      href: '/admin/courses/offering/create',
    },
    {
      title: '마스터과목 등록',
      description: '기본 교과목 정보를 등록합니다.',
      icon: BookOpenIcon,
      href: '/admin/courses/master/create',
    },
    {
      title: '개설과목 일괄등록',
      description: 'Excel 파일로 개설과목을 일괄 등록합니다.',
      icon: AcademicCapIcon,
      href: '/admin/courses/offering/bulk-upload',
    },
    {
      title: '마스터과목 일괄등록',
      description: 'Excel 파일로 마스터과목을 일괄 등록합니다.',
      icon: BookOpenIcon,
      href: '/admin/courses/master/bulk-upload',
    },
    {
      title: '연혁 등록',
      description: '학과 연혁을 등록합니다.',
      icon: ClockIcon,
      href: '/admin/history/create',
    },
    {
      title: '배너 생성',
      description: '메인 배너 이미지를 생성합니다.',
      icon: PhotoIcon,
      href: '/admin/header-assets/create',
    },
  ]

  const managementSections = [
    {
      title: '콘텐츠 관리',
      items: [
        {
          name: '게시글 관리',
          href: '/admin/posts',
          icon: DocumentTextIcon,
          count: stats.posts,
        },
        {
          name: '학사일정 관리',
          href: '/admin/schedules',
          icon: CalendarIcon,
          count: stats.schedules,
        },
        {
          name: '교수진 관리',
          href: '/admin/faculty',
          icon: UserGroupIcon,
          count: stats.faculty,
        },
        {
          name: '연혁 관리',
          href: '/admin/history',
          icon: ClockIcon,
          count: stats.history,
        },
        {
          name: '팝업 관리',
          href: '/admin/popups',
          icon: SpeakerWaveIcon,
          count: stats.popups,
        },
      ],
    },
    {
      title: '사이트 관리',
      items: [
        {
          name: '헤더 배너',
          href: '/admin/header-assets',
          icon: PhotoIcon,
          count: stats.banners,
        },
        {
          name: '개설과목',
          href: '/admin/courses/offering',
          icon: AcademicCapIcon,
          count: stats.courses,
        },
        {
          name: '마스터과목',
          href: '/admin/courses/master',
          icon: BookOpenIcon,
          count: stats.masterCourses,
        },
      ],
    },
  ]

  // SUPER_ADMIN 전용 관리 섹션
  const superAdminSection = {
    title: '시스템 관리',
    items: [
      {
        name: '관리자 관리',
        href: '/admin/users',
        icon: ShieldCheckIcon,
        count: 0, // 필요시 API로 가져올 수 있음
      },
    ],
  }

  return (
    <div className="w-full">
      {/* Header */}
      <Information type="info" className="mb-8">
        학과 홈페이지 콘텐츠 및 정보를 관리합니다.
      </Information>

      {/* Quick Actions */}
      <section className="mb-14">
        <Title className="mb-4">등록 기능</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map(action => (
            <Link
              key={action.title}
              to={action.href}
              className="bg-white hover: bg-gray-100 border border-gray-100 rounded-md p-5 hover:bg-gray-100 transition-colors w-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <action.icon className="w-6 h-6 text-gray-600" />
                <h3 className="text-body-14-medium text-gray-900">
                  {action.title}
                </h3>
              </div>
              <p className="text-caption-14 text-gray-600 leading-snug">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Management Sections */}
      <section>
        <Title className="mb-4">관리 기능</Title>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {managementSections.map(section => (
            <div
              key={section.title}
              className="bg-white border border-gray-100 rounded-md p-4"
            >
              <div className="text-body-18-medium">{section.title}</div>
              <div className="h-4"></div>
              <hr className="border-t border-gray-200 mb-4" />
              <ul className="space-y-3">
                {section.items.map(item => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-100 transition-colors w-full"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-gray-400" />
                        <span className="text-body-14-medium text-gray-700">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {loading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <span className="text-caption-14 text-pri-800 p-2">
                            {item.count}
                          </span>
                        )}
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 계정 관리 섹션 */}
          <div className="bg-white border border-gray-100 rounded-md p-4">
            <div className="text-body-18-medium">계정 관리</div>
            <div className="h-4"></div>
            <hr className="border-t border-gray-200 mb-4" />
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-caption-12 text-gray-500 mb-1">이메일</div>
                <div className="text-body-14-medium text-gray-900">{user?.email}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-caption-12 text-gray-500 mb-1">사용자명</div>
                <div className="text-body-14-medium text-gray-900">{user?.username || '사용자'}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-caption-12 text-gray-500 mb-1">권한</div>
                <div className="text-body-14-medium text-gray-900">
                  {role === 'SUPER_ADMIN' ? '최고 관리자' : '관리자'}
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full p-2 text-body-14-medium text-pri-600 hover:text-pri-700 hover:bg-pri-50 rounded-md transition-colors"
              >
                비밀번호 변경
              </button>
            </div>
          </div>
          
          {/* SUPER_ADMIN 전용 섹션 */}
          {isSuperAdmin && (
            <div className="bg-white border border-gray-100 rounded-md p-4">
              <div className="text-body-18-medium">{superAdminSection.title}</div>
              <div className="h-4"></div>
              <hr className="border-t border-gray-200 mb-4" />
              <ul className="space-y-3">
                {superAdminSection.items.map(item => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-100 transition-colors w-full"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-gray-400" />
                        <span className="text-body-14-medium text-gray-700">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-caption-14 text-pri-800 p-2">
                          {item.count}
                        </span>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  )
}
