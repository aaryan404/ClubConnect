'use client'

import { useState, useEffect } from "react"
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, UserPlus } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface AdminProfile {
  id: string
  name: string
  email: string
  avatar_url: string | null
}

interface AdminSidebarProps {
  activePage: string
}

export default function AdminSidebar({ activePage }: AdminSidebarProps) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data, error } = await supabase
            .from('admin_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) throw error
          setAdmin(data)
        } else {
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/signin')
  }

  const navItems = [
    { href: "/admin/dashboard", icon: Users, label: "Dashboard" },
    { href: "/admin/users", icon: UserPlus, label: "User Management" },
    { href: "/admin/clubs", icon: ClipboardList, label: "Club Management" },
    { href: "/admin/events", icon: Calendar, label: "Event Management" },
    { href: "/admin/announcements", icon: Bell, label: "Announcements" },
  ]

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col">
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
      <div className="p-4 flex-grow">
        {loading ? (
          <div className="flex items-center space-x-4 mb-6">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        ) : admin ? (
          <Link href="/admin/profile" className="flex items-center space-x-4 mb-6 hover:bg-gray-100 rounded p-2">
            <Avatar>
              <AvatarImage src={admin.avatar_url || "/placeholder.svg"} alt={admin.name} />
              <AvatarFallback>{admin.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{admin.name}</h2>
              <p className="text-sm text-gray-500">Admin</p>
            </div>
          </Link>
        ) : null}
        <nav className="space-y-2">
          {navItems.map((item) => (
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
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded w-full text-left text-gray-600 hover:text-gray-900"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  )
}