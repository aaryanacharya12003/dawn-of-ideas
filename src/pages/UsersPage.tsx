import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Search, 
  Filter, 
  UserIcon, 
  ShieldIcon, 
  KeyIcon, 
  MoreVerticalIcon,
  EyeIcon,
  BuildingIcon,
  CalculatorIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '@/types';
import { fetchPGs } from '@/services';
import { assignPGToUser, removePGFromUser } from '@/services/userService';

// User form schema with optional assignedPGs - updated to include accountant
const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["admin", "manager", "accountant", "viewer"]),
  assignedPGs: z.array(z.string()).optional().default([])
});

type UserFormValues = z.infer<typeof userFormSchema>;

// User edit form schema (no password required) - updated to include accountant
const userEditFormSchema = userFormSchema.omit({ password: true });

type UserEditFormValues = z.infer<typeof userEditFormSchema>;

const UsersPage = () => {
  const { user, getUsers, createUser, updateUser, deleteUser } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState<User[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pgAccessDialogOpen, setPgAccessDialogOpen] = useState(false);
  const [availablePGs, setAvailablePGs] = useState<{id: string, name: string}[]>([]);
  const [selectedPGsForNewUser, setSelectedPGsForNewUser] = useState<string[]>([]);
  const { toast } = useToast();

  // Forms
  const addForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'manager',
      assignedPGs: []
    }
  });

  const editForm = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'manager',
      assignedPGs: []
    }
  });

  // Watch the role field to conditionally show PG selection
  const watchedRole = addForm.watch('role');

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    fetchAvailablePGs();
  }, []);

  // Reset PG selection when role changes to admin
  useEffect(() => {
    if (watchedRole === 'admin') {
      setSelectedPGsForNewUser([]);
      addForm.setValue('assignedPGs', []);
    }
  }, [watchedRole, addForm]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const users = await getUsers();
      console.log('Fetched users in component:', users);
      setUserData(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailablePGs = async () => {
    try {
      const pgs = await fetchPGs();
      setAvailablePGs(pgs.map(pg => ({ id: pg.id, name: pg.name })));
    } catch (error) {
      console.error("Error fetching PGs:", error);
      toast({
        title: "Error",
        description: "Failed to load PG list. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddUser = async (data: UserFormValues) => {
    console.log('Adding user with data:', data);
    setIsLoading(true);
    try {
      // For admin users, don't assign specific PGs
      const assignedPGs = data.role === 'admin' ? [] : selectedPGsForNewUser;
      
      await createUser(data.email, data.password, data.name, data.role, assignedPGs);
      setIsAddDialogOpen(false);
      addForm.reset();
      setSelectedPGsForNewUser([]);
      
      // Wait a moment for the user to be created, then refresh
      setTimeout(async () => {
        await fetchUsers();
      }, 1500);
      
      toast({
        title: "Success",
        description: `User created successfully${data.role === 'admin' ? ' with full access to all PGs' : assignedPGs.length > 0 ? ` with access to ${assignedPGs.length} PG(s)` : ''}.`
      });
    } catch (error: any) {
      console.error("Error adding user:", error);
      
      let errorMessage = "Failed to create user. Please try again.";
      if (error.message?.includes('already registered')) {
        errorMessage = "A user with this email already exists. Please use a different email address.";
      } else if (error.message?.includes('email')) {
        errorMessage = "Please check the email address and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePGSelectionForNewUser = (pgName: string, checked: boolean) => {
    if (checked) {
      setSelectedPGsForNewUser(prev => [...prev, pgName]);
    } else {
      setSelectedPGsForNewUser(prev => prev.filter(pg => pg !== pgName));
    }
  };

  const handleEditUser = async (data: UserEditFormValues) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      await updateUser({
        id: currentUser.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: currentUser.status,
        lastLogin: currentUser.lastLogin,
        assignedPGs: currentUser.assignedPGs
      });
      setIsEditDialogOpen(false);
      editForm.reset();
      await fetchUsers();
      toast({
        title: "Success",
        description: "User updated successfully."
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteUser(id);
      await fetchUsers();
      toast({
        title: "Success",
        description: "User deleted successfully."
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (user: User) => {
    setCurrentUser(user);
    editForm.setValue('name', user.name);
    editForm.setValue('email', user.email);
    editForm.setValue('role', user.role as any);
    setIsEditDialogOpen(true);
  };

  const openPGAccessDialog = (user: User) => {
    setCurrentUser(user);
    setPgAccessDialogOpen(true);
  };

  const handleAssignPG = async (pgId: string, pgName: string) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // Use pgName instead of pgId for assignment
      await assignPGToUser(currentUser.id, pgName);
      
      // Update the user in the local state
      const updatedUser = { ...currentUser };
      // Ensure assignedPGs is an array
      const assignedPGs = Array.isArray(updatedUser.assignedPGs) ? [...updatedUser.assignedPGs] : [];
      
      if (!assignedPGs.includes(pgName)) {
        assignedPGs.push(pgName);
      }
      
      updatedUser.assignedPGs = assignedPGs;
      setCurrentUser(updatedUser);
      
      // Update the user in the userData array
      setUserData(userData.map(u => 
        u.id === currentUser.id ? updatedUser : u
      ));
      
      // Also update the user via the AuthContext for the currently logged in user
      if (user && user.id === currentUser.id) {
        updateUser(updatedUser);
      }
      
      toast({
        title: "Success",
        description: `${pgName} has been assigned to ${currentUser.name}.`
      });
    } catch (error) {
      console.error("Error assigning PG:", error);
      toast({
        title: "Error",
        description: "Failed to assign PG. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePG = async (pgId: string, pgName: string) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // Use pgName instead of pgId for removal
      await removePGFromUser(currentUser.id, pgName);
      
      // Update the user in the local state
      const updatedUser = { ...currentUser };
      let assignedPGs = Array.isArray(updatedUser.assignedPGs) ? [...updatedUser.assignedPGs] : [];
      assignedPGs = assignedPGs.filter(pg => pg !== pgName);
      updatedUser.assignedPGs = assignedPGs;
      setCurrentUser(updatedUser);
      
      // Update the user in the userData array
      setUserData(userData.map(u => 
        u.id === currentUser.id ? updatedUser : u
      ));
      
      // Also update the user via the AuthContext for the currently logged in user
      if (user && user.id === currentUser.id) {
        updateUser(updatedUser);
      }
      
      toast({
        title: "Success",
        description: `${pgName} has been removed from ${currentUser.name}.`
      });
    } catch (error) {
      console.error("Error removing PG:", error);
      toast({
        title: "Error",
        description: "Failed to remove PG. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isPGAssigned = (pgName: string) => {
    if (!currentUser || !currentUser.assignedPGs) return false;
    
    const assignedPGs = Array.isArray(currentUser.assignedPGs) 
      ? currentUser.assignedPGs 
      : [];
      
    return assignedPGs.includes(pgName);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Manager</Badge>;
      case 'accountant':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accountant</Badge>;
      case 'viewer':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Viewer</Badge>;
      default:
        return null;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldIcon className="h-4 w-4 text-purple-500" />;
      case 'manager':
        return <KeyIcon className="h-4 w-4 text-blue-500" />;
      case 'accountant':
        return <CalculatorIcon className="h-4 w-4 text-green-500" />;
      case 'viewer':
        return <EyeIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusDot = (status: string = 'active') => {
    return (
      <span className={`inline-block h-2 w-2 rounded-full ${
        status === 'active' ? 'bg-green-500' : 'bg-gray-300'
      }`}></span>
    );
  };

  // Filter users based on active tab and search query
  const filteredUsers = userData.filter(user => {
    // Filter by role tab
    if (activeTab !== "all" && user.role !== activeTab) return false;
    
    // Filter by search query
    if (searchQuery && 
        !user.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users by name or email..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
          <TabsTrigger value="manager">Managers</TabsTrigger>
          <TabsTrigger value="accountant">Accountants</TabsTrigger>
          <TabsTrigger value="viewer">Viewers</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">User</th>
                      <th className="text-left p-4">Role</th>
                      <th className="text-left p-4 hidden md:table-cell">Status</th>
                      <th className="text-left p-4 hidden md:table-cell">Last Login</th>
                      <th className="text-left p-4 hidden lg:table-cell">Assigned PGs</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(user.role)}
                            {getRoleBadge(user.role)}
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            {getStatusDot(user.status)}
                            <span className="capitalize">{user.status || 'active'}</span>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          {user.lastLogin || 'Never'}
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {user.role === 'admin' ? (
                              <Badge variant="outline" className="text-xs bg-purple-50">
                                All PGs (Admin)
                              </Badge>
                            ) : user.assignedPGs && Array.isArray(user.assignedPGs) && user.assignedPGs.length > 0 ? (
                              user.assignedPGs.map((pg: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {pg}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openEditDialog(user)}>Edit User</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openPGAccessDialog(user)}>Manage PG Access</DropdownMenuItem>
                              <DropdownMenuItem>View Activity Log</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                    Delete User
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the user
                                      and remove their data from our servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center">
                          <div className="flex flex-col items-center">
                            <UserIcon className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">No users found matching your criteria</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user with specific role and permissions.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddUser)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Admins have full access to all PGs. Managers have limited access. Accountants can manage payments. Viewers can only view.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* PG Assignment Section - Only show for non-admin roles */}
              {watchedRole !== 'admin' && (
                <div className="space-y-3">
                  <FormLabel>Assign PGs</FormLabel>
                  <FormDescription>
                    Select which PGs this {watchedRole} should have access to.
                  </FormDescription>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {availablePGs.map(pg => (
                      <div key={pg.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`pg-${pg.id}`}
                          checked={selectedPGsForNewUser.includes(pg.name)}
                          onCheckedChange={(checked) => handlePGSelectionForNewUser(pg.name, checked as boolean)}
                        />
                        <label
                          htmlFor={`pg-${pg.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {pg.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedPGsForNewUser.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedPGsForNewUser.join(', ')}
                    </p>
                  )}
                </div>
              )}
              
              {watchedRole === 'admin' && (
                <div className="p-3 bg-purple-50 rounded-md">
                  <p className="text-sm text-purple-800">
                    <ShieldIcon className="inline h-4 w-4 mr-1" />
                    Admin users have access to all PGs automatically.
                  </p>
                </div>
              )}
              
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditUser)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Admins have full access. Managers have limited access. Accountants can manage payments. Viewers can only view.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Manage PG Access Dialog */}
      <Dialog open={pgAccessDialogOpen} onOpenChange={setPgAccessDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage PG Access</DialogTitle>
            <DialogDescription>
              {currentUser && `Assign or remove PG access for ${currentUser.name}.`}
              {currentUser?.role === 'admin' && ' (Admin users have access to all PGs by default)'}
            </DialogDescription>
          </DialogHeader>
          
          {currentUser && (
            <div className="space-y-4">
              {currentUser.role === 'admin' ? (
                <div className="p-4 bg-purple-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <ShieldIcon className="h-5 w-5 text-purple-600" />
                    <p className="text-sm font-medium text-purple-800">
                      Admin Access
                    </p>
                  </div>
                  <p className="text-sm text-purple-700 mt-1">
                    This user has administrative privileges and can access all PGs automatically.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium">Available PGs</p>
                  
                  {availablePGs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No PGs available.</p>
                  ) : (
                    <div className="space-y-2">
                      {availablePGs.map(pg => (
                        <Card key={pg.id} className="p-0">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <BuildingIcon className="h-5 w-5 text-muted-foreground" />
                                <span>{pg.name}</span>
                              </div>
                              
                              {isPGAssigned(pg.name) ? (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleRemovePG(pg.id, pg.name)}
                                  disabled={isLoading}
                                >
                                  Remove Access
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleAssignPG(pg.id, pg.name)}
                                  disabled={isLoading}
                                >
                                  Grant Access
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
              
              <DialogFooter>
                <Button onClick={() => setPgAccessDialogOpen(false)}>
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
