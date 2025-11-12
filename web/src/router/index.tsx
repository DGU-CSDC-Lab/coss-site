import { createBrowserRouter } from 'react-router-dom'
import ConditionalLayout from '@/components/layout/ConditionalLayout'

// Pages
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import SetPasswordPage from '@/pages/auth/SetPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import NotFoundPage from '@/pages/NotFoundPage'

// About pages
import AboutGreetingPage from '@/pages/about/GreetingPage'
import AboutIntroductionPage from '@/pages/about/IntroductionPage'
import AboutHistoryPage from '@/pages/about/HistoryPage'
import AboutFacultyPage from '@/pages/about/FacultyPage'
import AboutSchedulePage from '@/pages/about/SchedulePage'

// Curriculum pages
import CurriculumSubjectsOfferedPage from '@/pages/curriculum/subjects/OfferingSubjectsPage'
import CurriculumSubjectsSemesterPage from '@/pages/curriculum/subjects/MasterSubjectPage'
import CurriculumSubjectsPage from '@/pages/curriculum/SubjectsPage'
import CurriculumMajorPage from '@/pages/curriculum/MajorPage'
import CurriculumMicrodegreePage from '@/pages/curriculum/MicrodegreePage'
import CurriculumCoursesPage from '@/pages/curriculum/CoursesPage'

// News pages
import NewsPage from '@/pages/news/NewsPage'
import NewsDetailPage from '@/pages/news/DetailPage'

// Support pages
import SupportPage from '@/pages/support/SupportPage'
import SupportScholarshipPage from '@/pages/support/ScholarshipPage'
import SupportInfrastructurePage from '@/pages/support/InfrastructurePage'
import SupportProgramsPage from '@/pages/support/ProgramsPage'
import SupportProgramsWeMeetPage from '@/pages/support/programs/WeMeetPage'
import SupportProgramsInJejuChallengePage from '@/pages/support/programs/InJejuChallengePage'
import SupportProgramsCoShowPage from '@/pages/support/programs/CoShowPage'
import SupportProgramsCoWeekPage from '@/pages/support/programs/CoWeekPage'

// Admin pages
import AdminPage from '@/pages/admin/AdminPage'
import AdminFacultyPage from '@/pages/admin/FacultyPage'
import AdminFacultyCreatePage from '@/pages/admin/faculty/CreatePage'
import AdminPostsPage from '@/pages/admin/PostsPage'
import AdminPostsCreatePage from '@/pages/admin/posts/CreatePage'
import AdminSchedulesPage from '@/pages/admin/SchedulesPage'
import AdminSchedulesCreatePage from '@/pages/admin/schedules/CreatePage'
import AdminCoursesOfferingPage from '@/pages/admin/CoursesOfferingPage'
import AdminCoursesMasterCreatePage from '@/pages/admin/courses/master/CreatePage'
import AdminCoursesOfferingCreatePage from '@/pages/admin/courses/offering/CreatePage'
import AdminCoursesMasterBulkUploadPage from '@/pages/admin/courses/master/BulkUploadPage'
import AdminCoursesOfferingBulkUploadPage from '@/pages/admin/courses/offering/BulkUploadPage'
import AdminPopupsPage from '@/pages/admin/PopupsPage'
import AdminPopupsCreatePage from '@/pages/admin/popups/CreatePage'
import AdminHeaderAssetsPage from '@/pages/admin/HeaderAssetsPage'
import AdminHeaderAssetsCreatePage from '@/pages/admin/header-assets/CreatePage'
import AdminHistoryPage from '@/pages/admin/HistoryPage'
import AdminHistoryCreatePage from '@/pages/admin/history/CreatePage'
import AdminCoursesMasterPage from '@/pages/admin/CoursesMasterPage'
import AdminUsersPage from '@/pages/admin/UsersPage'
import AdminUsersCreatePage from '@/pages/admin/users/CreatePage'
import AdminFeedbackPage from '@/pages/admin/FeedbackPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ConditionalLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'auth/set-password',
        element: <SetPasswordPage />,
      },
      // About routes
      {
        path: 'about/greeting',
        element: <AboutGreetingPage />,
      },
      {
        path: 'about/introduction',
        element: <AboutIntroductionPage />,
      },
      {
        path: 'about/history',
        element: <AboutHistoryPage />,
      },
      {
        path: 'about/faculty',
        element: <AboutFacultyPage />,
      },
      {
        path: 'about/schedule',
        element: <AboutSchedulePage />,
      },
      // Curriculum routes
      {
        path: 'curriculum/major',
        element: <CurriculumMajorPage />,
      },
      {
        path: 'curriculum/microdegree',
        element: <CurriculumMicrodegreePage />,
      },
      {
        path: 'curriculum/courses',
        element: <CurriculumCoursesPage />,
      },
      {
        path: 'curriculum/subjects',
        element: <CurriculumSubjectsPage />,
      },
      {
        path: 'curriculum/subjects/offered',
        element: <CurriculumSubjectsOfferedPage />,
      },
      {
        path: 'curriculum/subjects/single-semester',
        element: <CurriculumSubjectsSemesterPage />,
      },
      // News routes
      {
        path: 'news',
        element: <NewsPage />,
      },
      {
        path: 'news/:category/:id',
        element: <NewsDetailPage />,
      },
      // Support routes
      {
        path: 'support',
        element: <SupportPage />,
      },
      {
        path: 'support/scholarship',
        element: <SupportScholarshipPage />,
      },
      {
        path: 'support/infrastructure',
        element: <SupportInfrastructurePage />,
      },
      {
        path: 'support/programs',
        element: <SupportProgramsPage />,
      },
      {
        path: 'support/programs/we-meet',
        element: <SupportProgramsWeMeetPage />,
      },
      {
        path: 'support/programs/in-jeju-challenge',
        element: <SupportProgramsInJejuChallengePage />,
      },
      {
        path: 'support/programs/co-show',
        element: <SupportProgramsCoShowPage />,
      },
      {
        path: 'support/programs/co-week',
        element: <SupportProgramsCoWeekPage />,
      },
      // Admin routes
      {
        path: 'admin',
        element: <AdminPage />,
      },
      {
        path: 'admin/faculty',
        element: <AdminFacultyPage />,
      },
      {
        path: 'admin/faculty/create',
        element: <AdminFacultyCreatePage />,
      },
      {
        path: 'admin/faculty/:id',
        element: <AdminFacultyCreatePage />,
      },
      {
        path: 'admin/posts',
        element: <AdminPostsPage />,
      },
      {
        path: 'admin/posts/create',
        element: <AdminPostsCreatePage />,
      },
      {
        path: 'admin/posts/:id',
        element: <AdminPostsCreatePage />,
      },
      {
        path: 'admin/schedules',
        element: <AdminSchedulesPage />,
      },
      {
        path: 'admin/schedules/create',
        element: <AdminSchedulesCreatePage />,
      },
      {
        path: 'admin/schedules/:id',
        element: <AdminSchedulesCreatePage />,
      },
      {
        path: 'admin/courses/offering',
        element: <AdminCoursesOfferingPage />,
      },
      {
        path: 'admin/courses/offering/create',
        element: <AdminCoursesOfferingCreatePage />,
      },
      {
        path: 'admin/courses/offering/edit/:id',
        element: <AdminCoursesOfferingCreatePage />,
      },
      {
        path: 'admin/courses/offering/bulk-upload',
        element: <AdminCoursesOfferingBulkUploadPage />,
      },
      {
        path: 'admin/courses/master',
        element: <AdminCoursesMasterPage />,
      },
      {
        path: 'admin/courses/master/create',
        element: <AdminCoursesMasterCreatePage />,
      },
      {
        path: 'admin/courses/master/edit/:id',
        element: <AdminCoursesMasterCreatePage />,
      },
      {
        path: 'admin/courses/master/bulk-upload',
        element: <AdminCoursesMasterBulkUploadPage />,
      },
      {
        path: 'admin/users',
        element: <AdminUsersPage />,
      },
      {
        path: 'admin/users/create',
        element: <AdminUsersCreatePage />,
      },
      {
        path: 'admin/feedback',
        element: <AdminFeedbackPage />,
      },
      {
        path: 'admin/popups',
        element: <AdminPopupsPage />,
      },
      {
        path: 'admin/popups/create',
        element: <AdminPopupsCreatePage />,
      },
      {
        path: 'admin/popups/:id',
        element: <AdminPopupsCreatePage />,
      },
      {
        path: 'admin/header-assets',
        element: <AdminHeaderAssetsPage />,
      },
      {
        path: 'admin/header-assets/create',
        element: <AdminHeaderAssetsCreatePage />,
      },
      {
        path: 'admin/header-assets/:id',
        element: <AdminHeaderAssetsCreatePage />,
      },
      {
        path: 'admin/history',
        element: <AdminHistoryPage />,
      },
      {
        path: 'admin/history/create',
        element: <AdminHistoryCreatePage />,
      },
      {
        path: 'admin/history/edit/:id',
        element: <AdminHistoryCreatePage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
