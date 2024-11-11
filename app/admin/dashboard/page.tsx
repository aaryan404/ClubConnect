"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ClipboardList, Calendar } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface ClubData {
  id: string
  name: string
  member_count: number
}

export default function AdminDashboard() {
  const [totalClubs, setTotalClubs] = useState(0)
  const [totalActiveEvents, setTotalActiveEvents] = useState(0)
  const [totalStudents, setTotalStudents] = useState(0)
  const [clubData, setClubData] = useState<ClubData[]>([])
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
          .order('name')

        if (clubsDataError) throw clubsDataError
        setClubData(clubsData)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data')
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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Members per Club</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </main>
    </div>
  )
}