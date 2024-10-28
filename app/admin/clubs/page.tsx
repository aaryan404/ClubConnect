"use client"

import { useState } from "react"
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Trash2, UserPlus } from 'lucide-react'

interface Club {
  id: number
  name: string
  description: string
  members: number
}

export default function AdminClubManagement() {
  const [clubs, setClubs] = useState<Club[]>([
    { id: 1, name: "NCT Coding Club", description: "For coding enthusiasts", members: 25 },
    { id: 2, name: "NCT Robotics Club", description: "Build and program robots", members: 20 },
    { id: 3, name: "NCT E-Sports Club", description: "Competitive gaming", members: 30 },
    { id: 4, name: "NCT Boardgames Club", description: "Strategy and fun with boardgames", members: 15 },
    { id: 5, name: "NCT Book Club", description: "For book lovers", members: 18 },
    { id: 6, name: "NCT Cricket Club", description: "Play cricket", members: 22 },
    { id: 7, name: "Basketball Club", description: "Shoot some hoops", members: 20 },
    { id: 8, name: "Volleyball Club", description: "Spike and serve", members: 18 },
    { id: 9, name: "Badminton Club", description: "Racquet sports enthusiasts", members: 16 },
    { id: 10, name: "Soccer Club", description: "Football for all", members: 24 },
  ])
  const [newClub, setNewClub] = useState({ name: "", description: "" })

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault()
    const club: Club = {
      id: clubs.length + 1,
      name: newClub.name,
      description: newClub.description,
      members: 0,
    }
    setClubs([...clubs, club])
    setNewClub({ name: "", description: "" })
  }

  const handleDeleteClub = (id: number) => {
    setClubs(clubs.filter(club => club.id !== id))
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 flex justify-between items-center border-b">
          <h1 className="text-xl font-bold">ClubConnect</h1>
          <Image
            src="/images/logo/favIcon.svg"
            alt="ClubConnect Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div className="p-4 flex-grow">
          <Link href="/admin/profile" className="flex items-center space-x-4 mb-6 hover:bg-gray-100 rounded p-2">
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt="Admin" />
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">Aaryan Khatri</h2>
              <p className="text-sm text-gray-500">Admin</p>
            </div>
          </Link>
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Users size={20} />
              <span>Dashboard</span>
            </Link>
            <Link href="/admin/users" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <UserPlus size={20} />
              <span>User Management</span>
            </Link>
            <Link href="/admin/clubs" className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
              <ClipboardList size={20} />
              <span>Club Management</span>
            </Link>
            <Link href="/admin/events" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Calendar size={20} />
              <span>Event Management</span>
            </Link>
            <Link href="/admin/announcements" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Bell size={20} />
              <span>Announcements</span>
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
        <h1 className="text-3xl font-bold mb-6">Club Management</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Club</h2>
          <form onSubmit={handleCreateClub} className="space-y-4">
            <div>
              <Label htmlFor="clubName">Club Name</Label>
              <Input
                id="clubName"
                value={newClub.name}
                onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="clubDescription">Description</Label>
              <Input
                id="clubDescription"
                value={newClub.description}
                onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                required
              />
            </div>
            <Button type="submit">Create Club</Button>
          </form>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Existing Clubs</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell>{club.name}</TableCell>
                  <TableCell>{club.description}</TableCell>
                  <TableCell>{club.members}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClub(club.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}