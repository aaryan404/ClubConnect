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
import { Users, ClipboardList, Calendar, Bell, LogOut, Trash2, Edit, UserPlus, Globe, Users as UsersIcon } from 'lucide-react'
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

interface Announcement {
  id: number
  title: string
  content: string
  target: 'global' | 'college' | string
  date: string
}

const clubs = ["Chess Club", "Debate Society", "Drama Club", "Music Club", "Sports Club"]

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState<Omit<Announcement, 'id' | 'date'>>({ title: '', content: '', target: 'global' })
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (editingAnnouncement) {
      setEditingAnnouncement({ ...editingAnnouncement, [name]: value })
    } else {
      setNewAnnouncement({ ...newAnnouncement, [name]: value })
    }
  }

  const handleTargetChange = (value: string) => {
    if (editingAnnouncement) {
      setEditingAnnouncement({ ...editingAnnouncement, target: value })
    } else {
      setNewAnnouncement({ ...newAnnouncement, target: value })
    }
  }

  const handleAddAnnouncement = () => {
    if (newAnnouncement.title && newAnnouncement.content && newAnnouncement.target) {
      const announcementToAdd = {
        ...newAnnouncement,
        id: Date.now(),
        date: new Date().toISOString().split('T')[0]
      }
      setAnnouncements([...announcements, announcementToAdd])
      setNewAnnouncement({ title: '', content: '', target: 'global' })
      toast({
        title: "Announcement Added",
        description: "The announcement has been added successfully.",
      })
    }
  }

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
  }

  const handleUpdateAnnouncement = () => {
    if (editingAnnouncement) {
      setAnnouncements(announcements.map(announcement => 
        announcement.id === editingAnnouncement.id ? editingAnnouncement : announcement
      ))
      setEditingAnnouncement(null)
      toast({
        title: "Announcement Updated",
        description: "The announcement has been updated successfully.",
      })
    }
  }

  const handleDeleteAnnouncement = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement)
  }

  const confirmDeleteAnnouncement = () => {
    if (announcementToDelete) {
      setAnnouncements(announcements.filter(announcement => announcement.id !== announcementToDelete.id))
      setAnnouncementToDelete(null)
      toast({
        title: "Announcement Deleted",
        description: "The announcement has been deleted successfully.",
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
            <Link href="/admin/events" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Calendar size={20} />
              <span>Event Management</span>
            </Link>
            <Link href="/admin/announcements" className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
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
              <Label htmlFor="target">Target Audience</Label>
              <Select
                value={editingAnnouncement ? editingAnnouncement.target : newAnnouncement.target}
                onValueChange={handleTargetChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="college">College general events</SelectItem>
                  {clubs.map(club => (
                    <SelectItem key={club} value={club}>{club}</SelectItem>
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
                      {announcement.target === 'global' ? (
                        <>
                          <Globe className="h-4 w-4 mr-1" />
                          Global
                        </>
                      ) : announcement.target === 'college' ? (
                        <>
                          <UsersIcon className="h-4 w-4 mr-1" />
                          College general events
                        </>
                      ) : (
                        <>
                          <UsersIcon className="h-4 w-4 mr-1" />
                          {announcement.target}
                        </>
                      )}
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