"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Settings, TrendingUp } from 'lucide-react'
import { Button } from "@/components/ui/button"

// Mock data for recent announcements (replace with actual data fetching in a real application)
const recentAnnouncements = [
  {
    id: 1,
    title: "Campus-wide Event",
    content: "Join us for the annual campus festival next week!",
    type: "global",
    date: "2023-07-15",
    image: "/placeholder.svg?height=150&width=300",
  },
  {
    id: 2,
    title: "Chess Tournament",
    content: "Chess Club is organizing an inter-college tournament.",
    type: "club",
    clubName: "Chess Club",
    date: "2023-07-20",
  },
  {
    id: 3,
    title: "New Debate Topics",
    content: "Check out the new topics for our upcoming debate session.",
    type: "club",
    clubName: "Debate Society",
    date: "2023-07-18",
    image: "/placeholder.svg?height=150&width=300",
  },
]

// Mock data for recent events with highest join clicks
const recentEvents = [
  {
    id: 1,
    title: "Annual Tech Symposium",
    club: "Computer Science Club",
    date: "2023-08-05",
    joinClicks: 156,
  },
  {
    id: 2,
    title: "Summer Music Festival",
    club: "Music Club",
    date: "2023-07-30",
    joinClicks: 142,
  },
  {
    id: 3,
    title: "Environmental Awareness Workshop",
    club: "Green Earth Society",
    date: "2023-08-10",
    joinClicks: 128,
  },
]

// Mock data for trending clubs
const trendingClubs = [
  {
    id: 1,
    name: "Robotics Club",
    members: 120,
  },
  {
    id: 2,
    name: "Photography Society",
    members: 95,
  },
]

export default function SubAdminDashboard() {
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
            <Link href="/sub-admin/announcements" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Bell size={20} />
              <span>Announcements</span>
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
        
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Announcements</CardTitle>
            <Button variant="outline" asChild>
              <Link href="/sub-admin/announcements">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <Card key={announcement.id} className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {announcement.type === "global" ? "Global Announcement" : `From: ${announcement.clubName}`} • {announcement.date}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {announcement.image && (
                      <Image
                        src={announcement.image}
                        alt={announcement.title}
                        width={300}
                        height={150}
                        className="mb-4 rounded-md object-cover w-full"
                      />
                    )}
                    <p className="text-gray-700">{announcement.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Popular Events</CardTitle>
              <Button variant="outline" asChild>
                <Link href="/sub-admin/events">View All Events</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.club} • {event.date}</p>
                    </div>
                    <div className="text-sm font-medium">
                      {event.joinClicks} joins
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Trending Clubs</CardTitle>
              <Button variant="outline" asChild>
                <Link href="/sub-admin/clubs">View All Clubs</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingClubs.map((club) => (
                  <div key={club.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{club.name}</h3>
                      <p className="text-sm text-muted-foreground">{club.members} members</p>
                    </div>
                    <Button size="sm">Join</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}