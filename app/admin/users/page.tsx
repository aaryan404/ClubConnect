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

interface User {
  id: string
  name: string
  student_id: string
  email: string
  role: 'student' | 'sub-admin'
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
        fetchUsers()
        fetchSubAdmins()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sub_admins' }, () => {
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
      setUsers(data || [])
    }
    setIsLoading(false)
  }

  const fetchSubAdmins = async () => {
    const { data, error } = await supabase
      .from('sub_admins')
      .select(`
        id,
        user:students(id, name, student_id, email, role),
        club:clubs!inner(id, name)
      `)
    
    if (error) {
      console.error('Error fetching sub-admins:', error)
      toast({
        title: "Error",
        description: "Failed to fetch sub-admins",
        variant: "destructive",
      })
    } else {
      setSubAdmins(data?.map((item: any) => ({
        id: item.user.id,
        name: item.user.name,
        student_id: item.user.student_id,
        email: item.user.email,
        role: item.user.role,
        club: item.club.name
      })) || [])
    }
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

  const handleRoleChange = (userId: string, newRole: 'student' | 'sub-admin') => {
    if (newRole === 'sub-admin') {
      const user = users.find(u => u.id === userId)
      if (user) {
        setSubAdminToAssign(user)
      }
    } else {
      setChangedRoles(prev => ({ ...prev, [userId]: newRole }))
    }
  }

  const handleSaveChanges = async () => {
    for (const [userId, newRole] of Object.entries(changedRoles)) {
      if (newRole === 'student') {
        const { error } = await supabase
          .from('students')
          .update({ role: newRole })
          .eq('id', userId)
        
        if (error) {
          console.error('Error updating user role:', error)
          toast({
            title: "Error",
            description: `Failed to update role for user ${userId}`,
            variant: "destructive",
          })
        } else {
          // If changing to student, remove from sub_admins table
          await supabase
            .from('sub_admins')
            .delete()
            .eq('user_id', userId)
        }
      }
    }
    setChangedRoles({})
    fetchUsers()
    fetchSubAdmins()
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
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', userToDelete.id)
      
      if (error) {
        console.error('Error deleting user:', error)
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        })
      } else {
        toast({
          title: "User Deleted",
          description: "The user has been removed successfully.",
        })
        fetchUsers()
        fetchSubAdmins()
      }
      setUserToDelete(null)
    }
  }

  const handleAssignClub = async () => {
    if (subAdminToAssign && selectedClub) {
      try {
        const { data, error } = await supabase.rpc('assign_sub_admin', {
          p_user_id: subAdminToAssign.id,
          p_club_id: selectedClub
        })

        if (error) throw error

        setChangedRoles(prev => ({ ...prev, [subAdminToAssign.id]: 'sub-admin' }))
        toast({
          title: "Sub-Admin Assigned",
          description: `${subAdminToAssign.name} has been assigned as sub-admin to the selected club.`,
        })
        fetchUsers()
        fetchSubAdmins()
      } catch (error) {
        console.error('Error assigning sub-admin:', error)
        toast({
          title: "Error",
          description: "Failed to assign sub-admin. Please try again.",
          variant: "destructive",
        })
      } finally {
        setSubAdminToAssign(null)
        setSelectedClub("")
      }
    }
  }

  const filteredUsers = users.filter(user => 
    user.student_id.includes(filter) || user.name.toLowerCase().includes(filter.toLowerCase())
  )

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
            <Link href="/admin/users" className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
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
            <Link href="/admin/announcements" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
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
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.student_id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={changedRoles[user.id] || user.role}
                        onValueChange={(value: 'student' | 'sub-admin') => handleRoleChange(user.id, value)}
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
                <TableRow key={subAdmin.id}>
                  <TableCell>{subAdmin.name}</TableCell>
                  <TableCell>{subAdmin.email}</TableCell>
                  <TableCell>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                      {subAdmin.club}
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