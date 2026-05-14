import { useState } from "react";
import { LocalDatabase } from "../../database/localDb";
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

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "viewer";
  status: "active" | "inactive" | "pending";
  assignedEmployers: string[];
  permissions: string[];
  joinedDate: string;
  lastLogin: string;
}

// Mock users data
const mockUsers: User[] = [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh.kumar@admin.com",
    phone: "+91 98765 43210",
    role: "admin",
    status: "active",
    assignedEmployers: ["All Employers"],
    permissions: ["Full Access", "User Management", "Employer Management", "System Settings"],
    joinedDate: "2024-01-10",
    lastLogin: "2 hours ago"
  },
  {
    id: 2,
    name: "Priya Mehta",
    email: "priya.mehta@admin.com",
    phone: "+91 98765 43211",
    role: "manager",
    status: "active",
    assignedEmployers: ["KPMG India", "Deloitte India", "Grant Thornton India"],
    permissions: ["Employer Management", "View Reports", "Edit Employers"],
    joinedDate: "2024-02-15",
    lastLogin: "1 day ago"
  },
  {
    id: 3,
    name: "Amit Sharma",
    email: "amit.sharma@admin.com",
    phone: "+91 98765 43212",
    role: "manager",
    status: "active",
    assignedEmployers: ["TaxWise Solutions", "IndoTax Advisors"],
    permissions: ["Employer Management", "View Reports"],
    joinedDate: "2024-03-20",
    lastLogin: "3 hours ago"
  },
  {
    id: 4,
    name: "Sneha Patel",
    email: "sneha.patel@admin.com",
    phone: "+91 98765 43213",
    role: "viewer",
    status: "active",
    assignedEmployers: ["KPMG India"],
    permissions: ["View Only"],
    joinedDate: "2024-05-12",
    lastLogin: "1 week ago"
  },
  {
    id: 5,
    name: "Vikram Singh",
    email: "vikram.singh@admin.com",
    phone: "+91 98765 43214",
    role: "manager",
    status: "pending",
    assignedEmployers: ["RSM India"],
    permissions: ["Employer Management", "View Reports"],
    joinedDate: "2024-12-20",
    lastLogin: "Never"
  },
  {
    id: 6,
    name: "Anita Desai",
    email: "anita.desai@admin.com",
    phone: "+91 98765 43215",
    role: "viewer",
    status: "inactive",
    assignedEmployers: ["Grant Thornton India"],
    permissions: ["View Only"],
    joinedDate: "2024-04-08",
    lastLogin: "2 months ago"
  }
];

const availableEmployers = [
  "KPMG India",
  "Deloitte India",
  "Grant Thornton India",
  "TaxWise Solutions",
  "IndoTax Advisors",
  "RSM India"
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "viewer" as const,
    assignedEmployers: [] as string[]
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    // Persist to shared database
    LocalDatabase.addAdminUser({
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
    });
    const permissions = getPermissionsByRole(newUser.role);
    const user: User = {
      id: users.length + 1,
      ...newUser,
      status: "pending",
      permissions,
      joinedDate: new Date().toISOString().split('T')[0],
      lastLogin: "Never"
    };
    setUsers([user, ...users]);
    setIsAddDialogOpen(false);
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "viewer",
      assignedEmployers: []
    });
  };

  const handleDeleteUser = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const handleStatusChange = (id: number, newStatus: "active" | "inactive" | "pending") => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: newStatus } : user
    ));
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
                      {availableEmployers.map((employer) => (
                        <div key={employer} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={employer}
                            checked={newUser.assignedEmployers.includes(employer)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewUser({
                                  ...newUser,
                                  assignedEmployers: [...newUser.assignedEmployers, employer]
                                });
                              } else {
                                setNewUser({
                                  ...newUser,
                                  assignedEmployers: newUser.assignedEmployers.filter(e => e !== employer)
                                });
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <label htmlFor={employer} className="text-sm cursor-pointer">
                            {employer}
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
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                          <span>Employers: {user.assignedEmployers.length}</span>
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
                          setSelectedUser(user);
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
                        onClick={() => handleDeleteUser(user.id)}
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

      {/* View User Sheet */}
      <Sheet open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>User Details</SheetTitle>
            <SheetDescription>
              Full profile, permissions and assigned employers for this user.
            </SheetDescription>
          </SheetHeader>
          {selectedUser ? (
            <div className="space-y-6 px-4 pb-8">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(selectedUser.status)}
                    {getRoleBadge(selectedUser.role)}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedUser.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Joined: {new Date(selectedUser.joinedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Last login: {selectedUser.lastLogin}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Permissions</h3>
                <div className="space-y-2">
                  {selectedUser.permissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{permission}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Assigned Employers ({selectedUser.assignedEmployers.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.assignedEmployers.map((employer) => (
                    <Badge key={employer} variant="outline" className="px-3 py-1">
                      {employer}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button variant="outline" className="flex-1">
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </Button>
                <Button variant="outline" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground px-4">No user selected.</p>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
