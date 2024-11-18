"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ClipboardList, Calendar, Award } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ClubData {
  id: string
  name: string
  member_count: number
}

interface EventData {
  id: string
  title: string
  join_clicks: number
}

export default function AdminDashboard() {
  const [totalClubs, setTotalClubs] = useState(0)
  const [totalActiveEvents, setTotalActiveEvents] = useState(0)
  const [totalStudents, setTotalStudents] = useState(0)
  const [clubData, setClubData] = useState<ClubData[]>([])
  const [eventData, setEventData] = useState<EventData[]>([])
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/signin')
          return
        }

        // Fetch admin data
        const { data: adminData, error: adminError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (adminError) throw adminError
        setAdmin(adminData)

        // Fetch total clubs count
        const { count: clubsCount, error: clubsError } = await supabase
          .from('clubs')
          .select('*', { count: 'exact', head: true })
          .neq('name', 'Global')

        if (clubsError) throw clubsError
        setTotalClubs(clubsCount || 0)

        // Fetch active events count
        const { count: eventsCount, error: eventsError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .gte('date', new Date().toISOString())

        if (eventsError) throw eventsError
        setTotalActiveEvents(eventsCount || 0)

        // Fetch total students count
        const { count: studentsCount, error: studentsError } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })

        if (studentsError) throw studentsError
        setTotalStudents(studentsCount || 0)

        // Fetch club data with member counts
        const { data: clubsData, error: clubsDataError } = await supabase
          .from('clubs')
          .select('id, name, member_count')
          .order('member_count', { ascending: false })
          .limit(10)

        if (clubsDataError) throw clubsDataError
        setClubData(clubsData.filter(club => club.name !== "Global"))

        // Fetch event data with participant counts
        const { data: eventsData, error: eventsDataError } = await supabase
          .from('events')
          .select('id, title, join_clicks')
          .order('join_clicks', { ascending: false })
          .limit(5)

        if (eventsDataError) throw eventsDataError
        setEventData(eventsData || [])

      } catch (error) {
        setError((error as any).message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router, supabase])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activePage="/admin/dashboard" />

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClubs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActiveEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Club Membership Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  members: {
                    label: "Members",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clubData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="member_count" fill="var(--color-members)" name="Members" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {eventData.map((event) => (
                  <li key={event.id} className="flex justify-between items-center">
                    <span>{event.title}</span>
                    <span className="font-bold text-stone-600">{event.join_clicks} participants</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Clubs</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {clubData.slice(0, 5).map((club) => (
                  <li key={club.id} className="flex items-center">
                    <Award className="mr-2 h-4 w-4" />
                    <span>{club.name}</span>
                    <span className="ml-auto font-bold text-slate-600">{club.member_count} members</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Members per Club</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {clubData.map((club) => (
                  <div key={club.id} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-lg mb-2">{club.name}</h3>
                    <p className="text-2xl font-bold">{club.member_count}</p>
                    <p className="text-sm text-gray-500">Members</p>
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