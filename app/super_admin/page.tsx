'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Edit2, Check, X, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { addAdmin, getAdmins, updateAdmin, deleteAdmin, initiatePasswordReset } from "@/app/actions/admin"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Admin = {
  id: string
  email: string
}

export default function SuperAdminDashboard() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    const result = await getAdmins()
    if (result.success) {
      if (result.data) {
        setAdmins(result.data)
      }
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newAdminEmail && newAdminPassword) {
      const result = await addAdmin(newAdminEmail, newAdminPassword)
      if (result.success) {
        toast({
          title: "Admin Added",
          description: result.message,
        })
        setNewAdminEmail("")
        setNewAdminPassword("")
        fetchAdmins()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteAdmin = async (id: string) => {
    const result = await deleteAdmin(id)
    if (result.success) {
      toast({
        title: "Admin Deleted",
        description: result.message,
      })
      fetchAdmins()
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin)
  }

  const handleSaveEdit = async () => {
    if (editingAdmin) {
      const result = await updateAdmin(editingAdmin.id, editingAdmin.email)
      if (result.success) {
        toast({
          title: "Admin Updated",
          description: result.message,
        })
        setEditingAdmin(null)
        fetchAdmins()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingAdmin(null)
  }

  const handleInitiatePasswordReset = async (email: string) => {
    const result = await initiatePasswordReset(email)
    if (result.success) {
      toast({
        title: "Password Reset Initiated",
        description: `Reset token: ${result.resetToken}`,
      })
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    } else {
      router.push("/auth/signin")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-gray-900">ClubConnect</span>
              </div>
            </div>
            <div className="flex items-center">
              <Button onClick={handleLogout} variant="ghost">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto mt-8 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Super Admin Dashboard</h1>
        
        <Tabs defaultValue="add-admin" className="space-y-4">
          <TabsList>
            <TabsTrigger value="add-admin">Add Admin</TabsTrigger>
            <TabsTrigger value="view-admins">View Admins</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add-admin">
            <Card>
              <CardHeader>
                <CardTitle>Add New Admin</CardTitle>
                <CardDescription>Create a new admin account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">New Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      required
                    />
                  </div>
                  {/* this section is for checking the pass keys in the whole function and cross check the application of the 
                  function in thne system, this will also evulate the use of the user in the password in the database so that it is implemented */}
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">New Admin Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit">Add Admin</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="view-admins">
            <Card>
              <CardHeader>
                <CardTitle>Current Admins</CardTitle>
                <CardDescription>Manage existing admin accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between bg-white p-4 rounded-md shadow">
                      {editingAdmin && editingAdmin.id === admin.id ? (
                        <div className="flex-grow mr-4">
                          <Input
                            value={editingAdmin.email}
                            onChange={(e) => setEditingAdmin({...editingAdmin, email: e.target.value})}
                            className="mb-2"
                          />
                        </div>
                      ) : (
                        <div>
                          <p><strong>Email:</strong> {admin.email}</p>
                        </div>
                      )}
                      <div className="flex space-x-2">
                        {editingAdmin && editingAdmin.id === admin.id ? (
                          <>
                            <Button variant="outline" size="icon" onClick={handleSaveEdit}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleCancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                          
                            <Button variant="outline" size="icon" onClick={() => handleEditAdmin(admin)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleInitiatePasswordReset(admin.email)}>
                              <Key className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to delete this admin?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the admin account.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAdmin(admin.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  {admins.length === 0 && (
                    
                    <p className="text-gray-500 text-center">No admins added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  )
}