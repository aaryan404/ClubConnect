'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Settings, TrendingUp, Loader2, Menu, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from "@/hooks/use-toast"

interface NavigationProps {
  active?: string
}

interface StudentProfile {
  id: string
  name: string
  avatar_url: string | null
  role: 'student' | 'sub-admin'
}

export default function StudentNavigation({ active }: NavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isNavbarOpen, setIsNavbarOpen] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchStudentProfile()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        fetchStudentProfile()
      } else if (event === 'SIGNED_OUT') {
        setStudentProfile(null)
        router.push('/auth/signin')
        disableBackButton()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router])

  async function fetchStudentProfile() {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('email', user.email)
          .single()

        if (error) throw error

        setStudentProfile(data)
      }
    } catch (error) {
      console.error('Error fetching student profile:', error)
      toast({
        title: "Error",
        description: "Failed to fetch student profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const disableBackButton = () => {
    window.history.pushState(null, '', window.location.href)
    window.onpopstate = function () {
      window.history.pushState(null, '', window.location.href)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      disableBackButton()
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen)
  }

  if (isLoading) {
    return (
      <aside className="w-64 bg-white shadow-md flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </aside>
    )
  }

  const navItems = [
    { href: "/member/dashboard", icon: TrendingUp, label: "Dashboard" },
    { href: "/member/announcements", icon: Bell, label: "Announcements" },
    { href: "/member/clubs", icon: ClipboardList, label: "Clubs" },
    { href: "/member/events", icon: Calendar, label: "Events" },
    { 
      href: "/member/club-management", 
      icon: Settings, 
      label: "Club Management",
      showFor: ['sub-admin']
    }
  ]

  return (
    <>
      <button
        className={`fixed top-2 left-2 z-50 md:hidden bg-transparent p-2 rounded-md transition-all duration-300 ${
          isNavbarOpen ? 'left-[15.5rem]' : ''
        }`}
        onClick={toggleNavbar}
        aria-label={isNavbarOpen ? "Close navigation" : "Open navigation"}
      >
        {isNavbarOpen ? (
          <X size={24} className="text-gray-800" />
        ) : (
          <Menu size={24} className="text-gray-800" />
        )}
      </button>
      <aside className={`w-64 bg-white shadow-md flex flex-col fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isNavbarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0`}>
        <div className="p-4 flex justify-between items-center border-b">
          <h1 className="text-xl font-bold">ClubConnect</h1>
          <Image
            src="/images/logo/favicon.svg"
            alt="ClubConnect Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div className="p-4 flex-grow overflow-y-auto">
          <Link href="/member/profile" className="flex items-center space-x-4 mb-6 hover:bg-gray-100 rounded p-2">
            <Avatar>
              <AvatarImage src={studentProfile?.avatar_url || "/placeholder.svg"} alt={studentProfile?.name || "Student"} />
              <AvatarFallback>{studentProfile?.name?.[0] || "S"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{studentProfile?.name || "Student Name"}</h2>
              <p className="text-sm text-gray-500 capitalize">{studentProfile?.role || "Student"}</p>
            </div>
          </Link>
          <nav className="space-y-2">
            {navItems.map((item) => (
              (!item.showFor || item.showFor.includes(studentProfile?.role || 'student')) && (
                <NavItem 
                  key={item.href}
                  href={item.href} 
                  icon={<item.icon size={20} />} 
                  label={item.label} 
                  isActive={pathname === item.href}
                  disabled={isLoggingOut} 
                  onClick={() => setIsNavbarOpen(false)}
                />
              )
            ))}
            {/* Logout button styled as a nav item */}
            <div 
              className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer ${
                isLoggingOut ? 'pointer-events-none opacity-50' : ''
              }`}
              onClick={handleLogout}
            >
              {isLoggingOut ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <LogOut size={20} className="mr-2" />
              )}
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </div>
          </nav>
        </div>
      </aside>
    </>
  )
}

function NavItem({ href, icon, label, isActive = false, disabled = false, onClick }: { href: string; icon: React.ReactNode; label: string; isActive?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center space-x-2 p-2 rounded ${isActive ? 'bg-gray-100' : 'hover:bg-gray-100'} ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault()
        } else if (onClick) {
          onClick()
        }
      }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}