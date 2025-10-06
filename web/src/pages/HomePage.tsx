import HeaderSlider from '@/components/home/HeaderSlider'
import BoardSection from '@/components/home/BoardSection'
import CalendarSection from '@/components/home/CalendarSection'
import NewsSection from '@/components/home/NewsSection'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeaderSlider />

      <div className="h-20 mobile:h-16 tablet:h-12" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          <BoardSection />
          <CalendarSection />
        </div>

        <NewsSection />
      </div>
    </div>
  )
}
