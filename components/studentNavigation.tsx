"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Settings, TrendingUp } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface NavigationProps {
  active: 'profile'|'dashboard' | 'announcements' | 'clubs' | 'events' | 'settings'
}

export default function StudentNavigation({ active }: NavigationProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = () => {
    setIsLoggingOut(true)
    // Perform logout logic here (e.g., clear session, cookies, etc.)
    // Then navigate to the signin page
    router.push('/auth/signin')
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
            <AvatarImage src="/placeholder.svg" alt="Student" />
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">Aaryan Khatri</h2>
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
          <LogOut size={20} className="mr-2" />
          Logout
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