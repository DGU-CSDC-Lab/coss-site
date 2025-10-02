'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useUIStore } from '@/store/ui.store'
import menuConfig from '@/config/menuConfig'

// 아이콘 컴포넌트
const ChevronDownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="6,9 12,15 18,9"></polyline>
  </svg>
)

const ChevronRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="9,18 15,12 9,6"></polyline>
  </svg>
)

export default function SideNav() {
  const { isSidebarOpen, closeSidebar: close } = useUIStore()

  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null)

  const closeSidebar = () => {
    setOpenMenu(null)
    setOpenSubMenu(null)
    close()
  }

  // 안전한 경로 조립 유틸 - 중복 슬래시, 중복 segment 제거
  const buildPath = (...parts: (string | undefined)[]) => {
    const segments: string[] = []

    parts.filter(Boolean).forEach(p => {
      const clean = p!.replace(/^\/+|\/+$/g, '') // 앞뒤 슬래시 제거
      if (clean && segments[segments.length - 1] !== clean) {
        segments.push(clean)
      }
    })

    return '/' + segments.join('/')
  }

  return (
    <div
      className={`fixed inset-0 z-[100] transition-all ${
        isSidebarOpen ? 'visible' : 'invisible'
      }`}
    >
      {/* 배경 */}
      <div
        onClick={closeSidebar}
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-30' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 사이드바 본체 */}
      <aside
        className={`absolute right-0 top-0 h-full bg-point-3 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } w-[380px] max-w-[80vw]`}
      >
        {/* 닫기 버튼 */}
        <div className="flex justify-end p-4">
          <button
            onClick={closeSidebar}
            aria-label="사이드바 닫기"
            className="hover:opacity-80 transition"
          >
            <Image
              src="/assets/icon/close.svg"
              alt="닫기"
              width={20}
              height={20}
              className="h-5 w-5"
            />
          </button>
        </div>

        {/* 메뉴 목록 */}
        <nav className="">
          {menuConfig.map(menu => (
            <div key={menu.path} className="border-b border-gray-600">
              {/* 1단계 메뉴 */}
              <button
                onClick={() =>
                  setOpenMenu(openMenu === menu.path ? null : menu.path)
                }
                className="w-full flex justify-between items-center p-4 font-body-18-medium text-gray-50 hover:bg-gray-600 transition"
              >
                {menu.name}
                <span className="pr-4">
                  {openMenu === menu.path ? (
                    <ChevronDownIcon />
                  ) : (
                    <ChevronRightIcon />
                  )}
                </span>
              </button>

              {/* 2단계 */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openMenu === menu.path
                    ? 'max-h-[400px] opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <ul className="mb-4">
                  {(menu.children || []).map(sub => (
                    <li key={sub.path}>
                      {/* 3단계 존재 */}
                      {sub.children && sub.children.length > 0 ? (
                        <>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation()
                              setOpenSubMenu(prev =>
                                prev === sub.path ? null : sub.path
                              )
                            }}
                            className="w-full text-left flex justify-between items-center pl-8 p-3 text-gray-50 hover:bg-gray-600 transition"
                          >
                            {sub.name}
                            <span className="pr-4">
                              {openSubMenu === sub.path ? (
                                <ChevronDownIcon />
                              ) : (
                                <ChevronRightIcon />
                              )}
                            </span>
                          </button>
                          <ul
                            className={`overflow-hidden transition-[max-height,opacity] duration-300 ${
                              openSubMenu === sub.path
                                ? 'max-h-96 opacity-100 pointer-events-auto'
                                : 'max-h-0 opacity-0 pointer-events-none'
                            }`}
                          >
                            {sub.children.map(detail => (
                              <li key={detail.path}>
                                <Link
                                  href={detail.path}
                                  className="pl-12 p-2 block text-gray-50 hover:bg-gray-600 rounded-sm transition"
                                  onClick={closeSidebar}
                                >
                                  {detail.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <Link
                          href={sub.path}
                          className="block pl-8 p-3 text-gray-50 hover:bg-gray-600 rounded-sm transition"
                          onClick={closeSidebar}
                        >
                          {sub.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </div>
  )
}
