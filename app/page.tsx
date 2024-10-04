'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Placeholder data for clubs
const clubs = [
  { name: "Photography Club", logo: "/placeholder.svg", description: "Capture moments and create memories" },
  { name: "Debate Society", logo: "/placeholder.svg", description: "Sharpen your argumentation skills" },
  { name: "Coding Club", logo: "/placeholder.svg", description: "Build the future with code" },
  { name: "Sports Club", logo: "/placeholder.svg", description: "Stay active and compete" },
]

// Placeholder data for slider images
const sliderImages = [
  "/placeholder.svg?height=400&width=800",
  "/placeholder.svg?height=400&width=800",
  "/placeholder.svg?height=400&width=800",
]

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % sliderImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Image src="/placeholder.svg" alt="NCT Logo" width={50} height={50} />
            <h1 className="text-2xl font-bold">NCT ClubConnect</h1>
          </div>
          <div className="space-x-4">
            <Button variant="outline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Image Slider */}
        <div className="relative h-[400px] overflow-hidden">
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
                <Link href="/signin">Join Now</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Club Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Clubs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {clubs.map((club, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Image src={club.logo} alt={`${club.name} Logo`} width={100} height={100} className="mx-auto" />
                    <CardTitle className="text-center">{club.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{club.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="justify-center">
                    <Button asChild>
                      <Link href="/signin">Join Club</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
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
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:underline">About Us</Link></li>
                <li><Link href="/contact" className="hover:underline">Contact</Link></li>
                <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <p>Follow us on social media for updates and news about NCT clubs.</p>
              {/* Add social media icons/links here */}
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; 2023 NCT ClubConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}