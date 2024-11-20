"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, UserPlus, Check } from 'lucide-react'
import Navigation from '@/components/studentNavigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from '@/hooks/use-toast'

interface Announcement {
  image_url: string
  id: string
  title: string
  content: string
  club_id: string
  date: string
  created_at: string
  updated_at: string
}

interface Event {
  id: number
  title: string
  club_name: string
  date: string
  join_clicks: number
}

interface Club {
  id: number
  name: string
  member_count: number
  joined: boolean
}

export default function StudentDashboard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0)
  const supabase = createClientComponentClient()
  const announcementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setIsLoading(true)
    try {
      const [announcementsData, eventsData, clubsData] = await Promise.all([
        fetchAnnouncements(),
        fetchEvents(),
        fetchClubs()
      ])
      setAnnouncements(announcementsData)
      setEvents(eventsData)
      setClubs(clubsData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, content, club_id, date, created_at, updated_at, image_url')
      .order('date', { ascending: false })
      .limit(3)
  
    if (error) {
      console.error('Error fetching announcements:', error)
      throw error
    }
  
    return data || []
  }
  
  async function fetchEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        id, 
        title, 
        date, 
        join_clicks,
        club_id
      `)
      .order('join_clicks', { ascending: false })
      .limit(5) // Updated limit here

  
    if (error) {
      console.error('Error fetching events:', error)
      throw error
    }
  
    const clubIds = data.map(event => event.club_id)
    const { data: clubsData, error: clubsError } = await supabase
      .from('clubs')
      .select('id, name')
      .in('id', clubIds)
  
    if (clubsError) {
      console.error('Error fetching club names:', clubsError)
      throw clubsError
    }
  
    const clubMap = Object.fromEntries(clubsData.map(club => [club.id, club.name]))
  
    return data.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      join_clicks: event.join_clicks ?? 0,
      club_name: clubMap[event.club_id] || 'Unknown Club'
    }))
  }

  async function fetchClubs(): Promise<Club[]> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error("User not found")

    const { data, error } = await supabase
      .from('clubs')
      .select('id, name, member_count')
      .order('member_count', { ascending: false })
      .limit(4)
  
    if (error) {
      console.error('Error fetching clubs:', error)
      throw error
    }
  
    const { data: userClubs, error: userClubsError } = await supabase
      .from('student_clubs')
      .select('club_id')
      .eq('student_id', user.user.id)

    if (userClubsError) {
      console.error('Error fetching user clubs:', userClubsError)
      throw userClubsError
    }

    const userClubIds = new Set(userClubs.map(uc => uc.club_id))

    const filteredClubs = data
      .filter(club => club.name !== "Global")
      .slice(0, 3)
      .map(club => ({
        ...club,
        joined: userClubIds.has(club.id)
      }))

    return filteredClubs
  }

  const handleJoinClub = async (clubId: number) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error("User not found")

      const { error } = await supabase
        .from('student_clubs')
        .insert({ student_id: user.user.id, club_id: clubId })

      if (error) throw error

      setClubs(clubs.map(club => 
        club.id === clubId ? { ...club, joined: true, member_count: club.member_count + 1 } : club
      ))

      toast({
        title: "Success",
        description: "You have joined the club!",
      })
    } catch (error) {
      console.error('Error joining club:', error)
      toast({
        title: "Error",
        description: "Failed to join the club. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentAnnouncementIndex < announcements.length - 1) {
      setCurrentAnnouncementIndex(currentAnnouncementIndex + 1)
    } else if (direction === 'right' && currentAnnouncementIndex > 0) {
      setCurrentAnnouncementIndex(currentAnnouncementIndex - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Navigation active={'dashboard'} />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Navigation active={'dashboard'} />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 mt-8 md:mt-0">Student Dashboard</h1>
        
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Announcements</CardTitle>
            <Button variant="outline" asChild>
              <Link href="/member/announcements">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div 
              className="relative overflow-hidden touch-pan-y md:touch-auto"
              ref={announcementRef}
            >
              <div 
                className="flex md:block transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentAnnouncementIndex * 100}%)` }}
              >
                {announcements.map((announcement, index) => (
                  <Card key={announcement.id} className="bg-white shadow-sm flex-shrink-0 w-full md:mb-4">
                    <CardHeader>
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Global Announcement • {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      {announcement.image_url && (
                        <div className="w-full h-[200px] mb-4 overflow-hidden">
                          <Image
                            src={announcement.image_url}
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
            </div>
            <div className="flex justify-center mt-4 md:hidden">
              {announcements.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full mx-1 ${
                    index === currentAnnouncementIndex ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Popular Events</CardTitle>
              <Button variant="outline" asChild>
                <Link href="/member/events">View All Events</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.club_name} • {new Date(event.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-sm font-medium">
                      {event.join_clicks} joins
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
                <Link href="/member/clubs">View All Clubs</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clubs.map((club) => (
                  <div key={club.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{club.name}</h3>
                      <p className="text-sm text-muted-foreground">{club.member_count} members</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => !club.joined && handleJoinClub(club.id)}
                      disabled={club.joined}
                      variant={club.joined ? "outline" : "default"}
                    >
                      {club.joined ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Joined
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Join
                        </>
                      )}
                    </Button>
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