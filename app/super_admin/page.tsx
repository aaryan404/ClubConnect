"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Edit2, Check, X } from "lucide-react"

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
} from "@/components/ui/alert-dialog"

type Admin = {
  id: string
  email: string
  password: string
}

export default function SuperAdminDashboard() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    if (newAdminEmail && newAdminPassword) {
      // Check if an admin with the same email already exists
      const existingAdmin = admins.find(admin => admin.email === newAdminEmail)
      if (existingAdmin) {
        toast({
          title: "Error",
          description: `An admin with the email ${newAdminEmail} already exists.`,
          variant: "destructive",
        })
        return
      }

      const newAdmin: Admin = {
        id: Math.random().toString(36).substr(2, 9),
        email: newAdminEmail,
        password: newAdminPassword,
      }
      setAdmins([...admins, newAdmin])
      setNewAdminEmail("")
      setNewAdminPassword("")
      toast({
        title: "Admin Added",
        description: `New admin (${newAdminEmail}) has been added successfully.`,
      })
    }
  }

  const handleDeleteAdmin = (id: string) => {
    setAdmins(admins.filter(admin => admin.id !== id))
    setDeleteConfirmation(null)
    toast({
      title: "Admin Deleted",
      description: "The admin has been removed successfully.",
    })
  }

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin)
  }

  const handleSaveEdit = () => {
    if (editingAdmin) {
      // Check if the new email already exists (excluding the current admin being edited)
      const emailExists = admins.some(admin => admin.email === editingAdmin.email && admin.id !== editingAdmin.id)
      if (emailExists) {
        toast({
          title: "Error",
          description: `An admin with the email ${editingAdmin.email} already exists.`,
          variant: "destructive",
        })
        return
      }

      setAdmins(admins.map(admin => 
        admin.id === editingAdmin.id ? editingAdmin : admin
      ))
      setEditingAdmin(null)
      toast({
        title: "Admin Updated",
        description: "The admin details have been updated successfully.",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingAdmin(null)
  }

  const handleLogout = () => {
    // Redirect to the sign-in page
    router.push("auth/signin")
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
                          <Input
                            type="password"
                            value={editingAdmin.password}
                            onChange={(e) => setEditingAdmin({...editingAdmin, password: e.target.value})}
                          />
                        </div>
                      ) : (
                        <div>
                          <p><strong>Email:</strong> {admin.email}</p>
                          <p><strong>Password:</strong> {admin.password}</p>
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
                          <Button variant="outline" size="icon" onClick={() => handleEditAdmin(admin)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="destructive" size="icon" onClick={() => setDeleteConfirmation(admin.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

      <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this admin?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the admin account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirmation && handleDeleteAdmin(deleteConfirmation)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}