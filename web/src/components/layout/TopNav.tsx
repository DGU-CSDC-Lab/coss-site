'use client'

import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useUIStore } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import menuConfig from '@/config/menuConfig'

export default function TopNav() {
  const { toggleSidebar } = useUIStore()
  const { isLoggedIn, user, logout } = useAuthStore()
  const userName = user?.email || 'Anonymous'
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null)
  const [hoveredSub, setHoveredSub] = useState<string | null>(null)

  const buildPath = (...parts: string[]) =>
    '/' + parts.map(p => p.replace(/^\/+/, '').replace(/\/+$/, '')).join('/')

  return (
    <nav
      className="bg-white sticky top-0 z-30"
      onMouseLeave={() => {
        setHoveredMenu(null)
        setHoveredSub(null)
      }}
    >
      <div className="w-full">
        <div className="flex justify-between items-center h-16 p-4">
          {/* 로고 */}
          <Link to="/" className="flex items-center">
            <img
              src="/assets/images/logo.png"
              alt="사물인터넷 혁신융합대학사업단"
              width={200}
              height={50}
              className="h-12 w-auto"
            />
          </Link>

          {/* 메인 메뉴 */}
          <div
            className="relative hidden pc:flex flex-col"
            onMouseLeave={() => {
              setHoveredMenu(null)
              setHoveredSub(null)
            }}
          >
            {/* 메인 메뉴 */}
            <div className="flex items-stretch h-16">
              {menuConfig.map(item => (
                <button
                  key={item.path}
                  onMouseEnter={() => {
                    setHoveredMenu(item.path)
                    setHoveredSub(null)
                  }}
                  className={`w-[160px] h-full text-body-18-regular transition-colors flex flex-col items-center justify-center ${
                    hoveredMenu === item.path
                      ? 'bg-pri-800 text-white font-semibold'
                      : 'text-text hover:bg-pri-200 hover:text-pri-800'
                  }`}
                >
                  <span>{item.name}</span>
                  <div
                    className={`mt-2 h-[4px] w-[50%] rounded-full transition-colors ${
                      hoveredMenu === item.path ? 'bg-white' : 'bg-white'
                    }`}
                  ></div>
                </button>
              ))}
            </div>

            {/* 서브 메뉴 */}
            <div
              onMouseEnter={() => {
                // 마우스가 서브 메뉴 안에 들어와도 상태 유지
                if (hoveredMenu) setHoveredMenu(hoveredMenu)
              }}
              className={`absolute left-0 top-full w-full bg-white z-50 body-14-regular transition-all duration-300 ${
                hoveredMenu
                  ? 'opacity-100 visible translate-y-0'
                  : 'opacity-0 invisible -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="flex justify-center">
                {menuConfig.map(group => (
                  <div
                    key={group.path}
                    className={`w-[160px] text-center flex-none transition-colors ${
                      hoveredMenu === group.path ? 'bg-pri-50' : ''
                    }`}
                  >
                    <ul className="flex flex-col">
                      {group.children.map(sub => (
                        <Link key={sub.path} to={sub.path}>
                          <li
                            onMouseEnter={() => {
                              setHoveredSub(sub.path)
                              setHoveredMenu(group.path)
                            }}
                            className={`transition-colors text-gray-900 px-4 py-4 cursor-pointer ${
                              hoveredSub === sub.path
                                ? 'bg-pri-200 font-semibold'
                                : 'hover:bg-pri-200'
                            }`}
                          >
                            {sub.name}
                          </li>
                        </Link>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 로그인 영역 */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                {/* 프로필 + 이름 클릭 시 마이페이지 이동 */}
                {/* 로그아웃 버튼 */}
                <button
                  onClick={logout}
                  className="text-caption-12 text-gray-400 rounded-full hover:text-gray-600 transition-colors"
                >
                  로그아웃
                </button>
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <span className="text-caption-14 text-gray-700 font-medium">
                    {userName}
                  </span>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <img
                      src="/assets/icon/user.svg"
                      alt="user"
                      width={24}
                      height={24}
                    />
                  </div>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-3 transition-colors"
              >
                <span className="text-caption-14 text-gray-500">로그인</span>
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <img
                    src="/assets/icon/user.svg"
                    alt="user"
                    width={24}
                    height={24}
                  />
                </div>
              </Link>
            )}

            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <img
                src="/assets/icon/menu-bar.svg"
                alt="메뉴"
                width={32}
                height={32}
              />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
