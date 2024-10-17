"use client"

import { useState } from "react"
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Settings } from 'lucide-react'

// Mock data (replace with actual data fetching in a real application)
const clubData = [
  { name: "Chess Club", members: 50 },
  { name: "Debate Society", members: 30 },
  { name: "Drama Club", members: 40 },
  { name: "Music Club", members: 35 },
  { name: "Sports Club", members: 60 },
]

export default function SubAdminDashboard() {
  const [totalClubs] = useState(clubData.length)
  const [totalActiveEvents] = useState(8) // Mock data
  const [totalMembers] = useState(clubData.reduce((sum, club) => sum + club.members, 0))

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 flex justify-between items-center border-b">
          <h1 className="text-xl font-bold">ClubConnect</h1>
          <Image
            src="/placeholder.svg?height=40&width=40"
            alt="ClubConnect Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div className="p-4 flex-grow">
          <Link href="/sub-admin/profile" className="flex items-center space-x-4 mb-6 hover:bg-gray-100 rounded p-2">
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt="Sub-Admin" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">Sarah Adams</h2>
              <p className="text-sm text-gray-500">Sub-Admin</p>
            </div>
          </Link>
          <nav className="space-y-2">
            <Link href="/sub-admin/dashboard" className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
              <Users size={20} />
              <span>Dashboard</span>
            </Link>
            <Link href="/sub-admin/clubs" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <ClipboardList size={20} />
              <span>Clubs</span>
            </Link>
            <Link href="/sub-admin/club-management" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Settings size={20} />
              <span>Club Management</span>
            </Link>
            <Link href="/sub-admin/events" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Calendar size={20} />
              <span>Events</span>
            </Link>
            <Link href="/sub-admin/members" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Users size={20} />
              <span>Members</span>
            </Link>
            <Link href="/sub-admin/announcements" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Bell size={20} />
              <span>Announcements</span>
            </Link>
            <Link href="/auth/signin" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <LogOut size={20} />
              <span>Logout</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Sub-Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClubs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActiveEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Members per Club</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubData.map((club) => (
                <div key={club.name} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold text-lg mb-2">{club.name}</h3>
                  <p className="text-2xl font-bold">{club.members}</p>
                  <p className="text-sm text-gray-500">Members</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}