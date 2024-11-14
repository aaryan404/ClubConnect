"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { UserPlus, UserMinus, Globe, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import Navigation from '@/components/studentNavigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from "@/hooks/use-toast"

interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  club_id: string | null
  image_url: string
  is_global: boolean
}

interface Club {
  id: string
  name: string
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [joinedEvents, setJoinedEvents] = useState<number[]>([])
  const [eventToLeave, setEventToLeave] = useState<number | null>(null)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [userClubs, setUserClubs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchEvents()
    fetchClubs()
    fetchJoinedEvents()
    fetchUserClubs()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
      
      if (error) throw error
      
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
      
      if (error) throw error
      
      setClubs(data || [])
    } catch (error) {
      console.error('Error fetching clubs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch clubs. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const fetchJoinedEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('student_events')
        .select('event_id')
        .eq('student_id', user.id)
      
      if (error) throw error
      
      setJoinedEvents(data.map(item => item.event_id))
    } catch (error) {
      console.error('Error fetching joined events:', error)
      toast({
        title: "Error",
        description: "Failed to fetch joined events. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const fetchUserClubs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('student_clubs')
        .select('club_id')
        .eq('student_id', user.id)
      
      if (error) throw error
      
      setUserClubs(data.map(item => item.club_id))
    } catch (error) {
      console.error('Error fetching user clubs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch user clubs. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleJoinEvent = async (eventId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      if (!joinedEvents.includes(eventId)) {
        const { error } = await supabase
          .from('student_events')
          .insert({ student_id: user.id, event_id: eventId })
        
        if (error) throw error

        setJoinedEvents(prev => [...prev, eventId])
        toast({
          title: "Success",
          description: "You have joined the event.",
        })
      } else {
        setEventToLeave(eventId)
        setIsLeaveDialogOpen(true)
      }
    } catch (error) {
      console.error('Error joining event:', error)
      toast({
        title: "Error",
        description: "Failed to join the event. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleLeaveEvent = async () => {
    if (eventToLeave) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No user found')

        const { error } = await supabase
          .from('student_events')
          .delete()
          .match({ student_id: user.id, event_id: eventToLeave })
        
        if (error) throw error

        setJoinedEvents(prev => prev.filter(id => id !== eventToLeave))
        toast({
          title: "Success",
          description: "You have left the event.",
        })
      } catch (error) {
        console.error('Error leaving event:', error)
        toast({
          title: "Error",
          description: "Failed to leave the event. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setEventToLeave(null)
        setIsLeaveDialogOpen(false)
      }
    }
  }

  const filteredEvents = events.filter(event => {
    if (activeTab === "all") return true
    if (activeTab === "global") return event.is_global
    if (activeTab === "club") return !event.is_global
    if (activeTab === "joined") return joinedEvents.includes(event.id)
    return true
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Navigation active="events" />
      <main className="flex-1 p-8 overflow-y-auto">
        <style jsx global>{`
          @keyframes blink {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
          .blink {
            animation: blink 1s infinite;
          }
        `}</style>
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
            <Card key={event.id} className="bg-white shadow-sm flex flex-col relative">
              {!event.is_global && userClubs.includes(event.club_id!) && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full blink" title="You are a member of this club"></div>
              )}
              {event.image_url && (
                <CardHeader className="p-0">
                  <Image
                    src={event.image_url}
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
                  <p className="text-sm flex items-center">
                    {event.is_global ? (
                      <>
                        <Globe className="mr-1 h-4 w-4" />
                        <strong>Global Event</strong>
                      </>
                    ) : (
                      <>
                        <Users className="mr-1 h-4 w-4" />
                        <strong>Club: {clubs.find(club => club.id === event.club_id)?.name || 'Unknown'}</strong>
                      </>
                    )}
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