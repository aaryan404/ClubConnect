'use client'

import { useState, useEffect } from "react"
import AdminSidebar from "@/components/AdminSidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, School, Trash2, Edit } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Event {
  id: string
  title: string
  description: string
  date: string
  club_id: string | null
}

interface Club {
  id: string
  name: string
}

export default function AdminEventManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({ title: '', description: '', date: '', club_id: null })
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchEvents()
    fetchClubs()
  }, [])

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
    
    if (error) {
      console.error('Error fetching events:', error)
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      })
    } else {
      setEvents(data || [])
    }
  }

  async function fetchClubs() {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('name', { ascending: true })
    
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (editingEvent) {
      setEditingEvent({ ...editingEvent, [name]: value })
    } else {
      setNewEvent({ ...newEvent, [name]: value })
    }
  }

  const handleClubChange = (value: string) => {
    if (editingEvent) {
      setEditingEvent({ ...editingEvent, club_id: value === 'college' ? null : value })
    } else {
      setNewEvent({ ...newEvent, club_id: value === 'college' ? null : value })
    }
  }

  const handleAddEvent = async () => {
    if (newEvent.title && newEvent.description && newEvent.date) {
      const { data, error } = await supabase
        .from('events')
        .insert([newEvent])
        .select()

      if (error) {
        console.error('Error adding event:', error)
        toast({
          title: "Error",
          description: "Failed to add event",
          variant: "destructive",
        })
      } else {
        setNewEvent({ title: '', description: '', date: '', club_id: null })
        fetchEvents()
        toast({
          title: "Event Added",
          description: "The event has been added successfully.",
        })
      }
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
  }

  const handleUpdateEvent = async () => {
    if (editingEvent) {
      const { error } = await supabase
        .from('events')
        .update({
          title: editingEvent.title,
          description: editingEvent.description,
          date: editingEvent.date,
          club_id: editingEvent.club_id
        })
        .eq('id', editingEvent.id)

      if (error) {
        console.error('Error updating event:', error)
        toast({
          title: "Error",
          description: "Failed to update event",
          variant: "destructive",
        })
      } else {
        setEditingEvent(null)
        fetchEvents()
        toast({
          title: "Event Updated",
          description: "The event has been updated successfully.",
        })
      }
    }
  }

  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event)
  }

  const confirmDeleteEvent = async () => {
    if (eventToDelete) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete.id)

      if (error) {
        console.error('Error deleting event:', error)
        toast({
          title: "Error",
          description: "Failed to delete event",
          variant: "destructive",
        })
      } else {
        setEventToDelete(null)
        fetchEvents()
        toast({
          title: "Event Deleted",
          description: "The event has been deleted successfully.",
        })
      }
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activePage="/admin/events" />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Event Management</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                name="title"
                value={editingEvent ? editingEvent.title : newEvent.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
              />
            </div>
            <div>
              <Label htmlFor="description">Event Description</Label>
              <Textarea
                id="description"
                name="description"
                value={editingEvent ? editingEvent.description : newEvent.description}
                onChange={handleInputChange}
                placeholder="Enter event description"
              />
            </div>
            <div>
              <Label htmlFor="date">Event Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={editingEvent ? editingEvent.date : newEvent.date}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="club">Club</Label>
              <Select
                value={editingEvent ? editingEvent.club_id ?? undefined : newEvent.club_id ?? undefined}
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
            {editingEvent ? (
              <Button onClick={handleUpdateEvent}>Update Event</Button>
            ) : (
              <Button onClick={handleAddEvent}>Add Event</Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{event.description}</p>
                <p className="mt-2 text-sm text-gray-500">Date: {new Date(event.date).toLocaleDateString()}</p>
                <p className="mt-1 text-sm text-blue-600 flex items-center">
                  {event.club_id ? (
                    <>
                      <Users className="h-4 w-4 mr-1" />
                      {clubs.find(club => club.id === event.club_id)?.name || 'Unknown Club'}
                    </>
                  ) : (
                    <>
                      <School className="h-4 w-4 mr-1" />
                      College general events
                    </>
                  )}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEvent}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}