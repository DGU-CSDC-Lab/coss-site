'use client'

import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { headerAssetsApi, HeaderAsset } from '@/lib/api/headerAssets'
import Image from 'next/image'
import Link from 'next/link'
import { PagedResponse } from '@/lib/apiClient'

export default function HeaderSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [banners, setBanners] = useState<PagedResponse<HeaderAsset>>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBanners()
  }, [])

  useEffect(() => {
    if (banners?.items.length ?? 0 > 1) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % (banners?.items.length ?? 1))
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [banners?.items.length])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const data = await headerAssetsApi.getHeaderAssets({
        page: 1,
        size: 10,
        isActive: true,
      })
      setBanners(data)
    } catch (error) {
      console.error('Failed to fetch banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToPrevious = () => {
    setCurrentIndex(
      prev =>
        (prev - 1 + (banners?.items.length ?? 0)) % (banners?.items.length ?? 1)
    )
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % (banners?.items.length ?? 1))
  }

  {
    /** ToDo: UX 개선*/
  }
  if (loading) {
    return (
      <div className="h-96 bg-gray-200 rounded-lg overflow-hidden animate-pulse flex items-center justify-center">
        <div className="w-full h-full bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300" />
      </div>
    )
  }

  if (banners?.items.length === 0) {
    return (
      <div className="h-96 bg-gray-200 flex items-center justify-center rounded-lg">
        <div className="text-gray-400">표시할 배너가 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="relative h-96 bg-gray-200 overflow-hidden rounded-lg">
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners?.items.map((banner, index) => (
          <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
            {banner.linkUrl ? (
              <Link href={banner.linkUrl} className="block w-full h-full">
                {banner.imageUrl ? (
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover rounded-lg"
                    priority={index === 0}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h2 className="text-2xl font-bold mb-2">
                        {banner.title}
                      </h2>
                      {banner.textContent && (
                        <p className="text-lg">{banner.textContent}</p>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            ) : (
              <>
                {banner.imageUrl ? (
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h2 className="text-2xl font-bold mb-2">
                        {banner.title}
                      </h2>
                      {banner.textContent && (
                        <p className="text-lg">{banner.textContent}</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {(banners?.items.length ?? 0) > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute -left-8 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-4"
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>

          <button
            onClick={goToNext}
            className="absolute -right-8 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-4"
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners?.items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
