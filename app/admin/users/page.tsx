"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  ChevronDown,
  Shield,
  ShieldAlert,
  UserCheck,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import DynamicGlowCard from "@/components/dynamic-glow-card"

// Types for backend integration
interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  joinDate: string
  walletAddress: string
  contributions: number
  avatar: string
}

// Mock API functions - would be replaced with real API calls
const fetchUsers = async (): Promise<User[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Mock users data
  return [
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex@example.com",
      role: "Community Member",
      status: "Active",
      joinDate: "2023-05-12",
      walletAddress: "0x1a2b...3c4d",
      contributions: 24,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      name: "Maria Garcia",
      email: "maria@example.com",
      role: "Moderator",
      status: "Active",
      joinDate: "2023-04-03",
      walletAddress: "0x5e6f...7g8h",
      contributions: 56,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "3",
      name: "James Wilson",
      email: "james@example.com",
      role: "Admin",
      status: "Active",
      joinDate: "2023-01-15",
      walletAddress: "0x9i0j...1k2l",
      contributions: 112,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "4",
      name: "Sarah Ahmed",
      email: "sarah@example.com",
      role: "Community Member",
      status: "Inactive",
      joinDate: "2023-06-22",
      walletAddress: "0x3m4n...5o6p",
      contributions: 8,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "5",
      name: "David Lee",
      email: "david@example.com",
      role: "Founding Member",
      status: "Active",
      joinDate: "2023-02-28",
      walletAddress: "0x7q8r...9s0t",
      contributions: 87,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]
}

const createUser = async (userData: any): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real implementation, this would send the data to your API
  return {
    id: Math.random().toString(36).substring(2, 9),
    name: userData.name,
    email: userData.email,
    role: userData.role,
    status: "Active",
    joinDate: new Date().toISOString().split("T")[0],
    walletAddress: userData.walletAddress || "0x...",
    contributions: 0,
    avatar: "/placeholder.svg?height=40&width=40",
  }
}

const deleteUser = async (userId: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // In a real implementation, this would send a delete request to your API
  return true
}

const updateUserRole = async (userId: string, newRole: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  // In a real implementation, this would update the user's role via your API
  return true
}

const updateUserStatus = async (userId: string, newStatus: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  // In a real implementation, this would update the user's status via your API
  return true
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Community Member",
    walletAddress: "",
  })

  // Fetch users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true)
        const data = await fetchUsers()
        setUsers(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = selectedRole ? user.role === selectedRole : true
    const matchesStatus = selectedStatus ? user.status === selectedStatus : true

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    try {
      setIsSubmitting(true)
      const success = await deleteUser(userToDelete)

      if (success) {
        // Update local state
        setUsers(users.filter((user) => user.id !== userToDelete))

        toast({
          title: "User Deleted",
          description: `User has been successfully deleted.`,
          variant: "default",
        })
      }
    } catch (err) {
      console.error("Error deleting user:", err)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleAddUser = async () => {
    // Validate form
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Error",
        description: "Name and email are required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const createdUser = await createUser(newUser)

      // Update local state
      setUsers([createdUser, ...users])

      toast({
        title: "User Added",
        description: `${newUser.name} has been added as a ${newUser.role}.`,
        variant: "default",
      })

      // Reset form
      setNewUser({
        name: "",
        email: "",
        role: "Community Member",
        walletAddress: "",
      })
    } catch (err) {
      console.error("Error adding user:", err)
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsAddUserDialogOpen(false)
    }
  }

  const handleViewProfile = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    toast({
      title: "Profile Viewed",
      description: `Viewing profile for ${user?.name}.`,
      variant: "default",
    })
    // In a real implementation, this would navigate to the user profile page
  }

  const handleEditUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    toast({
      title: "Edit User",
      description: `Editing user ${user?.name}.`,
      variant: "default",
    })
    // In a real implementation, this would open an edit user dialog
  }

  const handleChangeRole = async (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    // In a real implementation, this would open a dialog to select the new role
    const newRole = user.role === "Community Member" ? "Moderator" : "Community Member"

    try {
      const success = await updateUserRole(userId, newRole)

      if (success) {
        // Update local state
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))

        toast({
          title: "Role Changed",
          description: `Changed role for ${user.name} to ${newRole}.`,
          variant: "default",
        })
      }
    } catch (err) {
      console.error("Error changing role:", err)
      toast({
        title: "Error",
        description: "Failed to change user role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    const newStatusValue = user.status === "Active" ? "Inactive" : "Active"

    try {
      const success = await updateUserStatus(userId, newStatusValue)

      if (success) {
        // Update local state
        setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatusValue } : u)))

        toast({
          title: "Status Changed",
          description: `${user.name} is now ${newStatusValue}.`,
          variant: "default",
        })
      }
    } catch (err) {
      console.error("Error changing status:", err)
      toast({
        title: "Error",
        description: "Failed to change user status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30">Admin</Badge>
      case "Moderator":
        return <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/30">Moderator</Badge>
      case "Founding Member":
        return (
          <Badge className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/30">
            Founding Member
          </Badge>
        )
      default:
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30">
            Member
          </Badge>
        )
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30">Active</Badge>
        )
      case "Inactive":
        return <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border-gray-500/30">Inactive</Badge>
      case "Suspended":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/30">
            Suspended
          </Badge>
        )
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border-gray-500/30">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
          <p className="text-emerald-400">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <DynamicGlowCard variant="purple" className="p-6">
          <div className="flex flex-col items-center text-center">
            <Search className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Users</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-emerald-600 to-purple-600"
            >
              Try Again
            </Button>
          </div>
        </DynamicGlowCard>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">View and manage all users in the WAGA Protocol ecosystem.</p>
        </div>

        {/* Filters and actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8 bg-background/50 border-purple-500/20 focus:border-emerald-500/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-purple-500/20 hover:bg-purple-500/10">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="web3-card-purple">
                <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setSelectedRole(null)}
                  className={!selectedRole ? "bg-purple-500/20" : ""}
                >
                  All Roles
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedRole("Admin")}
                  className={selectedRole === "Admin" ? "bg-purple-500/20" : ""}
                >
                  Admin
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedRole("Moderator")}
                  className={selectedRole === "Moderator" ? "bg-purple-500/20" : ""}
                >
                  Moderator
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedRole("Founding Member")}
                  className={selectedRole === "Founding Member" ? "bg-purple-500/20" : ""}
                >
                  Founding Member
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedRole("Community Member")}
                  className={selectedRole === "Community Member" ? "bg-purple-500/20" : ""}
                >
                  Community Member
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setSelectedStatus(null)}
                  className={!selectedStatus ? "bg-purple-500/20" : ""}
                >
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedStatus("Active")}
                  className={selectedStatus === "Active" ? "bg-purple-500/20" : ""}
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedStatus("Inactive")}
                  className={selectedStatus === "Inactive" ? "bg-purple-500/20" : ""}
                >
                  Inactive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedStatus("Suspended")}
                  className={selectedStatus === "Suspended" ? "bg-purple-500/20" : ""}
                >
                  Suspended
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            className="bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500"
            onClick={() => setIsAddUserDialogOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </div>

        {/* Applied filters display */}
        {(selectedRole || selectedStatus) && (
          <div className="flex flex-wrap gap-2">
            {selectedRole && (
              <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-400">
                Role: {selectedRole}
                <button className="ml-2 hover:text-purple-300" onClick={() => setSelectedRole(null)}>
                  ×
                </button>
              </Badge>
            )}
            {selectedStatus && (
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                Status: {selectedStatus}
                <button className="ml-2 hover:text-emerald-300" onClick={() => setSelectedStatus(null)}>
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Users table */}
        <div className="rounded-md border border-purple-500/20 overflow-hidden">
          <Table>
            <TableHeader className="bg-purple-950/30">
              <TableRow className="hover:bg-purple-950/40 border-purple-500/20">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead>Contributions</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-purple-950/20 border-purple-500/20">
                    <TableCell>
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={`${user.name}'s avatar`}
                        className="h-8 w-8 rounded-full border border-emerald-500/30"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="font-mono text-xs">{user.walletAddress}</div>
                    </TableCell>
                    <TableCell>{user.contributions}</TableCell>
                    <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="web3-card-purple">
                          <DropdownMenuItem onClick={() => handleViewProfile(user.id)}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleChangeRole(user.id)}>
                            <Shield className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            {user.status === "Active" ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No users found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10" disabled>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-purple-500/20 bg-purple-500/20 hover:bg-purple-500/30"
            >
              1
            </Button>
            <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="web3-card-purple">
          <DialogHeader>
            <DialogTitle>Confirm User Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone and all user data will be
              permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="web3-card-purple">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account for the WAGA Protocol platform.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="bg-background/50 border-purple-500/20 focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="bg-background/50 border-purple-500/20 focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full rounded-md border border-purple-500/20 bg-background/50 px-3 py-2 text-sm focus:border-emerald-500/50"
              >
                <option value="Community Member">Community Member</option>
                <option value="Founding Member">Founding Member</option>
                <option value="Moderator">Moderator</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="walletAddress">Wallet Address (Optional)</Label>
              <Input
                id="walletAddress"
                placeholder="0x..."
                value={newUser.walletAddress}
                onChange={(e) => setNewUser({ ...newUser, walletAddress: e.target.value })}
                className="bg-background/50 border-purple-500/20 focus:border-emerald-500/50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500"
              onClick={handleAddUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding User...
                </>
              ) : (
                "Add User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

