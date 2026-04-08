import { useEffect, useState } from 'react'

function HeroCarousel({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (slides.length < 2) {
      return undefined
    }

    const timer = window.setInterval(() => {
      console.log('Carousel tick at:', new Date().toLocaleTimeString())
      setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length)
    }, 10000)
    // 10000 = 10 seconds

    return () => window.clearInterval(timer)
  }, [slides.length])

  const activeSlide = slides[activeIndex]

  return (
    <section className="hero-carousel" aria-label="Featured trip destinations">
      <div className="hero-carousel__media">
        <img src={activeSlide.image} alt={activeSlide.alt} className="hero-carousel__image" />
      </div>

      <div className="hero-carousel__dots" aria-label="Carousel position">
        {slides.map((slide, index) => (
          <span
            key={slide.title}
            className={`hero-carousel__dot${index === activeIndex ? ' hero-carousel__dot--active' : ''}`}
            aria-hidden="true"
          />
        ))}
      </div>
    </section>
  )
}

export default HeroCarousel
