export interface CategoryConfig {
  key: string
  label: string
  slug: string
  parent?: string
}

export const CATEGORIES: CategoryConfig[] = [
  // 공지사항
  { key: 'notices', label: '공지사항', slug: 'notices' },

  // 소식 (상위)
  { key: 'announcements', label: '소식', slug: 'announcements' },
  {
    key: 'scholarships',
    label: '장학정보',
    slug: 'scholarships',
    parent: 'announcements',
  },
  {
    key: 'department-news',
    label: '뉴스',
    slug: 'department-news',
    parent: 'announcements',
  },
  {
    key: 'resources',
    label: '자료실',
    slug: 'resources',
    parent: 'announcements',
  },

  // 공모전/채용 정보 (상위)
  { key: 'contest-jobs', label: '공모전/채용 정보', slug: 'contest-jobs' },
  {
    key: 'contest',
    label: '공모전 정보',
    slug: 'contest',
    parent: 'contest-jobs',
  },
  {
    key: 'activities',
    label: '교육/활동/취업 정보',
    slug: 'activities',
    parent: 'contest-jobs',
  },
]

// 카테고리 키로 라벨 찾기
export const getCategoryLabel = (key: string): string => {
  const category = CATEGORIES.find(cat => cat.key === key)
  return category?.label || key
}

// 카테고리 라벨로 키 찾기
export const getCategoryKey = (label: string): string => {
  const category = CATEGORIES.find(cat => cat.label === label)
  return category?.key || label
}

// 카테고리 키로 슬러그 찾기
export const getCategorySlug = (key: string): string => {
  const category = CATEGORIES.find(cat => cat.key === key)
  return category?.slug || key
}

// 카테고리 슬러그로 키 찾기
export const getCategoryKeyBySlug = (slug: string): string => {
  const category = CATEGORIES.find(cat => cat.slug === slug)
  return category?.key || slug
}

// 드롭다운용 옵션 생성
export const getCategoryOptions = () => {
  return CATEGORIES.map(cat => ({
    value: cat.slug,
    label: cat.label,
  }))
}

// 이름-키 매핑 객체 (기존 코드 호환용)
export const categoryNameToKey: Record<string, string> = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.label] = cat.key
    return acc
  },
  {} as Record<string, string>
)
