'use client'

import { useState, useEffect } from "react"
import AdminSidebar from "@/components/AdminSidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, School, Trash2, Edit, Upload, MapPin, Clock, Globe } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Image from 'next/image'
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
  time: string
  location: string
  club_id: string | null
  image_url: string | null
  is_global: boolean
}

interface Club {
  id: string
  name: string
}

export default function AdminEventManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({ 
    title: '', 
    description: '', 
    date: '', 
    time: '',
    location: '',
    club_id: null, 
    image_url: null,
    is_global: false
  })
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
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
      if (value === 'global') {
        setEditingEvent({ ...editingEvent, club_id: null, is_global: true })
      } else {
        setEditingEvent({ ...editingEvent, club_id: value, is_global: false })
      }
    } else {
      if (value === 'global') {
        setNewEvent({ ...newEvent, club_id: null, is_global: true })
      } else {
        setNewEvent({ ...newEvent, club_id: value, is_global: false })
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('events_images')
      .upload(fileName, file)

    if (error) {
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from('events_images')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleAddEvent = async () => {
    if (newEvent.title && newEvent.description && newEvent.date && newEvent.time && newEvent.location) {
      try {
        let imageUrl = null
        if (imageFile) {
          imageUrl = await uploadImage(imageFile)
        }

        const { data, error } = await supabase
          .from('events')
          .insert([{ ...newEvent, image_url: imageUrl }])
          .select()

        if (error) throw error

        setNewEvent({ 
          title: '', 
          description: '', 
          date: '', 
          time: '',
          location: '',
          club_id: null, 
          image_url: null,
          is_global: false
        })
        setImageFile(null)
        fetchEvents()
        toast({
          title: "Event Added",
          description: "The event has been added successfully.",
        })
      } catch (error) {
        console.error('Error adding event:', error)
        toast({
          title: "Error",
          description: "Failed to add event",
          variant: "destructive",
        })
      }
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setImageFile(null)
  }

  const handleUpdateEvent = async () => {
    if (editingEvent) {
      try {
        let imageUrl = editingEvent.image_url
        if (imageFile) {
          imageUrl = await uploadImage(imageFile)
        }

        const { error } = await supabase
          .from('events')
          .update({
            title: editingEvent.title,
            description: editingEvent.description,
            date: editingEvent.date,
            time: editingEvent.time,
            location: editingEvent.location,
            club_id: editingEvent.club_id,
            image_url: imageUrl,
            is_global: editingEvent.is_global
          })
          .eq('id', editingEvent.id)

        if (error) throw error

        setEditingEvent(null)
        setImageFile(null)
        fetchEvents()
        toast({
          title: "Event Updated",
          description: "The event has been updated successfully.",
        })
      } catch (error) {
        console.error('Error updating event:', error)
        toast({
          title: "Error",
          description: "Failed to update event",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event)
  }

  const confirmDeleteEvent = async () => {
    if (eventToDelete) {
      try {
        if (eventToDelete.image_url) {
          const fileName = eventToDelete.image_url.split('/').pop()
          if (fileName) {
            await supabase.storage
              .from('events_images')
              .remove([fileName])
          }
        }

        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventToDelete.id)

        if (error) throw error

        setEventToDelete(null)
        fetchEvents()
        toast({
          title: "Event Deleted",
          description: "The event has been deleted successfully.",
        })
      } catch (error) {
        console.error('Error deleting event:', error)
        toast({
          title: "Error",
          description: "Failed to delete event",
          variant: "destructive",
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
  min={new Date().toISOString().split('T')[0]}
/>
            </div>
            <div>
              <Label htmlFor="time">Event Time</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={editingEvent ? editingEvent.time : newEvent.time}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="location">Event Location</Label>
              <Input
                id="location"
                name="location"
                value={editingEvent ? editingEvent.location : newEvent.location}
                onChange={handleInputChange}
                placeholder="Enter event location"
              />
            </div>
            <div>
              <Label htmlFor="club">Event Type</Label>
              <Select
                value={editingEvent ? (editingEvent.is_global ? 'global' : editingEvent.club_id ?? '') : (newEvent.is_global ? 'global' : newEvent.club_id ?? '')}
                onValueChange={handleClubChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map(club => (
                    <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="image">Event Image</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
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
                {event.image_url && (
                  <div className="mb-4">
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      width={300}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
                <p>{event.description}</p>
                <p className="mt-2 text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Date: {new Date(event.date).toLocaleDateString()} at {event.time}
                </p>
                <p className="mt-1 text-sm text-gray-500 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location: {event.location}
                </p>
                <p className="mt-1 text-sm text-blue-600 flex items-center">
                  {event.is_global ? (
                    <>
                      <Globe className="h-4 w-4 mr-1" />
                      Global Event
                    </>
                  ) : event.club_id ? (
                    <>
                      <Users className="h-4 w-4 mr-1" />
                      {clubs.find(club => club.id === event.club_id)?.name || 'Unknown Club'}
                    </>
                  ) : (
                    <>
                      <School className="h-4 w-4 mr-1" />
                      College Event
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
              This action cannot be undone. This will permanently delete the event and its associated image.
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