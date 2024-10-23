"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Settings, Globe, UserPlus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Mock data for events (replace with actual data fetching in a real application)
const allEvents = [
  {
    id: 1,
    title: "Chess Tournament",
    description: "Annual chess tournament for all skill levels",
    date: "2023-08-15",
    time: "14:00",
    location: "Main Hall",
    club: "Chess Club",
    image: "/placeholder.svg?height=100&width=200",
    isGlobal: false,
  },
  {
    id: 2,
    title: "Campus-wide Career Fair",
    description: "Explore job opportunities with top companies",
    date: "2023-08-20",
    time: "10:00",
    location: "University Gymnasium",
    isGlobal: true,
  },
  {
    id: 3,
    title: "Debate Competition",
    description: "Inter-college debate on current global issues",
    date: "2023-08-25",
    time: "16:00",
    location: "Auditorium",
    club: "Debate Society",
    image: "/placeholder.svg?height=100&width=200",
    isGlobal: false,
  },
  {
    id: 4,
    title: "Freshers' Welcome Party",
    description: "Welcome party for new students",
    date: "2023-09-01",
    time: "18:00",
    location: "Student Center",
    isGlobal: true,
  },
  {
    id: 5,
    title: "Photography Exhibition",
    description: "Showcase of student photographs",
    date: "2023-09-05",
    time: "11:00",
    location: "Art Gallery",
    club: "Photography Club",
    isGlobal: false,
  },
]

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [joinedEvents, setJoinedEvents] = useState<number[]>([])

  const filteredEvents = allEvents.filter(event => {
    if (activeTab === "all") return true
    if (activeTab === "global") return event.isGlobal
    if (activeTab === "club") return !event.isGlobal
    return true
  })

  const handleJoinEvent = (eventId: number) => {
    setJoinedEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId)
      } else {
        return [...prev, eventId]
      }
    })
  }

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
            <Link href="/sub-admin/events" className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
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
        <h1 className="text-3xl font-bold mb-6">Events</h1>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setActiveTab("all")}>All Events</TabsTrigger>
            <TabsTrigger value="global" onClick={() => setActiveTab("global")}>Global Events</TabsTrigger>
            <TabsTrigger value="club" onClick={() => setActiveTab("club")}>Club Events</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="bg-white shadow-sm flex flex-col">
              {event.image && (
                <CardHeader className="p-0">
                  <Image
                    src={event.image}
                    alt={event.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </CardHeader>
              )}
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Date:</strong> {event.date}</p>
                  <p className="text-sm"><strong>Time:</strong> {event.time}</p>
                  <p className="text-sm"><strong>Location:</strong> {event.location}</p>
                  <p className="text-sm">
                    <strong>{event.isGlobal ? "Global Event" : `Club: ${event.club}`}</strong>
                  </p>
                </div>
              </CardContent>
              <CardFooter className="p-4">
                <Button 
                  className="w-full" 
                  variant={joinedEvents.includes(event.id) ? "secondary" : "default"}
                  onClick={() => handleJoinEvent(event.id)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {joinedEvents.includes(event.id) ? "Leave Event" : "Join Event"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}