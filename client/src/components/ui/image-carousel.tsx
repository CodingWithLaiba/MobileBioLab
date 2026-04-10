import useEmblaCarousel from 'embla-carousel-react'
import { useEffect, useState } from 'react'
import {ChevronLeft , ChevronRight } from 'lucide-react'
import { Button } from './button'

interface ImageCarouselProps {
  images: {
    src: string
    alt: string
    caption?: string
    className?: string
  }[]
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  // Initialize Embla
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  // Track current slide
  const [currentIndex, setCurrentIndex] = useState(0)

  // Update selected slide when carousel changes
  useEffect(() => {
    if (!emblaApi) return

    const updateIndex = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap())
    }

    updateIndex()
    emblaApi.on('select', updateIndex)

    return () => {
      emblaApi.off('select', updateIndex)
    }
  }, [emblaApi])

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Carousel viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {images.map((image, index) => (
            <div key={index} className="flex-[0_0_100%] relative">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 md:h-96 object-cover"
              />

              {image.caption && (
                <div className="absolute bottom-16 left-0 right-0 bg-black/30 text-center p-3">
                  <p>{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Previous button */}
      <Button
        size="icon"
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full"
      >
        <ChevronLeft />
      </Button>

      {/* Next button */}
      <Button
        size="icon"
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full"
      >
        <ChevronRight />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default ImageCarousel
