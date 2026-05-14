import { useState } from "react";
import { LocalDatabase } from "../../database/localDb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { 
  Search, 
  Filter,
  Edit,
  Trash2,
  Building2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Globe,
  Briefcase
} from "lucide-react";

interface Employer {
  id: number;
  dbId?: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  industry: string;
  size: string;
  website: string;
  status: "cpa_firm" | "lead" | "contacted" | "proposal" | "negotiating" | "won" | "active" | "inactive" | "pending" | "declined";
  activeJobs: number;
  totalHires: number;
  joinedDate: string;
  lastActive: string;
}

// Mock employers data
const mockEmployers: Employer[] = [
  {
    id: 1,
    dbId: "eeeeeeee-0001-0001-0001-000000000001",
    companyName: "KPMG India",
    contactPerson: "Rajesh Mehta",
    email: "rajesh.mehta@kpmg.com",
    phone: "+91 22 3090 2000",
    location: "Mumbai, Maharashtra",
    industry: "Accounting & Tax Services",
    size: "1000+",
    website: "www.kpmg.com/in",
    status: "active",
    activeJobs: 15,
    totalHires: 45,
    joinedDate: "2024-01-15",
    lastActive: "2 hours ago"
  },
  {
    id: 2,
    dbId: "eeeeeeee-0001-0001-0001-000000000002",
    companyName: "Deloitte India",
    contactPerson: "Priya Sharma",
    email: "priya.sharma@deloitte.com",
    phone: "+91 80 6627 6000",
    location: "Bangalore, Karnataka",
    industry: "Professional Services",
    size: "1000+",
    website: "www.deloitte.com/in",
    status: "active",
    activeJobs: 22,
    totalHires: 67,
    joinedDate: "2024-02-20",
    lastActive: "1 day ago"
  },
  {
    id: 3,
    companyName: "TaxWise Solutions",
    contactPerson: "Amit Kumar",
    email: "amit@taxwise.in",
    phone: "+91 11 4567 8900",
    location: "New Delhi, Delhi",
    industry: "Tax Consulting",
    size: "50-200",
    website: "www.taxwise.in",
    status: "active",
    activeJobs: 8,
    totalHires: 12,
    joinedDate: "2024-05-10",
    lastActive: "3 hours ago"
  },
  {
    id: 4,
    companyName: "IndoTax Advisors",
    contactPerson: "Sneha Patel",
    email: "sneha@indotax.co.in",
    phone: "+91 79 2658 7410",
    location: "Ahmedabad, Gujarat",
    industry: "Tax Advisory",
    size: "10-50",
    website: "www.indotax.co.in",
    status: "pending",
    activeJobs: 3,
    totalHires: 2,
    joinedDate: "2024-12-15",
    lastActive: "1 week ago"
  },
  {
    id: 5,
    companyName: "Grant Thornton India",
    contactPerson: "Vikram Singh",
    email: "vikram.singh@in.gt.com",
    phone: "+91 124 462 8000",
    location: "Gurgaon, Haryana",
    industry: "Audit & Tax Services",
    size: "500-1000",
    website: "www.grantthornton.in",
    status: "active",
    activeJobs: 18,
    totalHires: 38,
    joinedDate: "2024-03-05",
    lastActive: "5 hours ago"
  },
  {
    id: 6,
    companyName: "RSM India",
    contactPerson: "Anita Desai",
    email: "anita.desai@rsm.in",
    phone: "+91 22 6108 5555",
    location: "Mumbai, Maharashtra",
    industry: "Accounting Services",
    size: "200-500",
    website: "www.rsm.global/india",
    status: "inactive",
    activeJobs: 0,
    totalHires: 8,
    joinedDate: "2024-04-18",
    lastActive: "2 months ago"
  }
];

export function EmployerManagement() {
  const [employers, setEmployers] = useState<Employer[]>(mockEmployers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editEmployer, setEditEmployer] = useState<Employer | null>(null);

  // New employer form state
  const [newEmployer, setNewEmployer] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    location: "",
    industry: "",
    size: "",
    website: ""
  });

  const filteredEmployers = employers.filter(employer => {
    const matchesSearch = employer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || employer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddEmployer = () => {
    // Persist to shared database
    const newDbEmployer = LocalDatabase.addEmployer({
      companyName: newEmployer.companyName,
      contactPerson: newEmployer.contactPerson,
      email: newEmployer.email,
      phone: newEmployer.phone,
      location: newEmployer.location,
      industry: newEmployer.industry,
      size: newEmployer.size,
      website: newEmployer.website,
    });
    const employer: Employer = {
      id: employers.length + 1,
      dbId: newDbEmployer.id,
      ...newEmployer,
      status: "pending",
      activeJobs: 0,
      totalHires: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: "Just now"
    };
    setEmployers([employer, ...employers]);
    setIsAddDialogOpen(false);
    setNewEmployer({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      location: "",
      industry: "",
      size: "",
      website: ""
    });
  };

  const handleSaveEdit = () => {
    if (!editEmployer) return;
    setEmployers(employers.map(emp => emp.id === editEmployer.id ? { ...editEmployer } : emp));
    setIsEditDialogOpen(false);
    setEditEmployer(null);
  };

  const handleDeleteEmployer = (id: number) => {
    if (confirm("Are you sure you want to delete this employer?")) {
      setEmployers(employers.filter(emp => emp.id !== id));
    }
  };

  const handleStatusChange = (id: number, newStatus: "cpa_firm" | "lead" | "contacted" | "proposal" | "negotiating" | "won" | "active" | "inactive" | "pending" | "declined") => {
    setEmployers(employers.map(emp => 
      emp.id === id ? { ...emp, status: newStatus } : emp
    ));
  };

  const getEmployerJobsFromDb = (dbId?: string) => {
    if (!dbId) return [];
    return LocalDatabase.getJobs().filter(j => j.employer_id === dbId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "cpa_firm":
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">CPA Firm</Badge>;
      case "lead":
        return <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100">Lead</Badge>;
      case "contacted":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Contacted</Badge>;
      case "proposal":
        return <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100">Proposal</Badge>;
      case "negotiating":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Negotiating</Badge>;
      case "won":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Won</Badge>;
      case "declined":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Declined</Badge>;
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

  const stats = {
    total: employers.length,
    active: employers.filter(e => e.status === "active").length,
    negotiating: employers.filter(e => e.status === "negotiating").length,
    declined: employers.filter(e => e.status === "declined").length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Employer Management</h1>
        <p className="text-muted-foreground mt-1">Manage employer accounts and subscriptions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employers</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600 opacity-50" />
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
                <p className="text-sm text-muted-foreground">Negotiating</p>
                <p className="text-3xl font-bold mt-1 text-orange-600">{stats.negotiating}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Declined</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.declined}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Employers</CardTitle>
              <CardDescription>View and manage employer accounts</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Employer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Employer</DialogTitle>
                  <DialogDescription>
                    Enter the employer details below to create a new account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={newEmployer.companyName}
                        onChange={(e) => setNewEmployer({...newEmployer, companyName: e.target.value})}
                        placeholder="ACME Corporation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        value={newEmployer.contactPerson}
                        onChange={(e) => setNewEmployer({...newEmployer, contactPerson: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newEmployer.email}
                        onChange={(e) => setNewEmployer({...newEmployer, email: e.target.value})}
                        placeholder="contact@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={newEmployer.phone}
                        onChange={(e) => setNewEmployer({...newEmployer, phone: e.target.value})}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={newEmployer.location}
                      onChange={(e) => setNewEmployer({...newEmployer, location: e.target.value})}
                      placeholder="Mumbai, Maharashtra"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Input
                        id="industry"
                        value={newEmployer.industry}
                        onChange={(e) => setNewEmployer({...newEmployer, industry: e.target.value})}
                        placeholder="Tax Services"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Company Size *</Label>
                      <Select value={newEmployer.size} onValueChange={(value) => setNewEmployer({...newEmployer, size: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="10-50">10-50 employees</SelectItem>
                          <SelectItem value="50-200">50-200 employees</SelectItem>
                          <SelectItem value="200-500">200-500 employees</SelectItem>
                          <SelectItem value="500-1000">500-1000 employees</SelectItem>
                          <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={newEmployer.website}
                      onChange={(e) => setNewEmployer({...newEmployer, website: e.target.value})}
                      placeholder="www.company.com"
                    />
                  </div>


                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddEmployer}>Add Employer</Button>
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
                placeholder="Search by company, contact, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="cpa_firm">CPA Firm</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

          </div>

          {/* Employers Table */}
          <div className="space-y-3">
            {filteredEmployers.map((employer) => (
              <Card key={employer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {employer.companyName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg">{employer.companyName}</h3>
                          {getStatusBadge(employer.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{employer.contactPerson}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{employer.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{employer.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{getEmployerJobsFromDb(employer.dbId).length || employer.activeJobs} active jobs</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>Joined: {new Date(employer.joinedDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Last active: {employer.lastActive}</span>
                          <span>•</span>
                          <span>{employer.totalHires} total hires</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEmployer(employer);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditEmployer({ ...employer });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Select
                        value={employer.status}
                        onValueChange={(value: any) => handleStatusChange(employer.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpa_firm">CPA Firm</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="negotiating">Negotiating</SelectItem>
                          <SelectItem value="won">Won</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteEmployer(employer.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEmployers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No employers found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Employer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employer</DialogTitle>
            <DialogDescription>Update the employer details below</DialogDescription>
          </DialogHeader>
          {editEmployer && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-companyName">Company Name *</Label>
                  <Input
                    id="edit-companyName"
                    value={editEmployer.companyName}
                    onChange={(e) => setEditEmployer({ ...editEmployer, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contactPerson">Contact Person *</Label>
                  <Input
                    id="edit-contactPerson"
                    value={editEmployer.contactPerson}
                    onChange={(e) => setEditEmployer({ ...editEmployer, contactPerson: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editEmployer.email}
                    onChange={(e) => setEditEmployer({ ...editEmployer, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editEmployer.phone}
                    onChange={(e) => setEditEmployer({ ...editEmployer, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editEmployer.location}
                  onChange={(e) => setEditEmployer({ ...editEmployer, location: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-industry">Industry</Label>
                  <Input
                    id="edit-industry"
                    value={editEmployer.industry}
                    onChange={(e) => setEditEmployer({ ...editEmployer, industry: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-size">Company Size</Label>
                  <Select value={editEmployer.size} onValueChange={(value) => setEditEmployer({ ...editEmployer, size: value })}>
                    <SelectTrigger id="edit-size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="10-50">10-50 employees</SelectItem>
                      <SelectItem value="50-200">50-200 employees</SelectItem>
                      <SelectItem value="200-500">200-500 employees</SelectItem>
                      <SelectItem value="500-1000">500-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-website">Website</Label>
                <Input
                  id="edit-website"
                  value={editEmployer.website}
                  onChange={(e) => setEditEmployer({ ...editEmployer, website: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editEmployer.status} onValueChange={(value: any) => setEditEmployer({ ...editEmployer, status: value })}>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpa_firm">CPA Firm</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiating">Negotiating</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Employer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Employer Details</DialogTitle>
          </DialogHeader>
          {selectedEmployer && (
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {selectedEmployer.companyName.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{selectedEmployer.companyName}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(selectedEmployer.status)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedEmployer.contactPerson}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedEmployer.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedEmployer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedEmployer.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedEmployer.website}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Company Information</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Industry:</span>
                      <span className="ml-2">{selectedEmployer.industry}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Company Size:</span>
                      <span className="ml-2">{selectedEmployer.size} employees</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Joined:</span>
                      <span className="ml-2">{new Date(selectedEmployer.joinedDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Active:</span>
                      <span className="ml-2">{selectedEmployer.lastActive}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Activity & Stats</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {getEmployerJobsFromDb(selectedEmployer.dbId).length || selectedEmployer.activeJobs}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Active Jobs</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{selectedEmployer.totalHires}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total Hires</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {getEmployerJobsFromDb(selectedEmployer.dbId).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Job Listings</h4>
                    <div className="space-y-2">
                      {getEmployerJobsFromDb(selectedEmployer.dbId).map(job => (
                        <div key={job.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                          <div>
                            <p className="font-medium">{job.title}</p>
                            <p className="text-xs text-muted-foreground">{job.category} · {job.location_city}, {job.location_state}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={job.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                              {job.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{job.applicant_count} applicants</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
