"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navigation from '@/components/navigation'

// Mock data for announcements (replace with actual data fetching in a real application)
const announcements = [
  {
    id: 1,
    title: "Campus-wide Event",
    content: "Join us for the annual campus festival next week! There will be food stalls, music performances, and various club demonstrations. Don't miss out on this exciting event!",
    type: "global",
    date: "2024-07-15",
    image: "/images/about-mobile.jpg",
  },
  {
    id: 2,
    title: "Chess Tournament",
    content: "Chess Club is organizing an inter-college tournament. All skill levels are welcome to participate. Prizes for the top three winners!",
    type: "club",
    clubName: "Chess Club",
    date: "2024-07-20",
    image: "",
  },
  
  {
    id: 3,
    title: "Holiday Notice",
    content: "The campus will be closed for the upcoming holiday on October 28th. All club activities scheduled for this day will be postponed.",
    type: "global",
    date: "2024-10-27",
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
      <Navigation active={'announcements'}/>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Announcements</h1>
          
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
      </main>
    </div>
  )
}