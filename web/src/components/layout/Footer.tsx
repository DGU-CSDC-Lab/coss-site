
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <>
      <footer className="bg-white">
        {/* 상단 링크 영역 */}
        <div className="bg-point-3 py-3">
          <div className="w-full px-4 mobile:px-2 tablet:px-6 flex gap-4">
            <Link
              to="https://www.dongguk.edu/page/534"
              className="text-pri-800 font-caption-12 hover:text-pri-900 transition-colors"
            >
              개인정보처리방침
            </Link>
            <span className="text-gray-50">|</span>
            <Link
              to="https://www.dongguk.edu/article/privacyNotice/list"
              className="text-white font-caption-12 hover:text-gray-200 transition-colors"
            >
              이용약관
            </Link>
          </div>
        </div>

        {/* 메인 Footer 영역 */}
        <div className="py-8 mobile:py-6 tablet:py-7">
          <div className="w-full px-4 mobile:px-2 tablet:px-6 flex justify-between items-start mobile:flex-col mobile:gap-6 tablet:flex-row">
            {/* 로고 영역 */}
            <div className="flex-shrink-0">
              <img
                src="/assets/images/logo.png"
                alt="사물인터넷 혁신융합대학사업단"
                width={100}
                height={30}
                className="h-auto mobile:w-40 tablet:w-48"
              />
            </div>

            {/* 정보 영역 */}
            <div className="text-right mobile:text-left tablet:text-right">
              <div className="text-gray-300 font-caption-12 space-y-1">
                <div className="flex flex-row gap-2">
                  <p className="mobile:font-caption-12">
                    주소 04620 서울시 중구 필동로 1길 30 동국대학교 원흥관 4층
                    E423호
                  </p>
                  <p className="mobile:font-caption-12">
                    대표전화 02-2260-8957
                  </p>
                </div>
                <p className="font-caption-10 mt-2">
                  Copyright 2019 DONGGUK UNIVERSITY ALL RIGHTS RESERVED.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
