import { getCategoryKey } from './categoryConfig'

const menuConfig = [
  {
    name: '학과 소개',
    path: '/about',
    children: [
      { name: '인사말', path: '/about/greeting' },
      { name: '학과소개', path: '/about/introduction' },
      { name: '연혁', path: '/about/history' },
      { name: '참여 교원', path: '/about/faculty' },
      { name: '학사일정', path: '/about/schedule' },
    ],
  },
  {
    name: '교육 과정',
    path: '/curriculum',
    children: [
      {
        name: '전공교육과정',
        path: '/curriculum/major',
      },
      {
        name: '마이크로디그리',
        path: '/curriculum/microdegree',
      },
      {
        name: '이수체계도',
        path: '/curriculum/courses',
      },
      {
        name: '개설과목',
        path: '/curriculum/subjects',
        children: [
                    {
            name: '전체 운영 과목',
            path: '/curriculum/subjects/single-semester',
          },
          { name: '학기별 개설 과목', path: '/curriculum/subjects/offered' }
        ],
      },
    ],
  },
  {
    name: '학생 지원',
    path: '/support',
    children: [
      { name: '장학안내', path: '/support/scholarship' },
      { name: '인프라', path: '/support/infrastructure' },
      {
        name: '비교과 프로그램',
        path: '/support/programs',
        children: [
          { name: 'Co-Week', path: '/support/programs/co-week' },
          { name: 'We-Meet', path: '/support/programs/we-meet' },
          {
            name: 'In-Jeju Challenge',
            path: '/support/programs/in-jeju-challenge',
          },
          { name: 'Co-Show', path: '/support/programs/co-show' },
        ],
      },
    ],
  },
  {
    name: '뉴스/커뮤니티',
    path: '/news',
    children: [
      {
        name: '소식',
        path: `/news?category=${getCategoryKey('장학정보')}`,
        children: [
          {
            name: '장학정보',
            path: `/news?category=${getCategoryKey('장학정보')}`,
          },
          { name: '뉴스', path: `/news?category=${getCategoryKey('뉴스')}` },
          {
            name: '자료실',
            path: `/news?category=${getCategoryKey('자료실')}`,
          },
        ],
      },
      {
        name: '공지사항',
        path: `/news?category=${getCategoryKey('공지사항')}`,
      },
      {
        name: '공모전/채용 정보',
        path: `/news?category=${getCategoryKey('공모전 정보')}`,
        children: [
          {
            name: '공모전 정보',
            path: `/news?category=${getCategoryKey('공모전 정보')}`,
          },
          {
            name: '교육/활동/취업 정보',
            path: `/news?category=${getCategoryKey('교육/활동/취업 정보')}`,
          },
        ],
      },
    ],
  },
]

export default menuConfig
