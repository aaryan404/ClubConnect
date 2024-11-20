"use client"

import { useState, useEffect } from "react"
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, Calendar, Bell, LogOut, Trash2, Save, UserPlus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import AdminSidebar from '@/components/AdminSidebar'

interface User {
  email: string
  name: string
  student_id: string
  role: 'student' | 'sub-admin'
  club?: string // Added club property to User interface
}

interface SubAdmin extends User {
  club: string
}

interface Club {
  id: string
  name: string
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [filter, setFilter] = useState("")
  const [changedRoles, setChangedRoles] = useState<{[key: string]: 'student' | 'sub-admin'}>({})
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [subAdminToAssign, setSubAdminToAssign] = useState<User | null>(null)
  const [selectedClub, setSelectedClub] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchUsers()
    fetchSubAdmins()
    fetchClubs()
    const channel = supabase
      .channel('users_and_sub_admins')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        console.log('Students table changed, fetching updated data...')
        fetchUsers()
        fetchSubAdmins()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sub_admins' }, () => {
        console.log('Sub_admins table changed, fetching updated data...')
        fetchSubAdmins()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('students')
      .select('*')
    
    if (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } else {
      console.log('Fetched users:', data)
      setUsers(data || [])
    }
    setIsLoading(false)
  }

  const fetchClubs = async () => {
    const { data, error } = await supabase
      .from('clubs')
      .select('id, name')
    
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

  const handleRoleChange = (userEmail: string, newRole: 'student' | 'sub-admin') => {
    if (newRole === 'sub-admin') {
      const user = users.find(u => u.email === userEmail)
      if (user) {
        setSubAdminToAssign(user)
      }
    } else {
      setChangedRoles(prev => ({ ...prev, [userEmail]: newRole }))
    }
  }

  const handleSaveChanges = async () => {
    for (const [userEmail, newRole] of Object.entries(changedRoles)) {
      try {
        console.log('Processing user:', userEmail, 'New role:', newRole)
      
        // Get the user's current club from students table
        const { data: userData, error: userError } = await supabase
          .from('students')
          .select('club')
          .eq('email', userEmail)
          .single()
      
        if (userError) throw userError

        // Update the role in students table
        const { data: updateData, error: updateError } = await supabase
          .from('students')
          .update({ role: newRole })
          .eq('email', userEmail)
          .select()
      
        if (updateError) throw updateError
      
        console.log('Update successful:', updateData)

       

        // Handle sub_admins table updates
        if (newRole === 'sub-admin' && userData?.club) {
          // Insert or update in sub_admins table
          const { error: subAdminError } = await supabase
            .from('sub_admins')
            .upsert({ 
              email: userEmail,
              club_id: userData.club
            })
        
          if (subAdminError) throw subAdminError
          
          console.log('Inserted/Updated sub_admin:', userEmail, 'with club:', userData.club)
        } else if (newRole !== 'sub-admin') {
          // Delete from sub_admins if role is changed to something else
          const { error: deleteError } = await supabase
            .from('sub_admins')
            .delete()
            .eq('email', userEmail)
        
          if (deleteError) throw deleteError
          
          console.log('Removed sub_admin:', userEmail)
        }

      } catch (error) {
        console.error('Error in handleSaveChanges:', error)
        toast({
          title: "Error",
          description: `Failed to update user ${userEmail}. Please try again.`,
          variant: "destructive",
        })
      }
    }
    
    setChangedRoles({})
    await Promise.all([fetchUsers(), fetchSubAdmins()])
    toast({
      title: "Changes Saved",
      description: "User roles have been updated successfully.",
    })
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
  }

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      console.log('Deleting user:', userToDelete.email)
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('email', userToDelete.email)
      
      if (error) {
        console.error('Error deleting user:', error)
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        })
      } else {
        console.log('User deleted successfully')
        const { error: subAdminError } = await supabase
          .from('sub_admins')
          .delete()
          .eq('email', userToDelete.email)

        if (subAdminError) {
          console.error('Error removing user from sub_admins:', subAdminError)
        } else {
          console.log('User removed from sub_admins (if they were a sub-admin)')
        }

        toast({
          title: "User Deleted",
          description: "The user has been removed successfully.",
        })
        await fetchUsers()
        await fetchSubAdmins()
      }
      setUserToDelete(null)
    }
  }

  const handleAssignClub = async () => {
    if (subAdminToAssign && selectedClub) {
      try {
        console.log('Assigning club:', selectedClub, 'to user:', subAdminToAssign.email)
        
        // Update the user's role to 'sub-admin' and assign the club in the students table
        const { data, error } = await supabase
          .from('students')
          .update({ 
            role: 'sub-admin',
            club: selectedClub
          })
          .eq('email', subAdminToAssign.email)
          .select()

        if (error) throw error

        console.log('Club assigned successfully:', data)
        setChangedRoles(prev => ({ ...prev, [subAdminToAssign.email]: 'sub-admin' }))
        toast({
          title: "Sub-Admin Assigned",
          description: `${subAdminToAssign.name} has been assigned as sub-admin to the selected club.`,
        })
        await Promise.all([fetchUsers(), fetchSubAdmins()])
      } catch (error) {
        console.error('Error assigning sub-admin:', error)
        toast({
          title: "Error",
          description: (error as Error).message || "Failed to assign sub-admin. Please try again.",
          variant: "destructive",
        })
      } finally {
        setSubAdminToAssign(null)
        setSelectedClub("")
      }
    }
  }
  
  const fetchSubAdmins = async () => {
    console.log('Fetching sub-admins...')
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('role', 'sub-admin')
    
    if (error) {
      console.error('Error fetching sub-admins:', error)
      toast({
        title: "Error",
        description: "Failed to fetch sub-admins",
        variant: "destructive",
      })
    } else {
      console.log('Fetched sub-admins:', data)
      setSubAdmins(data || [])
    }
  }

  const filteredUsers = users.filter(user => 
    user.student_id.includes(filter) || user.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activePage="/admin/users" />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Filter Users</h2>
          <div className="flex space-x-4">
            <Input
              placeholder="Filter by Student ID or Name"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">All Users</h2>
            <Button onClick={handleSaveChanges} disabled={Object.keys(changedRoles).length === 0}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
          {isLoading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.student_id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={changedRoles[user.email] || user.role}
                        onValueChange={(value: 'student' | 'sub-admin') => handleRoleChange(user.email, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="sub-admin">Sub-Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Sub-Admins</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Club</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subAdmins.map((subAdmin) => (
                <TableRow key={subAdmin.email}>
                  <TableCell>{subAdmin.name}</TableCell>
                  <TableCell>{subAdmin.email}</TableCell>
                  <TableCell>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                      {clubs.find(club => club.id === subAdmin.club)?.name || 'N/A'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!subAdminToAssign} onOpenChange={() => setSubAdminToAssign(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Club to Sub-Admin</DialogTitle>
            <DialogDescription>
              Please select a club to assign to {subAdminToAssign?.name} as a sub-admin.
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedClub} onValueChange={setSelectedClub}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a club" />
            </SelectTrigger>
            <SelectContent>
              {clubs.map((club) => (
                <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={() => setSubAdminToAssign(null)}>Cancel</Button>
            <Button onClick={handleAssignClub} disabled={!selectedClub}>Assign Club</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}