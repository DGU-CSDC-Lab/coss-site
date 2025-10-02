const menuConfig = [
  {
    name: '사업 소개',
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
        children: [
          { name: '마이크로디그리', path: '/curriculum/major/microdegree' },
          { name: '지능IoT학과', path: '/curriculum/major/iot' },
        ],
      },
      {
        name: '이수체계도',
        path: '/curriculum/courses',
        children: [
          { name: '마이크로디그리', path: '/curriculum/courses/microdegree' },
          { name: '지능IoT학과', path: '/curriculum/courses/iot' },
        ],
      },
      {
        name: '개설과목',
        path: '/curriculum/subjects',
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
        path: '/news?category=scholarship-info',
        children: [
          { name: '장학정보', path: '/news?category=scholarship-info' },
          { name: '뉴스', path: '/news?category=news' },
          { name: '자료실', path: '/news?category=resources' },
        ],
      },
      { name: '공지사항', path: '/news?category=notices' },
      {
        name: '공모전/채용 정보',
        path: '/news?category=contest',
        children: [
          { name: '공모전 정보', path: '/news?category=contest' },
          { name: '교육/활동/취업 정보', path: '/news?category=activities' },
        ],
      },
    ],
  },
]

export default menuConfig
