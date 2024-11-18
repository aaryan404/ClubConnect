"use client"

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Loader2 } from 'lucide-react'
import Navigation from '@/components/studentNavigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from "@/hooks/use-toast"

interface UserData {
  id: string
  student_id: string
  name: string
  email: string
  role: string
  image_url: string
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null)
  const [newPhotoPreview, setNewPhotoPreview] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('students')
        .select('id, student_id, name, email, role, image_url')
        .eq('student_id', user.user_metadata.student_id)
        .single()

      if (error) throw error

      setUserData(data)
      setNewName(data.name)
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !userData) throw new Error('No user found')

      let newImageUrl = userData.image_url

      if (newPhotoFile) {
        const fileExt = newPhotoFile.name.split('.').pop()
        const fileName = `${user.id}_${Date.now()}.${fileExt}`
        const { data, error } = await supabase.storage
          .from('students_images')
          .upload(fileName, newPhotoFile)

        if (error) {
          console.error('Error uploading file:', error)
          throw error
        }

        console.log('File uploaded successfully:', data)

        const { data: { publicUrl } } = supabase.storage
          .from('students_images')
          .getPublicUrl(fileName)

        newImageUrl = publicUrl
        console.log('New image URL:', newImageUrl)
      }

      const { data, error } = await supabase
        .from('students')
        .update({
          name: newName,
          image_url: newImageUrl
        })
        .eq('id', userData.id)
        .select()

      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }

      console.log('Profile updated successfully:', data)

      // Update local state
      setUserData(prevData => ({
        ...prevData!,
        name: newName,
        image_url: newImageUrl
      }))
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Navigation active="profile" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Navigation active="profile" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p>Failed to load profile data. Please try again later.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
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
                <AvatarImage src={isEditing ? newPhotoPreview || userData.image_url : userData.image_url} alt={userData.name} />
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
              <Label htmlFor="student_id">Student ID</Label>
              <div id="student_id" className="text-lg font-medium mt-1">{userData.student_id}</div>
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
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit}>Edit Profile</Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}