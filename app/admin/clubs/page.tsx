"use client"

import { useState } from "react"
import Link from 'next/link'
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
import { Users, ClipboardList, Calendar, Bell, HelpCircle, MessageSquare, Settings, LogOut, Trash2 } from 'lucide-react'

interface Club {
  id: number
  name: string
  description: string
  members: number
}

export default function AdminClubManagement() {
  const [clubs, setClubs] = useState<Club[]>([
    { id: 1, name: "Chess Club", description: "For chess enthusiasts", members: 15 },
    { id: 2, name: "Debate Society", description: "Improve your public speaking", members: 20 },
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
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt="Arpine" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">Arpine</h2>
              <p className="text-sm text-gray-500">Admin</p>
            </div>
          </div>
          <nav className="space-y-2">
            <Link href="#" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Users size={20} />
              <span>User Management</span>
            </Link>
            <Link href="#" className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
              <ClipboardList size={20} />
              <span>Club Management</span>
            </Link>
            <Link href="#" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Calendar size={20} />
              <span>Event Management</span>
            </Link>
            <Link href="#" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Bell size={20} />
              <span>Announcements</span>
            </Link>
            <Link href="#" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <HelpCircle size={20} />
              <span>Help and Support</span>
            </Link>
            <Link href="#" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <MessageSquare size={20} />
              <span>Message</span>
            </Link>
            <Link href="#" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Settings size={20} />
              <span>Settings</span>
            </Link>
            <Link href="#" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
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