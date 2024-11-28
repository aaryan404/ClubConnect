"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Router } from 'lucide-react'
import Navigation from '@/components/studentNavigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from "@/hooks/use-toast"

const blinkAnimation = `
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }
  .blink {
    animation: blink .5s linear infinite;
  }
`;

interface Announcement {
  id: string
  title: string
  content: string
  club_id: string
  date: string
  created_at: string
  image_url?: string
  clubs?: {
    name: string
  }
}

interface UserClub {
  club_id: string
}

export default function AnnouncementsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userClubs, setUserClubs] = useState<string[]>([])
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    
    fetchUserClubs()
    fetchAnnouncements()
  }, [activeTab])

  const fetchUserClubs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')
        

      const { data, error } = await supabase
        .from('student_clubs')
        .select('club_id')
        .eq('student_id', user.id)
      
      if (error) throw error
      
      setUserClubs((data as UserClub[]).map(club => club.club_id))
    } catch (error) {
      console.error('Error fetching user clubs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch user clubs. Please try again later.",
        variant: "destructive",
      })
    }
  }

  async function fetchAnnouncements() {
    setIsLoading(true)
    try {
      let query = supabase
        .from('announcements')
        .select('*, clubs(name)')
        .order('created_at', { ascending: false })
  
      if (activeTab === "global") {
        // Only fetch global announcements
        query = query.eq('club_id', '8cbef270-ff70-4a4d-97a1-94b8cf0121dc')
      } else if (activeTab === "club") {
        // Fetch announcements from clubs the user is a member of
        query = query.in('club_id', userClubs)
          .neq('club_id', '8cbef270-ff70-4a4d-97a1-94b8cf0121dc')
      } else if (activeTab === "all") {
        // Fetch global announcements and announcements from clubs the user is a member of
        query = query.or(
          `club_id.eq.8cbef270-ff70-4a4d-97a1-94b8cf0121dc,club_id.in.(${userClubs.join(',')}))`
        )
      }
  
      const { data, error } = await query
  
      if (error) throw error
  
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast({
        title: "Error",
        description: "Failed to load announcements. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Navigation active="announcements" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    )
  }

  return (
    <>
      <style jsx>{blinkAnimation}</style>
    <div className="flex h-screen bg-gray-100">
      <Navigation active="announcements" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Announcements</h1>
        </div>

        <div className="mb-6">
          <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Announcements</TabsTrigger>
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="club">Club</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          {announcements.length === 0 ? (
            <Card className="bg-white shadow-sm">
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No announcements found.</p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id} className="bg-white shadow-sm relative">
                {userClubs.includes(announcement.club_id) && (
                  <div 
                    className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full blink" 
                    title="You are a member of this club"
                  />
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{announcement.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {announcement.club_id === '8cbef270-ff70-4a4d-97a1-94b8cf0121dc' 
                      ? "Global Announcement" 
                      : `From: ${announcement.clubs?.name}`} • {new Date(announcement.date).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  {announcement.image_url && (
                    <div className="w-full h-[300px] mb-4 overflow-hidden">
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
            ))
          )}
        </div>
      </main>
    </div>
    </>
  )
}