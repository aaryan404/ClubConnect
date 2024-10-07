"use client"

import { useState } from "react"
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Trash2, Edit, UserPlus, School } from 'lucide-react'
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

interface Event {
  id: number
  title: string
  description: string
  date: string
  category: string
}

const clubs = ["Chess Club", "Debate Society", "Drama Club", "Music Club", "Sports Club"]

export default function AdminEventManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [newEvent, setNewEvent] = useState<Event>({ id: 0, title: '', description: '', date: '', category: '' })
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (editingEvent) {
      setEditingEvent({ ...editingEvent, [name]: value })
    } else {
      setNewEvent({ ...newEvent, [name]: value })
    }
  }

  const handleCategoryChange = (value: string) => {
    if (editingEvent) {
      setEditingEvent({ ...editingEvent, category: value })
    } else {
      setNewEvent({ ...newEvent, category: value })
    }
  }

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.description && newEvent.date && newEvent.category) {
      const eventToAdd = { ...newEvent, id: Date.now() }
      setEvents([...events, eventToAdd])
      setNewEvent({ id: 0, title: '', description: '', date: '', category: '' })
      toast({
        title: "Event Added",
        description: "The event has been added successfully.",
      })
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
  }

  const handleUpdateEvent = () => {
    if (editingEvent) {
      setEvents(events.map(event => event.id === editingEvent.id ? editingEvent : event))
      setEditingEvent(null)
      toast({
        title: "Event Updated",
        description: "The event has been updated successfully.",
      })
    }
  }

  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event)
  }

  const confirmDeleteEvent = () => {
    if (eventToDelete) {
      setEvents(events.filter(event => event.id !== eventToDelete.id))
      setEventToDelete(null)
      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully.",
      })
    }
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
            <Link href="/admin/clubs" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <ClipboardList size={20} />
              <span>Club Management</span>
            </Link>
            <Link href="/admin/events" className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
              <Calendar size={20} />
              <span>Event Management</span>
            </Link>
            <Link href="/admin/announcements"className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
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
              <Label htmlFor="category">Category</Label>
              <Select
                value={editingEvent ? editingEvent.category : newEvent.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="college">College general events</SelectItem>
                  {clubs.map(club => (
                    <SelectItem key={club} value={club}>{club}</SelectItem>
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
                <p className="mt-2 text-sm text-gray-500">Date: {event.date}</p>
                <p className="mt-1 text-sm text-blue-600 flex items-center">
                  {event.category === 'college' ? (
                    <>
                      <School className="h-4 w-4 mr-1" />
                      College general events
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-1" />
                      {event.category}
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