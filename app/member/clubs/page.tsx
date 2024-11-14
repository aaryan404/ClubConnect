"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
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
import confetti from 'canvas-confetti'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from '@/hooks/use-toast'

interface Club {
  id: string
  name: string
  description: string
  image_url: string
  joined: boolean
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [joinedClubId, setJoinedClubId] = useState<string | null>(null)
  const [leavingClub, setLeavingClub] = useState<{ id: string, name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchClubs()
  }, [])

  async function fetchClubs() {
    setIsLoading(true)
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error("User not found")

      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select('*')

      if (clubsError) throw clubsError

      const { data: studentClubsData, error: studentClubsError } = await supabase
        .from('student_clubs')
        .select('club_id')
        .eq('student_id', user.user.id)

      if (studentClubsError) throw studentClubsError

      const joinedClubIds = new Set(studentClubsData.map(sc => sc.club_id))

      const formattedClubs = clubsData
        .filter(club => club.name !== "Global")
        .map(club => ({
          ...club,
          joined: joinedClubIds.has(club.id)
        }))

      setClubs(formattedClubs)
    } catch (error) {
      console.error('Error fetching clubs:', error)
      toast({
        title: "Error",
        description: "Failed to load clubs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const joinedClubs = clubs.filter(club => club.joined)

  const handleJoin = async (clubId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error("User not found")

      const { error } = await supabase
        .from('student_clubs')
        .insert({ student_id: user.user.id, club_id: clubId })

      if (error) throw error

      setClubs(clubs.map(club => 
        club.id === clubId ? { ...club, joined: true } : club
      ))
      setJoinedClubId(clubId)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
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

  const handleLeave = (clubId: string, clubName: string) => {
    setLeavingClub({ id: clubId, name: clubName })
  }

  const confirmLeave = async () => {
    if (leavingClub) {
      try {
        const { data: user } = await supabase.auth.getUser()
        if (!user.user) throw new Error("User not found")

        const { error } = await supabase
          .from('student_clubs')
          .delete()
          .eq('student_id', user.user.id)
          .eq('club_id', leavingClub.id)

        if (error) throw error

        setClubs(clubs.map(club => 
          club.id === leavingClub.id ? { ...club, joined: false } : club
        ))
        setLeavingClub(null)
      } catch (error) {
        console.error('Error leaving club:', error)
        toast({
          title: "Error",
          description: "Failed to leave the club. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  useEffect(() => {
    if (joinedClubId !== null) {
      const timer = setTimeout(() => setJoinedClubId(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [joinedClubId])

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Navigation active="clubs" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    )
  }

  const renderClubCard = (club: Club) => (
    <Card key={club.id} className="bg-gradient-to-br from-white to-gray-100 shadow-sm w-[250px] h-[320px] flex flex-col">
      <CardHeader className="flex flex-col items-center space-y-2 pb-2">
        <div className="w-16 h-16 relative">
          <Image
            src={club.image_url}
            alt={club.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <CardTitle className="text-lg text-center line-clamp-1">{club.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-center flex-grow flex flex-col justify-between">
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">{club.description}</p>
        <Button 
          variant={club.joined ? "outline" : "default"}
          onClick={() => club.joined ? handleLeave(club.id, club.name) : handleJoin(club.id)}
          className={`w-full ${joinedClubId === club.id ? 'animate-bounce' : ''}`}
        >
          {club.joined ? (
            <>
              <UserMinus className="mr-2 h-4 w-4" />
              Leave Club
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Join Club
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex h-screen bg-gray-100">
      <Navigation active="clubs" />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Clubs</h1>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Clubs</TabsTrigger>
            <TabsTrigger value="joined">Joined Clubs</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
              {clubs.map(renderClubCard)}
            </div>
          </TabsContent>
          <TabsContent value="joined">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
              {joinedClubs.map(renderClubCard)}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={leavingClub !== null} onOpenChange={() => setLeavingClub(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Club</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave {leavingClub?.name}? You can always join again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}