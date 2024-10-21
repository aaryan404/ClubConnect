"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Settings, UserPlus, UserMinus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for clubs (replace with actual data fetching in a real application)
const allClubs = [
  {
    id: 1,
    name: "Chess Club",
    description: "For chess enthusiasts of all levels",
    image: "/placeholder.svg?height=100&width=100",
    joined: true,
  },
  {
    id: 2,
    name: "Debate Society",
    description: "Sharpen your argumentation skills",
    image: "/placeholder.svg?height=100&width=100",
    joined: false,
  },
  {
    id: 3,
    name: "Photography Club",
    description: "Capture the world through your lens",
    image: "/placeholder.svg?height=100&width=100",
    joined: true,
  },
  {
    id: 4,
    name: "Robotics Club",
    description: "Build and program robots",
    image: "/placeholder.svg?height=100&width=100",
    joined: false,
  },
  {
    id: 5,
    name: "Environmental Club",
    description: "Promote sustainability on campus",
    image: "/placeholder.svg?height=100&width=100",
    joined: false,
  },
]

export default function ClubsPage() {
  const [clubs, setClubs] = useState(allClubs)

  const joinedClubs = clubs.filter(club => club.joined)

  const handleJoinLeave = (clubId: number) => {
    setClubs(clubs.map(club => 
      club.id === clubId ? { ...club, joined: !club.joined } : club
    ))
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 flex justify-between items-center border-b">
          <h1 className="text-xl font-bold">ClubConnect</h1>
          <Image
            src="/placeholder.svg?height=40&width=40"
            alt="ClubConnect Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div className="p-4 flex-grow">
          <Link href="/sub-admin/profile" className="flex items-center space-x-4 mb-6 hover:bg-gray-100 rounded p-2">
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt="Sub-Admin" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">Sarah Adams</h2>
              <p className="text-sm text-gray-500">Sub-Admin</p>
            </div>
          </Link>
          <nav className="space-y-2">
            <Link href="/sub-admin/dashboard" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Users size={20} />
              <span>Dashboard</span>
            </Link>
            <Link href="/sub-admin/announcements" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Bell size={20} />
              <span>Announcements</span>
            </Link>
            <Link href="/sub-admin/clubs" className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
              <ClipboardList size={20} />
              <span>Clubs</span>
            </Link>
            <Link href="/sub-admin/club-management" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Settings size={20} />
              <span>Club Management</span>
            </Link>
            <Link href="/sub-admin/events" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Calendar size={20} />
              <span>Events</span>
            </Link>
            <Link href="/sub-admin/members" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Users size={20} />
              <span>Members</span>
            </Link>
            <Link href="/auth/signin" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <LogOut size={20} />
              <span>Logout</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Clubs</h1>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Clubs</TabsTrigger>
            <TabsTrigger value="joined">Joined Clubs</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs.map((club) => (
                <Card key={club.id} className="bg-white shadow-sm">
                  <CardHeader className="flex flex-row items-center space-x-4">
                    <Image
                      src={club.image}
                      alt={club.name}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <CardTitle className="text-xl">{club.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{club.description}</p>
                    <Button 
                      variant={club.joined ? "outline" : "default"}
                      onClick={() => handleJoinLeave(club.id)}
                      className="w-full"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedClubs.map((club) => (
                <Card key={club.id} className="bg-white shadow-sm">
                  <CardHeader className="flex flex-row items-center space-x-4">
                    <Image
                      src={club.image}
                      alt={club.name}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <CardTitle className="text-xl">{club.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{club.description}</p>
                    <Button 
                      variant="outline"
                      onClick={() => handleJoinLeave(club.id)}
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
    </div>
  )
}