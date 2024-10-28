"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Settings, Menu, X } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface NavigationProps {
    active: string
}

export default function Navigation({ active }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

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

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen)
    }
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
      <aside className={`
        ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        transition-transform duration-300 ease-in-out
        ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'relative'}
        w-64 bg-white shadow-md flex flex-col
      `}>
        <div className="p-4 flex justify-between items-center border-b">
          <h1 className={`text-xl font-bold ${isMobile ? 'ml-12' : ''}`}>ClubConnect</h1>
          <Image
            src="/images/logo/favIcon.svg"
            alt="ClubConnect Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div className="p-4 flex-grow overflow-y-auto">
          <Link href="/sub-admin/profile" className={`flex items-center space-x-4 mb-6 hover:bg-gray-100 rounded p-2 ${isMobile ? 'mt-8' : ''}`}>
            <Avatar>
              <AvatarImage src="" alt="Sub-Admin" />
              <AvatarFallback>OP</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">Om Patel</h2>
              <p className="text-sm text-gray-500">Sub-Admin</p>
            </div>
          </Link>
          <nav className="space-y-2">
            <NavItem href="/sub-admin/dashboard" isActive={active === "dashboard"} icon={<Users size={20} />} label="Dashboard" />
            <NavItem href="/sub-admin/announcements" isActive={active === "announcements"} icon={<Bell size={20} />} label="Announcements" />
            <NavItem href="/sub-admin/clubs" isActive={active === "clubs"} icon={<ClipboardList size={20} />} label="Clubs" />
            <NavItem href="/sub-admin/club-management" isActive={active === "club-management"} icon={<Settings size={20} />} label="Club Management" />
            <NavItem href="/sub-admin/events" isActive={active === "events"} icon={<Calendar size={20} />} label="Events" />
            <NavItem href="/auth/signin" isActive={active === "logout"} icon={<LogOut size={20} />} label="Logout" />
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

function NavItem({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <Link href={href} className={`flex items-center space-x-2 p-2 hover:bg-gray-100 rounded ${isActive ? "bg-gray-200" : ""}`}>
      {icon}
      <span>{label}</span>
    </Link>
  )
}