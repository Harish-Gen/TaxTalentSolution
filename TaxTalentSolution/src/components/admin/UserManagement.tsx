import { useState, useMemo } from "react";
import { useUsers, useEmployers, useUser } from "../../database/hooks";
import { userService } from "../../api/userService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { Separator } from "../ui/separator";
import { 
  Search, 
  Edit,
  Trash2,
  UserCog,
  Eye,
  Mail,
  Phone,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Key,
  Users
} from "lucide-react";

export function UserManagement() {
  const { users: dbUsers, loading, refresh } = useUsers();
  const { employers } = useEmployers();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { user: fetchedUser, loading: viewLoading } = useUser(selectedUserId || undefined);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const viewUser = useMemo(() => {
    if (!fetchedUser) return null;
    const employerNames = fetchedUser.assignedEmployers?.map((empId: string) => {
      const emp = employers.find(e => e.id === empId);
      return emp ? emp.company_name : empId;
    }) || [];
    return { ...fetchedUser, employerNames };
  }, [fetchedUser, employers]);

  const users = useMemo(() => {
    return dbUsers.map(user => {
      const employerNames = user.assignedEmployers?.map((empId: string) => {
        const emp = employers.find(e => e.id === empId);
        return emp ? emp.company_name : empId;
      }) || [];
      return { ...user, employerNames };
    });
  }, [dbUsers, employers]);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "viewer" as any,
    assignedEmployers: [] as string[]
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = async () => {
    try {
      await userService.upsertUser({
        ...newUser,
        status: "active"
      });
      toast.success("User created successfully");
      setIsAddDialogOpen(false);
      setNewUser({
        name: "",
        email: "",
        phone: "",
        role: "viewer",
        assignedEmployers: []
      });
      refresh();
    } catch (error) {
      console.error("Failed to add user:", error);
      toast.error("Failed to create user");
    }
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      await userService.upsertUser(editUser);
      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      refresh();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await userService.deleteUser(id);
      toast.success("User deleted");
      refresh();
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setUserToDelete(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "active" | "inactive" | "pending") => {
    try {
      await userService.upsertUser({ id, status: newStatus });
      toast.success(`User status updated to ${newStatus}`);
      refresh();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getPermissionsByRole = (role: string): string[] => {
    switch (role) {
      case "admin":
        return ["Full Access", "User Management", "Employer Management", "System Settings"];
      case "manager":
        return ["Employer Management", "View Reports", "Edit Employers"];
      case "viewer":
        return ["View Only"];
      default:
        return [];
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case "manager":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><UserCog className="w-3 h-3 mr-1" />Manager</Badge>;
      case "viewer":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><Eye className="w-3 h-3 mr-1" />Viewer</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    admins: users.filter(u => u.role === "admin").length,
    pending: users.filter(u => u.status === "pending").length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage users who maintain employer accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.admins}</p>
              </div>
              <Shield className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>View and manage user accounts and permissions</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account to manage employers
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName">Name *</Label>
                    <Input
                      id="userName"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userEmail">Email *</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        placeholder="john.doe@admin.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userPhone">Phone *</Label>
                      <Input
                        id="userPhone"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userRole">Role *</Label>
                    <Select value={newUser.role} onValueChange={(value: any) => setNewUser({...newUser, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin - Full system access</SelectItem>
                        <SelectItem value="manager">Manager - Can manage assigned employers</SelectItem>
                        <SelectItem value="viewer">Viewer - View only access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Assigned Employers *</Label>
                    <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                      {employers.map((employer) => (
                        <div key={employer.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={employer.id}
                            checked={newUser.assignedEmployers.includes(employer.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewUser({
                                  ...newUser,
                                  assignedEmployers: [...newUser.assignedEmployers, employer.id]
                                });
                              } else {
                                setNewUser({
                                  ...newUser,
                                  assignedEmployers: newUser.assignedEmployers.filter(id => id !== employer.id)
                                });
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <label htmlFor={employer.id} className="text-sm cursor-pointer">
                            {employer.company_name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <p className="font-medium mb-2">Permissions for {newUser.role}:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      {getPermissionsByRole(newUser.role).map((perm) => (
                        <li key={perm}>• {perm}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddUser}>Add User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name ? user.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          {getStatusBadge(user.status)}
                          {getRoleBadge(user.role)}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{user.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                          <span>Employers: {user.assignedEmployers?.length || 0}</span>
                          <span>•</span>
                          <span>Joined: {new Date(user.joinedDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Last login: {user.lastLogin}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Select
                        value={user.status}
                        onValueChange={(value: any) => handleStatusChange(user.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setUserToDelete(user.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View User Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader className="mb-4">
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Full profile, permissions and assigned employers for this user.
            </DialogDescription>
          </DialogHeader>
          {viewLoading ? (
            <div className="flex justify-center py-12 text-muted-foreground">
              <Clock className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading user details...</span>
            </div>
          ) : viewUser ? (
            <div className="space-y-6 pb-2">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {viewUser.name ? viewUser.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{viewUser.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(viewUser.status)}
                    {getRoleBadge(viewUser.role)}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{viewUser.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{viewUser.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Joined: {new Date(viewUser.joinedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Last login: {viewUser.lastLogin}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Permissions</h3>
                <div className="space-y-2">
                  {(viewUser.permissions || []).map((permission: string) => (
                    <div key={permission} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{permission}</span>
                    </div>
                  ))}
                  {(!viewUser.permissions || viewUser.permissions.length === 0) && (
                    <p className="text-sm text-muted-foreground">No permissions assigned.</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Assigned Employers ({viewUser.assignedEmployers?.length || 0})</h3>
                <div className="flex flex-wrap gap-2">
                  {(viewUser.employerNames || []).map((employerName: string, index: number) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {employerName}
                    </Badge>
                  ))}
                  {(!viewUser.employerNames || viewUser.employerNames.length === 0) && (
                    <p className="text-sm text-muted-foreground">No employers assigned.</p>
                  )}
                </div>
              </div>


            </div>
          ) : (
            <p className="text-sm text-muted-foreground px-4 py-8 text-center">No user selected.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="max-w-md sm:max-w-md">
          <DialogHeader className="sm:text-center flex flex-col items-center pt-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-center pt-2 text-base">
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-6 flex-row gap-3 justify-center w-full">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setUserToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" className="w-full sm:w-auto" onClick={() => userToDelete && handleDeleteUser(userToDelete)}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
