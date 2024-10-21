"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for announcements (replace with actual data fetching in a real application)
const announcements = [
  {
    id: 1,
    title: "Campus-wide Event",
    content: "Join us for the annual campus festival next week! There will be food stalls, music performances, and various club demonstrations. Don't miss out on this exciting event!",
    type: "global",
    date: "2023-07-15",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    title: "Chess Tournament",
    content: "Chess Club is organizing an inter-college tournament. All skill levels are welcome to participate. Prizes for the top three winners!",
    type: "club",
    clubName: "Chess Club",
    date: "2023-07-20",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    title: "New Debate Topics",
    content: "Check out the new topics for our upcoming debate session. We'll be discussing current global issues and their impact on student life.",
    type: "club",
    clubName: "Debate Society",
    date: "2023-07-18",
  },
  {
    id: 4,
    title: "Holiday Notice",
    content: "The campus will be closed for the upcoming holiday on July 22nd. All club activities scheduled for this day will be postponed.",
    type: "global",
    date: "2023-07-22",
  },
  {
    id: 5,
    title: "Drama Club Auditions",
    content: "We're holding auditions for our upcoming play 'The Importance of Being Earnest'. All interested students are encouraged to participate!",
    type: "club",
    clubName: "Drama Club",
    date: "2023-07-25",
    image: "/placeholder.svg?height=200&width=400",
  },
]

export default function AnnouncementsPage() {
  const [activeTab, setActiveTab] = useState("all")

  const filteredAnnouncements = announcements.filter(announcement => {
    if (activeTab === "all") return true
    if (activeTab === "global") return announcement.type === "global"
    if (activeTab === "club") return announcement.type === "club"
    return true
  })

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
            <Link href="/sub-admin/dashboard" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Users size={20} />
              <span>Dashboard</span>
            </Link>
            <Link href="/sub-admin/announcements" className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Announcements</h1>
          <Button>Create Announcement</Button>
        </div>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setActiveTab("all")}>All Announcements</TabsTrigger>
            <TabsTrigger value="global" onClick={() => setActiveTab("global")}>Global</TabsTrigger>
            <TabsTrigger value="club" onClick={() => setActiveTab("club")}>Club</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="space-y-6">
          {filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">{announcement.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {announcement.type === "global" ? "Global Announcement" : `From: ${announcement.clubName}`} • {announcement.date}
                </p>
              </CardHeader>
              <CardContent>
                {announcement.image && (
                  <Image
                    src={announcement.image}
                    alt={announcement.title}
                    width={400}
                    height={200}
                    className="mb-4 rounded-md object-cover w-full"
                  />
                )}
                <p className="text-gray-700">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}