"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ClipboardList, Calendar, Bell, LogOut, Settings, UserPlus, UserMinus } from 'lucide-react'
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
import Navigation from '@/components/navigation'
import confetti from 'canvas-confetti'

const allClubs = [
  {
    id: 1,
    name: "NCT Coding Club",
    description: "Explore the world of programming and software development",
    image: "/clubs logos/coding.png",
    joined: false,
  },
  {
    id: 2,
    name: "NCT Robotics Club",
    description: "Design, build, and program robots for various applications",
    image: "/clubs logos/robotics.png",
    joined: false,
  },
  {
    id: 3,
    name: "NCT E-Sports Club",
    description: "Compete in various video game tournaments and events",
    image: "/clubs logos/e-sports.png",
    joined: false,
  },
  {
    id: 4,
    name: "NCT Boardgames Club",
    description: "Enjoy strategy and fun with a variety of board games",
    image: "/clubs logos/boardgames.png",
    joined: false,
  },
  {
    id: 5,
    name: "NCT Book Club",
    description: "Discuss and explore literature from various genres",
    image: "/clubs logos/book.png",
    joined: false,
  },
  {
    id: 6,
    name: "NCT Cricket Club",
    description: "Play and improve your cricket skills",
    image: "/clubs logos/cricket.png",
    joined: false,
  },
  {
    id: 7,
    name: "Basketball Club",
    description: "Shoot hoops and develop your basketball techniques",
    image: "/clubs logos/basketball.png",
    joined: false,
  },
  {
    id: 8,
    name: "Volleyball Club",
    description: "Spike, serve, and enjoy volleyball with fellow enthusiasts",
    image: "/clubs logos/volleyball.png",
    joined: false,
  },
  {
    id: 9,
    name: "Badminton Club",
    description: "Improve your badminton skills and participate in tournaments",
    image: "/clubs logos/badminton.png",
    joined: false,
  },
  {
    id: 10,
    name: "Soccer Club",
    description: "Play soccer and develop your teamwork skills",
    image: "/clubs logos/soccer.png",
    joined: false,
  },
]

export default function ClubsPage() {
  const [clubs, setClubs] = useState(allClubs)
  const [joinedClubId, setJoinedClubId] = useState<number | null>(null)
  const [leavingClub, setLeavingClub] = useState<{ id: number, name: string } | null>(null)

  const joinedClubs = clubs.filter(club => club.joined)

  const handleJoin = (clubId: number) => {
    setClubs(clubs.map(club => 
      club.id === clubId ? { ...club, joined: true } : club
    ))
    setJoinedClubId(clubId)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  const handleLeave = (clubId: number, clubName: string) => {
    setLeavingClub({ id: clubId, name: clubName })
  }

  const confirmLeave = () => {
    if (leavingClub) {
      setClubs(clubs.map(club => 
        club.id === leavingClub.id ? { ...club, joined: false } : club
      ))
      setLeavingClub(null)
    }
  }

  useEffect(() => {
    if (joinedClubId !== null) {
      const timer = setTimeout(() => setJoinedClubId(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [joinedClubId])

  return (
    <div className="flex h-screen bg-gray-100">
      <Navigation active={'clubs'}/>
      
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Clubs</h1>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Clubs</TabsTrigger>
            <TabsTrigger value="joined">Joined Clubs</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {clubs.map((club) => (
                <Card key={club.id} className="bg-gradient-to-br from-white to-gray-100 shadow-sm max-w-[250px] mx-auto">
                  <CardHeader className="flex flex-col items-center space-y-2 pb-2">
                    <Image
                      src={club.image}
                      alt={club.name}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <CardTitle className="text-lg text-center">{club.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
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
              ))}
            </div>
          </TabsContent>
          <TabsContent value="joined">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {joinedClubs.map((club) => (
                <Card key={club.id} className="bg-gradient-to-br from-white to-gray-100 shadow-sm max-w-[250px] mx-auto">
                  <CardHeader className="flex flex-col items-center space-y-2 pb-2">
                    <Image
                      src={club.image}
                      alt={club.name}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <CardTitle className="text-lg text-center">{club.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">{club.description}</p>
                    <Button 
                      variant="outline"
                      onClick={() => handleLeave(club.id, club.name)}
                      className="w-full"
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Leave Club
                    </Button>
                  </CardContent>
                </Card>
              ))}
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