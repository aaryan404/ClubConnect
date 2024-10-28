"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Settings, TrendingUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Navigation from '@/components/studentNavigation'

// Mock data for recent announcements (replace with actual data fetching in a real application)
const recentAnnouncements = [
  {
    id: 1,
    title: "Campus-wide Event",
    content: "Join us for the annual campus festival next week!",
    type: "global",
    date: "2023-07-15",
    image: "/images/about-mobile.jpg", // Add a valid image path or URL
  },
  {
    id: 2,
    title: "Chess Tournament",
    content: "Chess Club is organizing an inter-college tournament.",
    type: "club",
    clubName: "Chess Club",
    date: "2023-07-20",
  },
]

// Mock data for recent events with highest join clicks
const recentEvents = [
  {
    id: 1,
    title: "Chess Competition",
    club: "Chess Club",
    date: "2024-08-05",
    joinClicks: 43,
  },
  {
    id: 2,
    title: "Summer Soccer Fest",
    club: "Soccer Club",
    date: "2024-09-30",
    joinClicks: 142,
  },
  {
    id: 3,
    title: "Book review session",
    club: "Book Club",
    date: "2024-10-02",
    joinClicks: 23,
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
    name: "Coding Club",
    members: 95,
  },
]

export default function StudentDashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Navigation active={'dashboard'}/>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
        
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Announcements</CardTitle>
            <Button variant="outline" asChild>
              <Link href="/student/announcements">View All</Link>
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
                      <div className="w-[500px] h-[300px] mb-4 overflow-hidden">
                        <Image
                          src={announcement.image}
                          alt={announcement.title}
                          width={500}
                          height={300}
                          className="rounded-md object-cover w-full h-full"
                        />
                      </div>
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
                <Link href="/student/events">View All Events</Link>
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
                <Link href="/student/clubs">View All Clubs</Link>
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