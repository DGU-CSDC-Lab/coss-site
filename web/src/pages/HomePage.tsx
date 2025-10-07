import HeaderSlider from '@/components/home/HeaderSlider'
import BoardSection from '@/components/home/BoardSection'
import CalendarSection from '@/components/home/CalendarSection'
import NewsSection from '@/components/home/NewsSection'

export default function HomePage() {
  return (
    <div>
      <HeaderSlider />

      <div className="h-8 md:h-16 sm:h-12" />

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          <BoardSection />
          <CalendarSection />
        </div>

        <NewsSection />
      </div>
    </div>
  )
}
