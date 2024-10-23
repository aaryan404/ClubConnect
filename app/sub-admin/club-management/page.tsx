"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Settings, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
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

// Mock data (replace with actual data fetching in a real application)
const clubData = {
  name: "Chess Club",
  memberCount: 50,
  announcements: [
    { id: 1, title: "Weekly Meeting", content: "Our next meeting is on Friday at 5 PM.", date: "2023-07-20", image: "/placeholder.svg?height=200&width=400" },
    { id: 2, title: "Tournament Announcement", content: "We're hosting a tournament next month!", date: "2023-07-25" },
  ],
  events: [
    { id: 1, title: "Beginner's Workshop", description: "Learn the basics of chess", date: "2023-08-05", image: "/placeholder.svg?height=200&width=400" },
    { id: 2, title: "Chess Tournament", description: "Annual club tournament", date: "2023-08-15" },
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
            <Link href="/sub-admin/clubs" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <ClipboardList size={20} />
              <span>Clubs</span>
            </Link>
            <Link href="/sub-admin/club-management" className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
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
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader>
                    <CardTitle>{announcement.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {announcement.image && (
                      <div className="mb-4">
                        <Image
                          src={announcement.image}
                          alt={announcement.title}
                          width={400}
                          height={200}
                          className="rounded-md object-cover w-full"
                        />
                      </div>
                    )}
                    <p>{announcement.content}</p>
                    <p className="text-sm text-gray-500 mt-2">Date: {announcement.date}</p>
                    <div className="flex justify-end space-x-2 mt-4">
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
                  </CardContent>
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
                        <Textarea id="description" name="description" defaultValue={currentItem?.description} 
                        className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                          Date
                        </Label>
                        <Input id="date" name="date" type="date" defaultValue={currentItem?.date} className="col-span-3" />
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
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {event.image && (
                      <div className="mb-4">
                        <Image
                          src={event.image}
                          alt={event.title}
                          width={400}
                          height={200}
                          className="rounded-md object-cover w-full"
                        />
                      </div>
                    )}
                    <p>{event.description}</p>
                    <p className="text-sm text-gray-500 mt-2">Date: {event.date}</p>
                    <div className="flex justify-end space-x-2 mt-4">
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
                  </CardContent>
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