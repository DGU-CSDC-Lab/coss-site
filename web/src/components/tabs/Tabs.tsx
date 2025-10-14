import { Link } from 'react-router-dom'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import menuConfig from '@/config/menuConfig'
import clsx from 'clsx'

export default function Tabs() {
  const location = useLocation(); const pathname = location.pathname
  const [searchParams] = useSearchParams()
  const segments = pathname.split('/').filter(Boolean)
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)

  const main = menuConfig.find(m => m.path === `/${segments[0]}`)
  const subTabs = main?.children || []

  // 3depth 페이지인 경우 첫 번째 3depth로 리다이렉트
  const getTabHref = (tab: any) => {
    if (tab.children && tab.children.length > 0) {
      return tab.children[0].path
    }
    return tab.path
  }

  // 활성 탭 확인 (뉴스 섹션은 query parameter 고려)
  const isActiveTab = (tab: any) => {
    if (segments[0] === 'news') {
      const category = searchParams.get('category')
      if (tab.path.includes('category=')) {
        const tabCategory = tab.path.split('category=')[1]

        // 현재 category가 해당 탭의 children에 포함되는지 확인
        if (tab.children && tab.children.length > 0) {
          return tab.children.some((child: any) => {
            const childCategory = child.path.split('category=')[1]
            return childCategory === category
          })
        }

        // children이 없으면 직접 비교
        return category === tabCategory
      }
      return false
    }

    // 현재 경로가 해당 탭의 경로로 시작하는지 확인 (3depth 포함)
    const tabBasePath = tab.path.split('?')[0]
    return pathname.startsWith(tabBasePath)
  }

  // 현재 활성화된 2depth 탭 찾기
  const activeTab = subTabs.find(tab => isActiveTab(tab))
  const activeSubTabs = activeTab?.children || []

  // 표시할 서브탭들 결정
  const displaySubTabs = hoveredTab
    ? subTabs.find(tab => tab.path === hoveredTab)?.children || []
    : activeSubTabs

  return (
    <div className="mb-8" onMouseLeave={() => setHoveredTab(null)}>
      {/* 상단 메인탭 */}
      <div className="flex">
        {subTabs.map(tab => {
          const isActive = isActiveTab(tab)
          const hasChildren = tab.children && tab.children.length > 0

          return (
            <div
              key={tab.path}
              onMouseEnter={() => hasChildren && setHoveredTab(tab.path)}
            >
              <Link
                to={getTabHref(tab)}
                className={clsx(
                  'p-2 text-body-14-medium transition-colors block',
                  isActive
                    ? 'border-b-2 border-gray-900 text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                {tab.name}
              </Link>
            </div>
          )
        })}
      </div>

      {/* 서브탭 표시 (활성 탭 기본, 호버 시 변경) */}
      {displaySubTabs.length > 0 && (
        <div className="">
          <div
            className={clsx('flex', hoveredTab ? 'opacity-80' : 'opacity-100')}
          >
            {displaySubTabs.map((subTab: any) => {
              // 뉴스 섹션은 query parameter로 활성 상태 확인
              const isActiveSubTab =
                segments[0] === 'news'
                  ? searchParams.get('category') ===
                    subTab.path.split('category=')[1]
                  : pathname === subTab.path

              return (
                <Link
                  key={subTab.path}
                  to={subTab.path}
                  className={clsx(
                    'p-2 text-body-14-medium transition-colors block',
                    isActiveSubTab
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  {subTab.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
