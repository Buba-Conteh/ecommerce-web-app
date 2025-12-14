"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "@inertiajs/react"

interface Slide {
  id: number
  title: string
  subtitle: string
  description: string
  badge?: string
  image: string
  ctaText: string
  ctaLink: string
  overlay?: boolean
}

interface HeroSliderProps {
  slides?: Slide[]
  autoPlay?: boolean
  interval?: number
}

const defaultSlides: Slide[] = [
  {
    id: 1,
    title: "Discover Your",
    subtitle: "Perfect Style",
    description: "Curated collections that blend timeless elegance with contemporary design. Experience luxury that speaks to your individual style.",
    badge: "New Collection",
    image: "/images/elegant-fashion-model-wearing-luxury-clothing.png",
    ctaText: "Shop Collection",
    ctaLink: "/products",
    overlay: true,
  },
  {
    id: 2,
    title: "Elevate Your",
    subtitle: "Wardrobe",
    description: "Premium quality meets sophisticated design. Transform your everyday style with our exclusive collection.",
    badge: "Limited Edition",
    image: "/images/elegant-silk-dress-on-model.png",
    ctaText: "Explore Now",
    ctaLink: "/products?on_sale=1",
    overlay: true,
  },
  {
    id: 3,
    title: "Luxury Redefined",
    subtitle: "For Every Occasion",
    description: "From casual elegance to formal sophistication, find pieces that define your unique sense of style.",
    badge: "Featured",
    image: "/images/elegant-wool-coat.png",
    ctaText: "Shop Now",
    ctaLink: "/products",
    overlay: true,
  },
]

export function HeroSlider({ slides = defaultSlides, autoPlay = true, interval = 5000 }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (!autoPlay) return

    const timer = setInterval(() => {
      nextSlide()
    }, interval)

    return () => clearInterval(timer)
  }, [currentSlide, autoPlay, interval])

  const nextSlide = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
      setIsTransitioning(false)
    }, 300)
  }

  const prevSlide = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
      setIsTransitioning(false)
    }, 300)
  }

  const goToSlide = (index: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(index)
      setIsTransitioning(false)
    }, 300)
  }

  const current = slides[currentSlide]

  return (
    <section className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Slides Container */}
      <div className="relative h-full w-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="relative h-full w-full">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
              >
                {slide.overlay && (
                  <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
                )}
              </div>

              {/* Content */}
              {index === currentSlide && (
                <div className="relative z-20 h-full flex items-center">
                  <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-left duration-700">
                      {slide.badge && (
                        <Badge
                          variant="secondary"
                          className="bg-accent/10 text-accent border-accent/20 text-sm px-4 py-1.5 mb-4"
                        >
                          {slide.badge}
                        </Badge>
                      )}
                      <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
                        {slide.title}
                        <span className="text-primary block mt-2">{slide.subtitle}</span>
                      </h2>
                      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                        {slide.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link href={slide.ctaLink}>
                          <Button
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 py-6 h-auto"
                          >
                            {slide.ctaText}
                          </Button>
                        </Link>
                        <Link href="/products">
                          <Button
                            variant="outline"
                            size="lg"
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent text-base px-8 py-6 h-auto"
                          >
                            Browse All
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 bg-background/80 hover:bg-background backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-foreground" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 bg-background/80 hover:bg-background backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-foreground" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/50 hover:bg-muted-foreground"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

