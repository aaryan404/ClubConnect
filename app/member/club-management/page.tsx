"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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

// Mock data (replace with actual data fetching in a real application)
const clubData = {
  name: "Chess Club",
  memberCount: 50,
  announcements: [
    { id: 1, title: "Weekly Meeting", content: "Our next meeting is on Friday at 5 PM.", date: "2024-10-28", image: "" },
    { id: 2, title: "Tournament Announcement", content: "We're hosting a tournament next month!", date: "2024-07-25" },
  ],
  events: [
    { id: 1, title: "Beginner's Workshop", description: "Learn the basics of chess", date: "2024-09-05", time: "14:00", location: "Main Hall", image: "" },
    { id: 2, title: "Chess Tournament", description: "Annual club tournament", date: "2024-08-15", time: "10:00", location: "University Gymnasium" },
  ],
}

export default function ClubManagementPage() {
  const [announcements, setAnnouncements] = useState(clubData.announcements)
  const [events, setEvents] = useState(clubData.events)
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: 'announcement' | 'event', id: number } | null>(null)

  const handleCreateAnnouncement = (formData: FormData) => {
    const imageFile = formData.get('image') as File
    const newAnnouncement = {
      id: announcements.length + 1,
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      date: new Date().toISOString().split('T')[0],
      image: imageFile.size > 0 ? URL.createObjectURL(imageFile) : undefined,
    }
    setAnnouncements([...announcements, newAnnouncement])
    setIsAnnouncementDialogOpen(false)
  }

  const handleEditAnnouncement = (formData: FormData) => {
    const imageFile = formData.get('image') as File
    const updatedAnnouncements = announcements.map(announcement => 
      announcement.id === currentItem.id 
        ? { 
            ...announcement, 
            title: formData.get('title') as string, 
            content: formData.get('content') as string,
            image: imageFile.size > 0 ? URL.createObjectURL(imageFile) : announcement.image
          }
        : announcement
    )
    setAnnouncements(updatedAnnouncements)
    setIsAnnouncementDialogOpen(false)
  }

  const handleDeleteAnnouncement = (id: number) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id))
    setIsDeleteDialogOpen(false)
  }

  const handleCreateEvent = (formData: FormData) => {
    const imageFile = formData.get('image') as File
    const newEvent = {
      id: events.length + 1,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      location: formData.get('location') as string,
      image: imageFile.size > 0 ? URL.createObjectURL(imageFile) : undefined,
    }
    setEvents([...events, newEvent])
    setIsEventDialogOpen(false)
  }

  const handleEditEvent = (formData: FormData) => {
    const imageFile = formData.get('image') as File
    const updatedEvents = events.map(event => 
      event.id === currentItem.id 
        ? { 
            ...event, 
            title: formData.get('title') as string, 
            description: formData.get('description') as string, 
            date: formData.get('date') as string,
            time: formData.get('time') as string,
            location: formData.get('location') as string,
            image: imageFile.size > 0 ? URL.createObjectURL(imageFile) : event.image
          }
        : event
    )
    setEvents(updatedEvents)
    setIsEventDialogOpen(false)
  }

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter(event => event.id !== id))
    setIsDeleteDialogOpen(false)
  }

  const handleDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'announcement') {
        handleDeleteAnnouncement(itemToDelete.id)
      } else {
        handleDeleteEvent(itemToDelete.id)
      }
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Navigation active={"club-management"} />

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Club Management - {clubData.name}</h1>
        <p className="text-lg mb-6">Total Members: {clubData.memberCount}</p>

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
                        <Textarea id="content" name="content" defaultValue={currentItem?.content} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image" className="text-right">
                          Image (Optional)
                        </Label>
                        <Input id="image" name="image" type="file" accept="image/*" className="col-span-3" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">{currentItem ? 'Update' : 'Create'}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="bg-white shadow-sm flex flex-col">
                  {announcement.image && (
                    <CardHeader className="p-0">
                      <Image
                        src={announcement.image}
                        alt={announcement.title}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    </CardHeader>
                  )}
                  <CardContent className="p-4 flex-grow">
                    <CardTitle className="text-xl mb-2">{announcement.title}</CardTitle>
                    <p className="text-gray-600 mb-4">{announcement.content}</p>
                    <p className="text-sm"><strong>Date:</strong> {announcement.date}</p>
                  </CardContent>
                  <CardFooter className="p-4">
                    <div className="flex justify-end space-x-2 w-full">
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
                    </div>
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
                        <Textarea id="description" name="description" defaultValue={currentItem?.description} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                          Date
                        </Label>
                        <Input id="date" name="date" type="date" defaultValue={currentItem?.date} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">
                          Time
                        </Label>
                        <Input id="time" name="time" type="time" defaultValue={currentItem?.time} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">
                          Location
                        </Label>
                        <Input id="location" name="location" defaultValue={currentItem?.location} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image" className="text-right">
                          Image (Optional)
                        </Label>
                        <Input id="image" name="image" type="file" accept="image/*" className="col-span-3" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">{currentItem ? 'Update' : 'Create'}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="bg-white shadow-sm flex flex-col">
                  {event.image && (
                    <CardHeader className="p-0">
                      <Image
                        src={event.image}
                        alt={event.title}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    </CardHeader>
                  )}
                  <CardContent className="p-4 flex-grow">
                    <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Date:</strong> {event.date}</p>
                      <p className="text-sm"><strong>Time:</strong> {event.time}</p>
                      <p className="text-sm"><strong>Location:</strong> {event.location}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4">
                    <div className="flex justify-end space-x-2 w-full">
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
                    </div>
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