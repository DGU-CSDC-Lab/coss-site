import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import ConditionalLayout from '@/components/layout/ConditionalLayout'

// Pages
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import NotFoundPage from '@/pages/NotFoundPage'

// About pages
import AboutGreetingPage from '@/pages/about/GreetingPage'
import AboutIntroductionPage from '@/pages/about/IntroductionPage'
import AboutHistoryPage from '@/pages/about/HistoryPage'
import AboutFacultyPage from '@/pages/about/FacultyPage'
import AboutSchedulePage from '@/pages/about/SchedulePage'

// Curriculum pages
import CurriculumMajorPage from '@/pages/curriculum/MajorPage'
import CurriculumCoursesPage from '@/pages/curriculum/CoursesPage'
import CurriculumSubjectsPage from '@/pages/curriculum/SubjectsPage'
import CurriculumMajorIotPage from '@/pages/curriculum/major/IotPage'
import CurriculumMajorMicrodegreePage from '@/pages/curriculum/major/MicrodegreePage'
import CurriculumCoursesIotPage from '@/pages/curriculum/courses/IotPage'
import CurriculumCoursesMicrodegreePage from '@/pages/curriculum/courses/MicrodegreePage'

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
import AdminCoursesPage from '@/pages/admin/CoursesPage'
import AdminCoursesCreatePage from '@/pages/admin/courses/CreatePage'
import AdminCoursesBulkUploadPage from '@/pages/admin/courses/BulkUploadPage'
import AdminPopupsPage from '@/pages/admin/PopupsPage'
import AdminPopupsCreatePage from '@/pages/admin/popups/CreatePage'
import AdminHeaderAssetsPage from '@/pages/admin/HeaderAssetsPage'
import AdminHeaderAssetsCreatePage from '@/pages/admin/header-assets/CreatePage'

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
        path: 'curriculum/major/iot',
        element: <CurriculumMajorIotPage />,
      },
      {
        path: 'curriculum/major/microdegree',
        element: <CurriculumMajorMicrodegreePage />,
      },
      {
        path: 'curriculum/courses',
        element: <CurriculumCoursesPage />,
      },
      {
        path: 'curriculum/courses/iot',
        element: <CurriculumCoursesIotPage />,
      },
      {
        path: 'curriculum/courses/microdegree',
        element: <CurriculumCoursesMicrodegreePage />,
      },
      {
        path: 'curriculum/subjects',
        element: <CurriculumSubjectsPage />,
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
        path: 'admin/courses',
        element: <AdminCoursesPage />,
      },
      {
        path: 'admin/courses/create',
        element: <AdminCoursesCreatePage />,
      },
      {
        path: 'admin/courses/:id',
        element: <AdminCoursesCreatePage />,
      },
      {
        path: 'admin/courses/bulk-upload',
        element: <AdminCoursesBulkUploadPage />,
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
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
