import { useState, useMemo } from "react";
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
  Building2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Globe,
  Briefcase,
  Edit,
  Trash2,
  Loader2,
  Handshake,
  AlertCircle
} from "lucide-react";
import { useEmployers } from "../../database/hooks";
import { employerService } from "../../api/employerService";
import { toast } from "sonner";
import type { Employer as DBEmployer } from "../../database/types";

// UI-friendly Employer interface
interface EmployerUI {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  location_city: string;
  location_state: string;
  location_country: string;
  industry: string;
  size: string;
  website: string;
  status: string;
  activeJobs: number;
  totalHires: number;
  joinedDate: string;
  lastActive: string;
  dbRecord: DBEmployer;
}

export function EmployerManagement() {
  const { employers: dbEmployers, loading, refresh } = useEmployers();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedEmployer, setSelectedEmployer] = useState<EmployerUI | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editEmployer, setEditEmployer] = useState<any | null>(null);
  const [employerToDelete, setEmployerToDelete] = useState<string | null>(null);

  // New employer form state
  const [newEmployer, setNewEmployer] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    location_city: "",
    location_state: "",
    location_country: "IN",
    industry: "",
    size: "",
    website: "",
    description: ""
  });

  const employers: EmployerUI[] = useMemo(() => {
    return dbEmployers
      .filter(emp => (emp as any).isactive !== false)
      .map(emp => ({
        id: emp.id,
        companyName: emp.company_name,
        contactPerson: (emp as any).contact_person || "N/A",
        email: (emp as any).email || "N/A",
        phone: (emp as any).phone || "N/A",
        location: emp.headquarters_city ? `${emp.headquarters_city}, ${emp.headquarters_state || ''}` : "N/A",
        location_city: emp.headquarters_city || "",
        location_state: emp.headquarters_state || "",
        location_country: emp.headquarters_country || "IN",
        industry: emp.industry || "N/A",
        size: emp.company_size || "N/A",
        website: emp.website || "N/A",
        status: emp.status,
        activeJobs: 0, // Would come from jobs table
        totalHires: emp.total_hires || 0,
        joinedDate: emp.created_at,
        lastActive: emp.last_active || "Unknown",
        dbRecord: emp
      }));
  }, [dbEmployers]);

  const filteredEmployers = employers.filter(employer => {
    const matchesSearch = employer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employer.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || employer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddEmployer = async () => {
    try {
      await employerService.upsertEmployer({
        company_name: newEmployer.companyName,
        contact_person: newEmployer.contactPerson,
        email: newEmployer.email,
        phone: newEmployer.phone,
        industry: newEmployer.industry,
        company_size: newEmployer.size,
        website: newEmployer.website,
        headquarters_city: newEmployer.location_city,
        headquarters_state: newEmployer.location_state,
        headquarters_country: newEmployer.location_country,
        description: newEmployer.description,
        status: "pending"
      });
      await refresh();
      toast.success("Employer added successfully");
      setIsAddDialogOpen(false);
      setNewEmployer({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        location_city: "",
        location_state: "",
        industry: "",
        size: "",
        website: "",
        description: ""
      });
    } catch (error) {
      console.error("Failed to add employer:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add employer");
    }
  };

  const handleSaveEdit = async () => {
    if (!editEmployer) return;
    try {
      await employerService.upsertEmployer({
        id: editEmployer.id,
        company_name: editEmployer.companyName,
        contact_person: editEmployer.contactPerson,
        email: editEmployer.email,
        phone: editEmployer.phone,
        headquarters_city: editEmployer.location_city,
        headquarters_state: editEmployer.location_state,
        headquarters_country: editEmployer.location_country,
        industry: editEmployer.industry,
        company_size: editEmployer.size,
        website: editEmployer.website,
        status: editEmployer.status as any
      });
      await refresh();
      toast.success("Employer updated successfully");
      setIsEditDialogOpen(false);
      setEditEmployer(null);
    } catch (error) {
      console.error("Failed to update employer:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update employer");
    }
  };

  const handleEditClick = async (employer: EmployerUI) => {
    try {
      const fresh = await employerService.getEmployerById(employer.id);
      setEditEmployer({ 
        ...employer,
        companyName: fresh.company_name,
        contactPerson: fresh.contact_person || "N/A",
        email: fresh.email || "N/A",
        phone: fresh.phone || "N/A",
        location_city: fresh.headquarters_city || "",
        location_state: fresh.headquarters_state || "",
        location_country: fresh.headquarters_country || "IN",
        industry: fresh.industry || "N/A",
        size: fresh.company_size || "N/A",
        website: fresh.website || "N/A",
        status: fresh.status as any,
        dbRecord: fresh
      });
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch employer data:", error);
      toast.error("Failed to load latest employer data");
    }
  };

  const handleDeleteEmployer = async (id: string) => {
    try {
      await employerService.deleteEmployer(id);
      await refresh();
      toast.success("Employer deleted successfully");
    } catch (error) {
      console.error("Failed to delete employer:", error);
      toast.error("Failed to delete employer");
    } finally {
      setEmployerToDelete(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: any) => {
    try {
      await employerService.upsertEmployer({ id, status: newStatus });
      await refresh();
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "cpa_firm":
      case "cpa firm":
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100"><Building2 className="w-3 h-3 mr-1" />CPA Firm</Badge>;
      case "lead":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Lead</Badge>;
      case "contacted":
        return <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">Contacted</Badge>;
      case "proposal":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Proposal</Badge>;
      case "negotiating":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Negotiating</Badge>;
      case "won":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Won</Badge>;
      case "declined":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{status}</Badge>;
    }
  };

  const stats = {
    total: employers.length,
    active: employers.filter(e => (e.status || "").toLowerCase() === "active").length,
    pending: employers.filter(e => (e.status || "").toLowerCase() === "pending").length,
    inactive: employers.filter(e => (e.status || "").toLowerCase() === "inactive").length,
    negotiating: employers.filter(e => (e.status || "").toLowerCase() === "negotiating").length,
    declined: employers.filter(e => (e.status || "").toLowerCase() === "declined").length
  };

  if (loading && employers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading employers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employer Management</h1>
          <p className="text-muted-foreground mt-1">Manage employer accounts and subscriptions (Connected to API)</p>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    value={newEmployer.industry}
                    onChange={(e) => setNewEmployer({...newEmployer, industry: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newEmployer.location_city}
                    onChange={(e) => setNewEmployer({...newEmployer, location_city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={newEmployer.location_state}
                    onChange={(e) => setNewEmployer({...newEmployer, location_state: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={newEmployer.location_country}
                    onChange={(e) => setNewEmployer({...newEmployer, location_country: e.target.value})}
                    placeholder="IN"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={newEmployer.contactPerson}
                    onChange={(e) => setNewEmployer({...newEmployer, contactPerson: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployer.email}
                    onChange={(e) => setNewEmployer({...newEmployer, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={newEmployer.phone}
                    onChange={(e) => setNewEmployer({...newEmployer, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={newEmployer.website}
                    onChange={(e) => setNewEmployer({...newEmployer, website: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={newEmployer.description}
                  onChange={(e) => setNewEmployer({...newEmployer, description: e.target.value})}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-3xl font-bold mt-1 text-gray-600">{stats.inactive}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Negotiating</p>
                <p className="text-3xl font-bold mt-1 text-amber-600">{stats.negotiating}</p>
              </div>
              <Handshake className="w-8 h-8 text-amber-600 opacity-50" />
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
              <AlertCircle className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>All Employers</CardTitle>
          <CardDescription>View and manage employer accounts from live database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by company or industry..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cpa_firm">CPA Firm</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                            <MapPin className="w-4 h-4" />
                            <span>{employer.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{employer.industry}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Globe className="w-4 h-4" />
                            <span>{employer.website}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{employer.size} emp.</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>Joined: {new Date(employer.joinedDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Total Hires: {employer.totalHires}</span>
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
                        onClick={() => handleEditClick(employer)}
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
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="cpa_firm">CPA Firm</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="negotiating">Negotiating</SelectItem>
                          <SelectItem value="won">Won</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEmployerToDelete(employer.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEmployers.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No employers found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Employer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Employer</DialogTitle>
          </DialogHeader>
          {editEmployer && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  value={editEmployer.companyName}
                  onChange={(e) => setEditEmployer({ ...editEmployer, companyName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={editEmployer.location_city}
                    onChange={(e) => setEditEmployer({ ...editEmployer, location_city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={editEmployer.location_state}
                    onChange={(e) => setEditEmployer({ ...editEmployer, location_state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={editEmployer.location_country}
                    onChange={(e) => setEditEmployer({ ...editEmployer, location_country: e.target.value })}
                    placeholder="IN"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input
                    value={editEmployer.contactPerson}
                    onChange={(e) => setEditEmployer({ ...editEmployer, contactPerson: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={editEmployer.email}
                    onChange={(e) => setEditEmployer({ ...editEmployer, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editEmployer.phone}
                    onChange={(e) => setEditEmployer({ ...editEmployer, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select value={editEmployer.size} onValueChange={(value) => setEditEmployer({ ...editEmployer, size: value })}>
                    <SelectTrigger>
                      <SelectValue />
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
                <Label>Website</Label>
                <Input
                  value={editEmployer.website}
                  onChange={(e) => setEditEmployer({ ...editEmployer, website: e.target.value })}
                />
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
                  <div className="mt-1">
                    {getStatusBadge(selectedEmployer.status)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <h3 className="font-semibold text-base">Company Details</h3>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedEmployer.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={selectedEmployer.website.startsWith('http') ? selectedEmployer.website : `https://${selectedEmployer.website}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {selectedEmployer.website}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedEmployer.industry}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedEmployer.size} employees</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-base">Stats & Activity</h3>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined Date:</span>
                    <span>{new Date(selectedEmployer.joinedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Hires:</span>
                    <span>{selectedEmployer.totalHires}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Active:</span>
                    <span>{new Date(selectedEmployer.lastActive).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {selectedEmployer.dbRecord.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedEmployer.dbRecord.description}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!employerToDelete} onOpenChange={(open) => !open && setEmployerToDelete(null)}>
        <DialogContent className="max-w-md sm:max-w-md">
          <DialogHeader className="sm:text-center flex flex-col items-center pt-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-center pt-2 text-base">
              Are you sure you want to delete this employer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-6 flex-row gap-3 justify-center w-full">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setEmployerToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" className="w-full sm:w-auto" onClick={() => employerToDelete && handleDeleteEmployer(employerToDelete)}>
              Delete Employer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
