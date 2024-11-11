'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Users as UsersIcon, Trash2, Edit } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import AdminSidebar from "@/components/AdminSidebar"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Announcement {
  id: string
  title: string
  content: string
  club_id: string
  date: string
}

interface Club {
  id: string
  name: string
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState<Omit<Announcement, 'id' | 'date'>>({ title: '', content: '', club_id: '' })
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchClubs()
    fetchAnnouncements()
  }, [])

  async function fetchClubs() {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name')
        .order('name')

      if (error) {
        throw error
      }

      setClubs(data)
    } catch (error) {
      console.error('Error fetching clubs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch clubs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchAnnouncements() {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        throw error
      }

      setAnnouncements(data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast({
        title: "Error",
        description: "Failed to fetch announcements. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (editingAnnouncement) {
      setEditingAnnouncement({ ...editingAnnouncement, [name]: value })
    } else {
      setNewAnnouncement({ ...newAnnouncement, [name]: value })
    }
  }

  const handleClubChange = (value: string) => {
    if (editingAnnouncement) {
      setEditingAnnouncement({ ...editingAnnouncement, club_id: value })
    } else {
      setNewAnnouncement({ ...newAnnouncement, club_id: value })
    }
  }

  const handleAddAnnouncement = async () => {
    if (newAnnouncement.title && newAnnouncement.content && newAnnouncement.club_id) {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .insert([
            { ...newAnnouncement, date: new Date().toISOString().split('T')[0] }
          ])
          .select()

        if (error) throw error

        setAnnouncements([data[0], ...announcements])
        setNewAnnouncement({ title: '', content: '', club_id: '' })
        toast({
          title: "Announcement Added",
          description: "The announcement has been added successfully.",
        })
      } catch (error) {
        console.error('Error adding announcement:', error)
        toast({
          title: "Error",
          description: "Failed to add announcement. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
  }

  const handleUpdateAnnouncement = async () => {
    if (editingAnnouncement) {
      try {
        const { error } = await supabase
          .from('announcements')
          .update(editingAnnouncement)
          .eq('id', editingAnnouncement.id)

        if (error) throw error

        setAnnouncements(announcements.map(announcement => 
          announcement.id === editingAnnouncement.id ? editingAnnouncement : announcement
        ))
        setEditingAnnouncement(null)
        toast({
          title: "Announcement Updated",
          description: "The announcement has been updated successfully.",
        })
      } catch (error) {
        console.error('Error updating announcement:', error)
        toast({
          title: "Error",
          description: "Failed to update announcement. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteAnnouncement = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement)
  }

  const confirmDeleteAnnouncement = async () => {
    if (announcementToDelete) {
      try {
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', announcementToDelete.id)

        if (error) throw error

        setAnnouncements(announcements.filter(announcement => announcement.id !== announcementToDelete.id))
        setAnnouncementToDelete(null)
        toast({
          title: "Announcement Deleted",
          description: "The announcement has been deleted successfully.",
        })
      } catch (error) {
        console.error('Error deleting announcement:', error)
        toast({
          title: "Error",
          description: "Failed to delete announcement. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activePage="/admin/announcements" />

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Announcements</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Announcement Title</Label>
              <Input
                id="title"
                name="title"
                value={editingAnnouncement ? editingAnnouncement.title : newAnnouncement.title}
                onChange={handleInputChange}
                placeholder="Enter announcement title"
              />
            </div>
            <div>
              <Label htmlFor="content">Announcement Content</Label>
              <Textarea
                id="content"
                name="content"
                value={editingAnnouncement ? editingAnnouncement.content : newAnnouncement.content}
                onChange={handleInputChange}
                placeholder="Enter announcement content"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="club_id">Target Club</Label>
              <Select
                value={editingAnnouncement ? editingAnnouncement.club_id : newAnnouncement.club_id}
                onValueChange={handleClubChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target club" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map(club => (
                    <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editingAnnouncement ? (
              <Button onClick={handleUpdateAnnouncement}>Update Announcement</Button>
            ) : (
              <Button onClick={handleAddAnnouncement}>Post Announcement</Button>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Announcements</h2>
          {announcements.length === 0 ? (
            <p>No announcements yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map(announcement => (
                <Card key={announcement.id}>
                  <CardHeader>
                    <CardTitle>{announcement.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{announcement.content}</p>
                    <p className="mt-2 text-sm text-gray-500">Date: {announcement.date}</p>
                    <p className="mt-1 text-sm text-blue-600 flex items-center">
                      <UsersIcon className="h-4 w-4 mr-1" />
                      {clubs.find(club => club.id === announcement.club_id)?.name || 'Unknown Club'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleEditAnnouncement(announcement)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteAnnouncement(announcement)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={!!announcementToDelete} onOpenChange={() => setAnnouncementToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the announcement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAnnouncement}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}