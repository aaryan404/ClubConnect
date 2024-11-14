"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "@/components/AdminSidebar"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Upload } from 'lucide-react'
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

interface Club {
  id: string
  name: string
  description: string
  member_count: number
  image_url: string
}

export default function AdminClubManagement() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [newClub, setNewClub] = useState({ name: "", description: "", logo: null as File | null })
  const [isLoading, setIsLoading] = useState(false)
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
    
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

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let imageUrl = null

      // If a logo was provided, upload it to storage
      if (newClub.logo) {
        const file = newClub.logo
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `club-logos/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('club-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get the public URL of the uploaded image
        const { data: urlData } = supabase.storage
          .from('club-images')
          .getPublicUrl(filePath)

        imageUrl = urlData.publicUrl
      }

      // Create the club in the database
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .insert({ 
          name: newClub.name, 
          description: newClub.description,
          image_url: imageUrl
        })
        .select()

      if (clubError) throw clubError

      toast({
        title: "Success",
        description: "Club created successfully",
      })
      setNewClub({ name: "", description: "", logo: null })
      fetchClubs()
    } catch (error) {
      console.error('Error creating club:', error)
      toast({
        title: "Error",
        description: "Failed to create club",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClub = async () => {
    if (!clubToDelete) return

    try {
      // Delete the club's logo from storage if it exists
      if (clubToDelete.image_url) {
        const imagePath = clubToDelete.image_url.split('/').slice(-2).join('/')
        await supabase.storage
          .from('club-images')
          .remove([imagePath])
      }

      // Delete the club from the database
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', clubToDelete.id)
      
      if (error) throw error

      toast({
        title: "Success",
        description: "Club deleted successfully",
      })
      fetchClubs()
    } catch (error) {
      console.error('Error deleting club:', error)
      toast({
        title: "Error",
        description: "Failed to delete club",
        variant: "destructive",
      })
    } finally {
      setClubToDelete(null)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activePage="/admin/clubs" />

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Club Management</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Club</h2>
          <form onSubmit={handleCreateClub} className="space-y-4">
            <div>
              <Label htmlFor="clubName">Club Name</Label>
              <Input
                id="clubName"
                value={newClub.name}
                onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="clubDescription">Description</Label>
              <Input
                id="clubDescription"
                value={newClub.description}
                onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="clubLogo">Club Logo</Label>
              <Input
                id="clubLogo"
                type="file"
                accept="image/*"
                onChange={(e) => setNewClub({ ...newClub, logo: e.target.files ? e.target.files[0] : null })}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Club'}
            </Button>
          </form>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Existing Clubs</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell>
                    {club.image_url ? (
                      <Image
                        src={club.image_url}
                        alt={`${club.name} logo`}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Upload className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{club.name}</TableCell>
                  <TableCell>{club.description}</TableCell>
                  <TableCell>{club.member_count}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setClubToDelete(club)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <AlertDialog open={!!clubToDelete} onOpenChange={() => setClubToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this club?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the club
              "{clubToDelete?.name}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClub}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}