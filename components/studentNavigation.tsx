"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Settings, TrendingUp, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from "@/hooks/use-toast"

interface NavigationProps {
  active: 'profile' | 'dashboard' | 'announcements' | 'clubs' | 'events' | 'settings'
}

interface StudentProfile {
  id: string
  name: string
  avatar_url: string | null
}

export default function StudentNavigation({ active }: NavigationProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchStudentProfile()
  }, [])

  async function fetchStudentProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
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

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
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

  if (isLoading) {
    return (
      <aside className="w-64 bg-white shadow-md flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </aside>
    )
  }

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col">
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
      <div className="p-4 flex-grow">
        <Link href="/member/profile" className="flex items-center space-x-4 mb-6 hover:bg-gray-100 rounded p-2">
          <Avatar>
            <AvatarImage src={studentProfile?.avatar_url || "/placeholder.svg"} alt={studentProfile?.name || "Student"} />
            <AvatarFallback>{studentProfile?.name?.[0] || "S"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{studentProfile?.name || "Student Name"}</h2>
            <p className="text-sm text-gray-500">Student</p>
          </div>
        </Link>
        <nav className="space-y-2">
          <NavItem href="/member/dashboard" icon={<TrendingUp size={20} />} label="Dashboard" isActive={active === 'dashboard'} disabled={isLoggingOut} />
          <NavItem href="/member/announcements" icon={<Bell size={20} />} label="Announcements" isActive={active === 'announcements'} disabled={isLoggingOut} />
          <NavItem href="/member/clubs" icon={<ClipboardList size={20} />} label="Clubs" isActive={active === 'clubs'} disabled={isLoggingOut} />
          <NavItem href="/member/events" icon={<Calendar size={20} />} label="Events" isActive={active === 'events'} disabled={isLoggingOut} />
        </nav>
      </div>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut size={20} className="mr-2" />}
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </aside>
  )
}

function NavItem({ href, icon, label, isActive = false, disabled = false }: { href: string; icon: React.ReactNode; label: string; isActive?: boolean; disabled?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center space-x-2 p-2 rounded ${isActive ? 'bg-gray-100' : 'hover:bg-gray-100'} ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault()
        }
      }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}