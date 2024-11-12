'use client'

import { useState, useEffect } from "react"
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Home, Users, ClipboardList, Calendar, Bell, LogOut, Settings, Menu, X } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url: string | null
  role: 'student' | 'sub-admin' | 'admin'
}

interface NavigationProps {
  activePage?: string
  active : string
}

export default function Navigation({ activePage }: NavigationProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkScreenSize = () => {
      const newIsMobile = window.innerWidth < 768
      setIsMobile(newIsMobile)
      setIsOpen(!newIsMobile)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const { data, error } = await supabase
            .from('students')
            .select('id, name, email, avatar_url, role')
            .eq('id', authUser.id)
            .single()

          if (error) throw error
          setUser(data)
        } else {
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast({
          title: "Error",
          description: "Failed to fetch user data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router, supabase])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/signin')
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen)
    }
  }

  const getNavItems = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
          { href: "/admin/users", icon: Users, label: "User Management" },
          { href: "/admin/clubs", icon: ClipboardList, label: "Club Management" },
          { href: "/admin/events", icon: Calendar, label: "Event Management" },
          { href: "/admin/announcements", icon: Bell, label: "Announcements" },
        ]
      case 'sub-admin':
        return [
          { href: "/sub-admin/dashboard", icon: Home, label: "Dashboard" },
          { href: "/sub-admin/announcements", icon: Bell, label: "Announcements" },
          { href: "/sub-admin/clubs", icon: ClipboardList, label: "Clubs" },
          { href: "/sub-admin/club-management", icon: Settings, label: "Club Management" },
          { href: "/sub-admin/events", icon: Calendar, label: "Events" },
        ]
      default:
        return [
          { href: "/dashboard", icon: Home, label: "Dashboard" },
          { href: "/clubs", icon: ClipboardList, label: "Clubs" },
          { href: "/events", icon: Calendar, label: "Events" },
          { href: "/notifications", icon: Bell, label: "Notifications" },
        ]
    }
  }

  if (loading) {
    return (
      <aside className="w-64 bg-white shadow-md flex flex-col p-4">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-12 w-12 rounded-full mb-2" />
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-3 w-16 mb-6" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full mb-2" />
        ))}
      </aside>
    )
  }

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={toggleSidebar}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      )}
      <aside className={cn(
        "bg-white shadow-md flex flex-col transition-all duration-300",
        isMobile ? (isOpen ? "fixed inset-y-0 left-0 z-40 w-64" : "fixed inset-y-0 -left-64 z-40 w-64") : "relative w-64",
      )}>
        <div className="p-4 flex justify-between items-center border-b">
          <h1 className="text-xl font-bold">ClubConnect</h1>
          <Image
            src="/images/logo/favIcon.svg"
            alt="ClubConnect Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div className="p-4 flex-grow overflow-y-auto">
          {user && (
            <Link href={`/${user.role}/profile`} className="flex items-center space-x-4 mb-6 hover:bg-gray-100 rounded p-2">
              <Avatar>
                <AvatarImage src={user.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} alt={user.name} />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              </div>
            </Link>
          )}
          <nav className="space-y-2">
            {user && getNavItems(user.role).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded transition-colors",
                  pathname === item.href
                    ? "bg-gray-200 text-gray-900"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-left text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <LogOut size={20} className="mr-2" />
              <span>Logout</span>
            </Button>
          </nav>
        </div>
      </aside>
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  )
}