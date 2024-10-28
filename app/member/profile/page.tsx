"use client"

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera } from 'lucide-react'
import Navigation from '@/components/studentNavigation'

// Mock user data (replace with actual data fetching in a real application)
const initialUserData = {
  name: "Aaryan Khatri",
  email: "Aaryan.khatri@niagaracollege.com",
  photoUrl: "/placeholder.svg",
  role: "Member"
}

export default function ProfilePage() {
  const [userData, setUserData] = useState(initialUserData)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(userData.name)
  const [newPhotoUrl, setNewPhotoUrl] = useState(userData.photoUrl)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setUserData(prevData => ({
      ...prevData,
      name: newName,
      photoUrl: newPhotoUrl
    }))
    setIsEditing(false)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewPhotoUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Navigation bar component can be inserted here */}
      <Navigation active="profile" />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={isEditing ? newPhotoUrl : userData.photoUrl} alt={userData.name} />
                <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <div>
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="flex items-center space-x-2 text-sm text-blue-500">
                      <Camera size={16} />
                      <span>Change Photo</span>
                    </div>
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="text-lg font-medium mt-1">{userData.name}</div>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <div id="email" className="text-lg font-medium mt-1">{userData.email}</div>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <div id="role" className="text-lg font-medium mt-1">{userData.role}</div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            {isEditing ? (
              <Button onClick={handleSave}>Save Changes</Button>
            ) : (
              <Button onClick={handleEdit}>Edit Profile</Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}