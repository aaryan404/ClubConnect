"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Settings, TrendingUp, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Navigation from '@/components/studentNavigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from '@/hooks/use-toast'

interface Announcement {
  id: number
  title: string
  content: string
  club_id: string
  created_at: string
  image_url?: string
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
}

export default function StudentDashboard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

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
      .select('id, title, content, club_id, created_at, image_url')
      .eq('club_id', 'Global')
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('Error fetching announcements:', error)
      throw error
    }

    return data
  }

  async function fetchEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, date, join_clicks, clubs(id, name)')
      .order('join_clicks', { ascending: false })
      .limit(3)

    if (error) {
      console.error('Error fetching events:', error)
      throw error
    }

    return data.map(item => ({
      id: item.id,
      title: item.title,
      date: item.date,
      join_clicks: item.join_clicks,
      club_name: item.clubs[0].name
    }))
  }

  async function fetchClubs(): Promise<Club[]> {
    const { data, error } = await supabase
      .from('clubs')
      .select('id, name, member_count')
      .order('member_count', { ascending: false })
      .limit(2)

    if (error) {
      console.error('Error fetching clubs:', error)
      throw error
    }

    return data
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

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
        
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Announcements</CardTitle>
            <Button variant="outline" asChild>
              <Link href="/member/announcements">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="bg-white shadow-sm">
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
                <Link href="/student/clubs">View All Clubs</Link>
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