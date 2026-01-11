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
  ChatBubbleLeftRightIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'
import { postsApi } from '@/lib/api/posts'
import { authApi, UserInfoResponse, MigrateAccountRequest } from '@/lib/api/auth'
import PasswordChangeModal from '@/components/admin/PasswordChangeModal'
import { schedulesApi } from '@/lib/api/schedules'
import { facultyApi } from '@/lib/api/faculty'
import { coursesApi } from '@/lib/api/courses'
import { headerAssetsApi } from '@/lib/api/headerAssets'
import { popupsApi } from '@/lib/api/popups'
import { historyApi } from '@/lib/api/history'
import Information from '@/components/common/Information'
import Title from '@/components/common/title/Title'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { useAlert } from '@/hooks/useAlert'
import { useAuthStore } from '@/store'
import { getErrorMessage } from '@/lib/utils/errorHandler'

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
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showMigrateModal, setShowMigrateModal] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null)
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
  const [migrateLoading, setMigrateLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [migrateForm, setMigrateForm] = useState<MigrateAccountRequest>({
    email: '',
    password: '',
  })
  const [migrateError, setMigrateError] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { user, updateUserInfo, updateRole, logout } = useAuthStore()

  const alert = useAlert()

  useEffect(() => {
    fetchStats()
    fetchUserInfo()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [
        postsRes,
        schedulesRes,
        facultyRes,
        coursesRes,
        bannersRes,
        popupsRes,
        historyRes,
        masterCoursesRes,
      ] = await Promise.all([
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

  const fetchUserInfo = async () => {
    try {
      const userInfoRes = await authApi.getUserInfo()
      setUserInfo(userInfoRes)
      updateUserInfo({
        id: userInfoRes.id,
        email: userInfoRes.email,
        username: userInfoRes.username,
      })
      updateRole(
        userInfoRes.role as 'ADMIN' | 'SUPER_ADMIN' | 'ADMINISTRATOR' | null
      )
    } catch (error) {
      alert.error('사용자 정보를 불러오는데 실패했습니다.')
    }
  }

  const handleMigrateAccount = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!migrateForm.email.trim() || !migrateForm.password.trim()) {
      setMigrateError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(migrateForm.email)) {
      setMigrateError('올바른 이메일 형식을 입력해주세요.')
      return
    }

    // 비밀번호 유효성 검사
    if (migrateForm.password.length < 4) {
      setMigrateError('비밀번호는 최소 4자 이상이어야 합니다.')
      return
    }

    setShowConfirmDialog(true)
  }

  const confirmMigrateAccount = async () => {
    setMigrateLoading(true)
    setMigrateError('')

    try {
      await authApi.migrateAccount(migrateForm)
      
      // 로컬스토리지와 스토어 초기화
      localStorage.clear()
      logout()
      
      alert.success('계정 이관이 완료되었습니다. 다시 로그인해주세요.')
      setShowMigrateModal(false)
      setShowConfirmDialog(false)
      setMigrateForm({ email: '', password: '' })
      
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login'
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      if (errorMessage.includes('이미 존재하는 이메일') || errorMessage.includes('Duplicate entry')) {
        setMigrateError('이미 존재하는 이메일입니다.');
      } else {
        setMigrateError(errorMessage);
      }
      setShowConfirmDialog(false)
    } finally {
      setMigrateLoading(false)
    }
  }

  const quickActions = [
    {
      title: '게시글 생성',
      description: '공지, 뉴스 등 게시판 게시글을 생성합니다.',
      icon: DocumentTextIcon,
      href: '/admin/posts/create',
    },
    {
      title: '학사일정 등록',
      description: '캘린더에 들어가는 학사일정을 등록합니다.',
      icon: CalendarIcon,
      href: '/admin/schedules/create',
    },
    {
      title: '참여 교원 등록',
      description: '참여 교원 정보를 추가합니다.',
      icon: UserGroupIcon,
      href: '/admin/faculty/create',
    },
    {
      title: '연혁 등록',
      description: '학과 연혁을 등록합니다.',
      icon: ClockIcon,
      href: '/admin/history/create',
    },
    {
      title: '학기별 개설 과목 생성',
      description: '특정 년도/학기 학기별 개설 과목을 생성합니다.',
      icon: AcademicCapIcon,
      href: '/admin/courses/offering/create',
    },
    {
      title: '학기별 개설 과목 일괄 등록',
      description: 'Excel 파일로 개설 과목을 일괄 등록합니다.',
      icon: AcademicCapIcon,
      href: '/admin/courses/offering/bulk-upload',
    },
    {
      title: '운영 교과목 생성',
      description: '기본 교과목 정보를 생성합니다.',
      icon: BookOpenIcon,
      href: '/admin/courses/master/create',
    },
    {
      title: '운영 교과목 일괄 등록',
      description: 'Excel 파일로 운영 과목을 일괄 등록합니다.',
      icon: BookOpenIcon,
      href: '/admin/courses/master/bulk-upload',
    },
    {
      title: '홈 배너 등록',
      description: '홈 배너 이미지를 등록합니다.',
      icon: PhotoIcon,
      href: '/admin/header-assets/create',
    },
    {
      title: '팝업 등록',
      description: '사이트의 팝업을 등록합니다.',
      icon: SpeakerWaveIcon,
      href: '/admin/popups/create',
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
          name: '교원 관리',
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
          name: '팝업 관리',
          href: '/admin/popups',
          icon: SpeakerWaveIcon,
          count: stats.popups,
        },
      ],
    },
    {
      title: '과목 관리',
      items: [
        {
          name: '운영 과목',
          href: '/admin/courses/master',
          icon: BookOpenIcon,
          count: stats.masterCourses,
        },
        {
          name: '개설 과목',
          href: '/admin/courses/offering',
          icon: AcademicCapIcon,
          count: stats.courses,
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

          {/* SUPER_ADMIN 전용 섹션 */}
          {(userInfo?.role === 'SUPER_ADMIN' ||
            userInfo?.role === 'ADMINISTRATOR') && (
            <div className="bg-white border border-gray-100 rounded-md p-4">
              <div className="text-body-18-medium">
                {superAdminSection.title}
              </div>
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

          {/* 개발자 건의 섹션 */}
          <div className="bg-white border border-gray-100 rounded-md p-4">
            <div className="text-body-18-medium">개발자 지원</div>
            <div className="h-4"></div>
            <hr className="border-t border-gray-200 mb-4" />
            <ul className="space-y-3">
              <li>
                <Link
                  to="/admin/feedback"
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-100 transition-colors w-full"
                >
                  <div className="flex items-center gap-3">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-body-14-medium text-gray-700">
                      개발자에게 건의
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          {/* 계정 관리 섹션 */}
          <div className="bg-white border border-gray-100 rounded-md p-4">
            <div className="text-body-18-medium">내 계정 관리</div>
            <div className="h-4"></div>
            <hr className="border-t border-gray-200 mb-4" />
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-caption-12 text-gray-500 mb-1">이메일</div>
                <div className="text-body-14-medium text-gray-900">
                  {userInfo?.email}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-caption-12 text-gray-500 mb-1">
                  사용자명
                </div>
                <div className="text-body-14-medium text-gray-900">
                  {userInfo?.username || '사용자'}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-caption-12 text-gray-500 mb-1">권한</div>
                <div className="text-body-14-medium text-gray-900">
                  {userInfo?.role === 'ADMINISTRATOR'
                    ? '최고 관리자'
                    : userInfo?.role === 'SUPER_ADMIN'
                      ? '중간 관리자'
                      : userInfo?.role === 'ADMIN'
                        ? '일반 관리자'
                        : '권한 없음'}
                </div>
              </div>
              {userInfo?.role === 'ADMINISTRATOR' && (
                <button
                  onClick={() => setShowMigrateModal(true)}
                  className="w-full p-1 text-caption-12 text-gray-400 hover:text-gray-600 transition-colors"
                  style={{ fontSize: '10px', opacity: 0.3 }}
                >
                  ⚡
                </button>
              )}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full p-2 text-body-14-medium text-point-2 hover:text-point-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                비밀번호 변경
              </button>
            </div>
          </div>
        </div>
      </section>

      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      {/* 계정 이관 모달 */}
      {showMigrateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-heading-20 text-text mb-4">계정 이관</h2>
            
            <form onSubmit={handleMigrateAccount} className="space-y-4">
              <div>
                <Input
                  type="email"
                  value={migrateForm.email}
                  onChange={value => setMigrateForm({ ...migrateForm, email: value })}
                  placeholder="새 이메일"
                  size="lg"
                  className="w-full"
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={migrateForm.password}
                  onChange={value => setMigrateForm({ ...migrateForm, password: value })}
                  placeholder="새 비밀번호"
                  size="lg"
                  className="w-full pr-12"
                />
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  variant="custom"
                  iconOnly
                  icon={
                    showPassword ? (
                      <EyeIcon className="h-5 w-5" />
                    ) : (
                      <EyeSlashIcon className="h-5 w-5" />
                    )
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                />
              </div>

              {migrateError && (
                <p className="text-caption-14 text-error-500 ml-2">{migrateError}</p>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowMigrateModal(false)
                    setMigrateForm({ email: '', password: '' })
                    setMigrateError('')
                    setShowConfirmDialog(false)
                  }}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={migrateLoading}
                  size="lg"
                  variant="point_2"
                  className="flex-1 flex items-center justify-center"
                >
                  {migrateLoading ? <LoadingSpinner size="md" /> : '이관'}
                </Button>
              </div>
            </form>

            {/* 확인 다이얼로그 */}
            {showConfirmDialog && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
                  <h3 className="text-heading-18 text-text mb-4">계정 이관 확인</h3>
                  <p className="text-body-14 text-gray-600 mb-6">
                    계정을 이관하시겠습니까?<br />
                    이 작업은 되돌릴 수 없습니다.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowConfirmDialog(false)}
                      variant="outline"
                      size="md"
                      className="flex-1"
                    >
                      아니오
                    </Button>
                    <Button
                      onClick={confirmMigrateAccount}
                      disabled={migrateLoading}
                      variant="point_2"
                      size="md"
                      className="flex-1 flex items-center justify-center"
                    >
                      {migrateLoading ? <LoadingSpinner size="sm" /> : '예'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
