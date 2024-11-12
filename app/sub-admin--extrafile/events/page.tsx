"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Settings, Globe, UserPlus, UserMinus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Navigation from '@/components/navigation'

// Helper function to generate random dates in 2024
const randomDate2024 = () => {
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
  return `2024-${month}-${day}`
}

// Updated mock data for events with the new list of clubs and 2024 dates
const allEvents = [
  {
    id: 1,
    title: "Coding Workshop",
    description: "Learn the basics of web development",
    date: randomDate2024(),
    time: "14:00",
    location: "Computer Lab",
    club: "NCT Coding Club",
    image: "/clubs logos/coding.png",
    isGlobal: false,
  },
  {
    id: 2,
    title: "Robot Building Competition",
    description: "Showcase your robotics skills",
    date: randomDate2024(),
    time: "10:00",
    location: "Engineering Building",
    club: "NCT Robotics Club",
    image: "/clubs logos/robotics.png",
    isGlobal: false,
  },
  {
    id: 3,
    title: "E-Sports Tournament",
    description: "Compete in popular video games",
    date: randomDate2024(),
    time: "16:00",
    location: "Student Center",
    club: "NCT E-Sports Club",
    image: "/clubs logos/e-sports.png",
    isGlobal: false,
  },
  {
    id: 4,
    title: "Board Game Night",
    description: "Enjoy a variety of board games",
    date: randomDate2024(),
    time: "18:00",
    location: "Recreation Room",
    club: "NCT Boardgames Club",
    image: "/clubs logos/boardgames.png",
    isGlobal: false,
  },
  {
    id: 5,
    title: "Cricket Match",
    description: "Inter-college cricket tournament",
    date: randomDate2024(),
    time: "09:00",
    location: "Sports Ground",
    club: "NCT Cricket Club",
    image: "/clubs logos/cricket.png",
    isGlobal: false,
  },
  {
    id: 6,
    title: "Basketball Tournament",
    description: "Annual basketball championship",
    date: randomDate2024(),
    time: "14:00",
    location: "Gymnasium",
    club: "Basketball Club",
    image: "/clubs logos/basketball.png",
    isGlobal: false,
  },
  {
    id: 7,
    title: "Badminton Tournament",
    description: "Singles and doubles badminton matches",
    date: randomDate2024(),
    time: "10:00",
    location: "Indoor Sports Complex",
    club: "Badminton Club",
    image: "/clubs logos/badminton.png",
    isGlobal: false,
  },
  {
    id: 8,
    title: "Soccer Championship",
    description: "Inter-department soccer tournament",
    date: randomDate2024(),
    time: "15:00",
    location: "Soccer Field",
    club: "Soccer Club",
    image: "/clubs logos/soccer.png",
    isGlobal: false,
  },
]

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [joinedEvents, setJoinedEvents] = useState<number[]>([])
  const [eventToLeave, setEventToLeave] = useState<number | null>(null)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)

  const filteredEvents = allEvents.filter(event => {
    if (activeTab === "all") return true
    if (activeTab === "global") return event.isGlobal
    if (activeTab === "club") return !event.isGlobal
    if (activeTab === "joined") return joinedEvents.includes(event.id)
    return true
  })

  const handleJoinEvent = (eventId: number) => {
    if (!joinedEvents.includes(eventId)) {
      setJoinedEvents(prev => [...prev, eventId])
    } else {
      setEventToLeave(eventId)
      setIsLeaveDialogOpen(true)
    }
  }

  const handleLeaveEvent = () => {
    if (eventToLeave) {
      setJoinedEvents(prev => prev.filter(id => id !== eventToLeave))
      setEventToLeave(null)
    }
    setIsLeaveDialogOpen(false)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Navigation active={'events'}/>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Events</h1>
        </div>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setActiveTab("all")}>All Events</TabsTrigger>
            <TabsTrigger value="global" onClick={() => setActiveTab("global")}>Global Events</TabsTrigger>
            <TabsTrigger value="club" onClick={() => setActiveTab("club")}>Club Events</TabsTrigger>
            <TabsTrigger value="joined" onClick={() => setActiveTab("joined")}>Joined Events</TabsTrigger>
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
                  {joinedEvents.includes(event.id) ? (
                    <>
                      <UserMinus className="mr-2 h-4 w-4" />
                      Leave Event
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Join Event
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to leave this event?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. You will need to rejoin the event if you change your mind.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEventToLeave(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeaveEvent}>Leave Event</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}