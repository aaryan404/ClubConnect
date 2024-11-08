"use client"

import { useState, useEffect } from "react"
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
import { createClub } from "@/app/actions/createClub"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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

interface Club {
  id: string
  name: string
  description: string
  member_count: number
}

export default function AdminClubManagement() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [newClub, setNewClub] = useState({ name: "", description: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
    
    if (error) {
      console.error('Error fetching clubs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch clubs",
        variant: "destructive",
      })
    } else {
      setClubs(data || [])
    }
  }

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const result = await createClub(newClub.name, newClub.description)
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Club created successfully",
      })
      setNewClub({ name: "", description: "" })
      fetchClubs()
    }
    setIsLoading(false)
  }

  const handleDeleteClub = async () => {
    if (!clubToDelete) return

    const { error } = await supabase
      .from('clubs')
      .delete()
      .eq('id', clubToDelete.id)
    
    if (error) {
      console.error('Error deleting club:', error)
      toast({
        title: "Error",
        description: "Failed to delete club",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Club deleted successfully",
      })
      fetchClubs()
    }
    setClubToDelete(null)
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Club'}
            </Button>
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
                  <TableCell>{club.member_count}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setClubToDelete(club)}
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

      <AlertDialog open={!!clubToDelete} onOpenChange={() => setClubToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this club?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the club
              "{clubToDelete?.name}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClub}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}