'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, Check, X, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/alert-dialog";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import {
  addAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminPassword,
  updateAdminPassword,
  getAdmins,
} from "@/app/actions/admin";

type Admin = {
  id: string;
  email: string;
  name: string;
};

const isValidEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return emailRegex.test(email);
};

const AddAdmin: React.FC = () => {
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminName && newAdminEmail && newAdminPassword) {
      if (!isValidEmail(newAdminEmail)) {
        toast({
          title: "Error",
          description: "Invalid email address. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      const result = await addAdmin(newAdminName, newAdminEmail, newAdminPassword);
      setIsLoading(false);

      if (result.success) {
        toast({
          title: "Admin Added",
          description: result.message,
        });
        setNewAdminName("");
        setNewAdminEmail("");
        setNewAdminPassword("");
      } else {
        toast({
          title: "Error",
          description: result.message || "An error occurred while adding the admin.",
          variant: "destructive",
        });
      }
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Admin</CardTitle>
        <CardDescription>Create a new admin account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminName">New Admin Name</Label>
            <Input
              id="adminName"
              type="text"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
              required
            />
          </div>
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Admin"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const AdminList: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [editingPassword, setEditingPassword] = useState<{ id: string; password: string } | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    const result = await getAdmins();
    setIsLoading(false);
    if (result.success) {
      if (result.data) {
        setAdmins(
          result.data.map((admin: any) => ({
            id: admin.id,
            email: admin.email,
            name: admin.name || "Unknown",
          }))
        );
      }
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    setIsLoading(true);
    const result = await deleteAdmin(id);
    setIsLoading(false);
    if (result.success) {
      toast({
        title: "Admin Deleted",
        description: result.message,
      });
      fetchAdmins();
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
  };

  const handleSaveEdit = async () => {
    if (editingAdmin) {
      if (!isValidEmail(editingAdmin.email)) {
        toast({
          title: "Error",
          description: "Invalid email address. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      const result = await updateAdmin(editingAdmin.id, editingAdmin.name, editingAdmin.email);
      setIsLoading(false);
      if (result.success) {
        toast({
          title: "Admin Updated",
          description: result.message,
        });
        setEditingAdmin(null);
        fetchAdmins();
      } else {
        toast({
          title: "Error",
          description: result.message || "An error occurred while updating the admin.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingAdmin(null);
  };

  const handleEditPassword = async (admin: Admin) => {
    setIsLoading(true);
    const result = await getAdminPassword(admin.id);
    setIsLoading(false);
    if (result.success) {
      setEditingPassword({ id: admin.id, password: "" });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleSavePassword = async () => {
    if (editingPassword) {
      setIsLoading(true);
      const result = await updateAdminPassword(editingPassword.id, editingPassword.password);
      setIsLoading(false);
      if (result.success) {
        toast({
          title: "Password Updated",
          description: result.message,
        });
        setEditingPassword(null);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleCancelPasswordEdit = () => {
    setEditingPassword(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Admins</CardTitle>
        <CardDescription>Manage existing admin accounts</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="space-y-4">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between bg-white p-4 rounded-md shadow">
                {editingAdmin && editingAdmin.id === admin.id ? (
                  <div className="flex-grow mr-4 space-y-2">
                    <Input
                      value={editingAdmin.name}
                      onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                      className="mb-2"
                      placeholder="Name"
                    />
                    <Input
                      value={editingAdmin.email}
                      onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                      className="mb-2"
                      placeholder="Email"
                    />
                  </div>
                ) : (
                  <div>
                    <p>
                      <strong>Name:</strong> {admin.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {admin.email}
                    </p>
                  </div>
                )}
                {editingPassword && editingPassword.id === admin.id ? (
                  <div className="flex-grow mr-4">
                    <Input
                      type="password"
                      value={editingPassword.password}
                      onChange={(e) => setEditingPassword({ ...editingPassword, password: e.target.value })}
                      className="mb-2"
                      placeholder="New password"
                    />
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleSavePassword} disabled={isLoading}>
                        Save Password
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancelPasswordEdit} disabled={isLoading}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    {editingAdmin && editingAdmin.id === admin.id ? (
                      <>
                        <Button variant="outline" size="icon" onClick={handleSaveEdit} disabled={isLoading}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleCancelEdit} disabled={isLoading}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="icon" onClick={() => handleEditAdmin(admin)} disabled={isLoading}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleEditPassword(admin)} disabled={isLoading}>
                          <Key className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" disabled={isLoading}>
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
                          <AlertDialogAction onClick={() => handleDeleteAdmin(admin.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-gray-500 text-center">No admins added yet.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SuperAdminDashboard: React.FC = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    } else {
      router.push("/auth/signin");
    }
  };

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
            <AddAdmin />
          </TabsContent>

          <TabsContent value="view-admins">
            <AdminList />
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  );
};

export default SuperAdminDashboard;