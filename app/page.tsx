'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Updated clubs data
const clubs = [
  { name: "NCT Coding Club", logo: "/clubs logos/coding.png", description: "Build the future with code" },
  { name: "NCT Robotics Club", logo: "/clubs logos/robotics.png", description: "Innovate with robotics and automation" },
  { name: "NCT E-Sports Club", logo: "/clubs logos/e-sports.png", description: "Compete in the digital arena" },
  { name: "NCT Boardgames Club", logo: "/clubs logos/boardgames.png", description: "Strategy and fun with boardgames" },
  { name: "NCT Book Club", logo: "/clubs logos/book.png", description: "Explore worlds through literature" },
  { name: "NCT Cricket Club", logo: "/clubs logos/cricket.png", description: "Play the gentleman's game" },
  { name: "NCT Basketball Club", logo: "/clubs logos/basketball.png", description: "Shoot hoops and build teamwork" },
  { name: "NCT Volleyball Club", logo: "/clubs logos/volleyball.png", description: "Spike your way to victory" },
  { name: "NCT Badminton Club", logo: "/clubs logos/badminton.png", description: "Master the shuttlecock" },
  { name: "NCT Soccer Club", logo: "/clubs logos/soccer.png", description: "The beautiful game awaits" },
  { name: "NCT Foodie Club", logo: "/clubs logos/foodie.png", description: "Explore your passion in food" },
]

// Placeholder data for slider images
const sliderImages = [
  "/images/about-mobile.jpg",
  "/images/news-mobile.jpg",
  "/images/nct2.png",
]

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % sliderImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true)
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX
    setStartX(pageX - (sliderRef.current?.offsetLeft || 0))
    setScrollLeft(sliderRef.current?.scrollLeft || 0)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return
    e.preventDefault()
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX
    const x = pageX - (sliderRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 2
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = scrollLeft - walk
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Image src="/images/logo/favicon.svg" alt="NCT Logo" width={50} height={50} />
            <h1 className="text-2xl font-bold">ClubConnect</h1>
          </div>
          <div className="space-x-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
            <Button variant="outline" asChild >
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button  asChild className=" sm:w-auto p">
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Image Slider */}
        <div className="relative h-[520px] overflow-hidden">
          {sliderImages.map((src, index) => (
            <Image
              key={index}
              src={src}
              alt={`Slide ${index + 1}`}
              fill
              style={{
                objectFit: 'cover',
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out'
              }}
            />
          ))}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 left-4 transform -translate-y-1/2"
            onClick={() => setCurrentSlide((prevSlide) => (prevSlide - 1 + sliderImages.length) % sliderImages.length)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 right-4 transform -translate-y-1/2"
            onClick={() => setCurrentSlide((prevSlide) => (prevSlide + 1) % sliderImages.length)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Blog Section */}
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Discover NCT Clubs</h2>
            <p className="text-lg mb-8 text-center max-w-2xl mx-auto">
              NCT offers a diverse range of clubs to enrich your college experience. From academic pursuits to creative
              endeavors, there's a club for every interest. Join a community of like-minded individuals and make the most
              of your time at NCT!
            </p>
            <div className="text-center">
              <Button asChild>
                <Link href="/auth/signin">Join Now</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Club Cards Slider */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Clubs</h2>
            <div 
              ref={sliderRef}
              className="flex overflow-x-auto space-x-4 pb-4 cursor-grab select-none"
              onMouseDown={handleDragStart}
              onMouseLeave={handleDragEnd}
              onMouseUp={handleDragEnd}
              onMouseMove={handleDrag}
              onTouchStart={handleDragStart}
              onTouchEnd={handleDragEnd}
              onTouchMove={handleDrag}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {clubs.map((club, index) => (
                <Card key={index} className="flex-shrink-0 w-64 bg-gradient-to-br from-white to-gray-100 transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <Image src={club.logo} alt={`${club.name} Logo`} width={100} height={100} className="mx-auto" />
                    <CardTitle className="text-center">{club.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{club.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button asChild>
                <Link href="/auth/signin">Join Clubs</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About NCT ClubConnect</h3>
              <p>Connecting students with exciting opportunities to engage, learn, and grow through various clubs.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <p>Follow us on social media for updates and news about NCT clubs.</p>
              {/* Add social media icons/links here */}
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; 2024 NCT ClubConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}