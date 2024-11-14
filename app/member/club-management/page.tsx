"use client"

import { useState, useEffect } from "react"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2 } from 'lucide-react'
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
import Navigation from '@/components/studentNavigation'

interface Club {
  id: string
  name: string
  member_count: number
}

interface Announcement {
  id: string
  title: string
  content: string
  announcement_date: string
}

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  event_time: string
  location: string
}

export default function ClubManagementPage() {
  const [club, setClub] = useState<Club | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<Announcement | Event | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: 'announcement' | 'event', id: string } | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchClubData()
  }, [])

  const fetchClubData = async () => {
    setIsLoading(true)
    try {
      // Step 1: Fetch the current authenticated user's email
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      if (!user || !user.email) {
        throw new Error("User not authenticated or email not available")
      }

      // Step 2: Check if the user exists in the students table and is a sub-admin
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, role')
        .eq('email', user.email)
        .single()

      if (studentError) throw studentError

      if (!studentData || studentData.role !== 'sub-admin') {
        throw new Error("User is not authorized as a sub-admin")
      }

      // Step 3: Find the matching entry in the sub_admins table
      const { data: subAdminData, error: subAdminError } = await supabase
        .from('sub_admins')
        .select('club_id')
        .eq('user_id', studentData.id)
        .single()

      if (subAdminError) throw subAdminError

      if (!subAdminData) {
        throw new Error("No sub-admin data found for this user")
      }

      // Step 4: Fetch the club information
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', subAdminData.club_id)
        .single()

      if (clubError) throw clubError

      setClub(clubData)

      // Fetch announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('sub_admin_announcements')
        .select('*')
        .eq('sub_admin_id', studentData.id)
        .eq('club_id', subAdminData.club_id)

      if (announcementsError) throw announcementsError

      setAnnouncements(announcementsData || [])

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('sub_admin_events')
        .select('*')
        .eq('sub_admin_id', studentData.id)
        .eq('club_id', subAdminData.club_id)

      if (eventsError) throw eventsError

      setEvents(eventsData || [])
    } catch (error) {
      console.error('Error fetching club data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch club data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAnnouncement = async (formData: FormData) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data: subAdminData, error: subAdminError } = await supabase
        .from('sub_admins')
        .select('id, club_id')
        .eq('user_id', user.id)
        .single()

      if (subAdminError) throw subAdminError

      const { data, error } = await supabase
        .from('sub_admin_announcements')
        .insert({
          sub_admin_id: subAdminData.id,
          club_id: subAdminData.club_id,
          title: formData.get('title') as string,
          content: formData.get('content') as string,
          announcement_date: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      setAnnouncements([...announcements, data[0]])
      setIsAnnouncementDialogOpen(false)
      toast({
        title: "Success",
        description: "Announcement created successfully",
      })
    } catch (error) {
      console.error('Error creating announcement:', error)
      toast({
        title: "Error",
        description: "Failed to create announcement. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditAnnouncement = async (formData: FormData) => {
    try {
      const { data, error } = await supabase
        .from('sub_admin_announcements')
        .update({
          title: formData.get('title') as string,
          content: formData.get('content') as string,
        })
        .eq('id', currentItem!.id)
        .select()

      if (error) throw error

      setAnnouncements(announcements.map(a => a.id === data[0].id ? data[0] : a))
      setIsAnnouncementDialogOpen(false)
      toast({
        title: "Success",
        description: "Announcement updated successfully",
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

  const handleCreateEvent = async (formData: FormData) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data: subAdminData, error: subAdminError } = await supabase
        .from('sub_admins')
        .select('id, club_id')
        .eq('user_id', user.id)
        .single()

      if (subAdminError) throw subAdminError

      const { data, error } = await supabase
        .from('sub_admin_events')
        .insert({
          sub_admin_id: subAdminData.id,
          club_id: subAdminData.club_id,
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          event_date: formData.get('date') as string,
          event_time: formData.get('time') as string,
          location: formData.get('location') as string,
        })
        .select()

      if (error) throw error

      setEvents([...events, data[0]])
      setIsEventDialogOpen(false)
      toast({
        title: "Success",
        description: "Event created successfully",
      })
    } catch (error) {
      console.error('Error creating event:', error)
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditEvent = async (formData: FormData) => {
    try {
      const { data, error } = await supabase
        .from('sub_admin_events')
        .update({
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          event_date: formData.get('date') as string,
          event_time: formData.get('time') as string,
          location: formData.get('location') as string,
        })
        .eq('id', currentItem!.id)
        .select()

      if (error) throw error

      setEvents(events.map(e => e.id === data[0].id ? data[0] : e))
      setIsEventDialogOpen(false)
      toast({
        title: "Success",
        description: "Event updated successfully",
      })
    } catch (error) {
      console.error('Error updating event:', error)
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return

    try {
      const { error } = await supabase
        .from(itemToDelete.type === 'announcement' ? 'sub_admin_announcements' : 'sub_admin_events')
        .delete()
        .eq('id', itemToDelete.id)

      if (error) throw error

      if (itemToDelete.type === 'announcement') {
        setAnnouncements(announcements.filter(a => a.id !== itemToDelete.id))
      } else {
        setEvents(events.filter(e => e.id !== itemToDelete.id))
      }

      setIsDeleteDialogOpen(false)
      toast({
        title: "Success",
        description: `${itemToDelete.type === 'announcement' ? 'Announcement' : 'Event'} deleted successfully`,
      })
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        title: "Error",
        description: `Failed to delete ${itemToDelete.type}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!club) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Navigation active="club-management" />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6">Club Management</h1>
          <p className="text-lg mb-6">You do not have permission to manage any clubs or are not assigned to a club.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Navigation active="club-management" />

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Club Management - {club.name}</h1>
        <p className="text-lg mb-6">Total Members: {club.member_count}</p>

        <Tabs defaultValue="announcements" className="mb-6">
          <TabsList>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          <TabsContent value="announcements">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Announcements</h2>
              <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setCurrentItem(null)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{currentItem ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.target as HTMLFormElement)
                    currentItem ? handleEditAnnouncement(formData) : handleCreateAnnouncement(formData)
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <Input id="title" name="title" defaultValue={currentItem?.title} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="content" className="text-right">
                          Content
                        </Label>
                        <Textarea id="content" name="content" defaultValue={(currentItem as Announcement)?.content} className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{currentItem ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader>
                    <CardTitle>{announcement.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{announcement.content}</p>
                    <p className="text-sm text-gray-500 mt-2">Date: {new Date(announcement.announcement_date).toLocaleDateString()}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => {
                      setCurrentItem(announcement)
                      setIsAnnouncementDialogOpen(true)
                    }}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => {
                      setItemToDelete({ type: 'announcement', id: announcement.id })
                      setIsDeleteDialogOpen(true)
                    }}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="events">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Events</h2>
              <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setCurrentItem(null)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{currentItem ? 'Edit Event' : 'Create Event'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.target as HTMLFormElement)
                    currentItem ? handleEditEvent(formData) : handleCreateEvent(formData)
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <Input id="title" name="title" defaultValue={currentItem?.title} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Textarea id="description" name="description" defaultValue={(currentItem as Event)?.description} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                          Date
                        </Label>
                        <Input id="date" name="date" type="date" defaultValue={(currentItem as Event)?.event_date} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">
                          Time
                        </Label>
                        <Input id="time" name="time" type="time" defaultValue={(currentItem as Event)?.event_time} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">
                          Location
                        </Label>
                        <Input id="location" name="location" defaultValue={(currentItem as Event)?.location} className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{currentItem ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{event.description}</p>
                    <p className="text-sm text-gray-500 mt-2">Date: {event.event_date}</p>
                    <p className="text-sm text-gray-500">Time: {event.event_time}</p>
                    <p className="text-sm text-gray-500">Location: {event.location}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => {
                      setCurrentItem(event)
                      setIsEventDialogOpen(true)
                    }}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => {
                      setItemToDelete({ type: 'event', id: event.id })
                      setIsDeleteDialogOpen(true)
                    }}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the {itemToDelete?.type}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}