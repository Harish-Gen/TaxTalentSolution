import { useState } from "react";
import { LocalDatabase } from "../../database/localDb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { 
  Search, 
  Edit,
  Trash2,
  Briefcase,
  Eye,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Building2,
  Users,
  TrendingUp,
  Award,
  FileText
} from "lucide-react";

interface Job {
  id: number;
  title: string;
  employer: string;
  location: string;
  jobType: "full-time" | "part-time" | "contract" | "temporary";
  experienceLevel: "entry" | "mid" | "senior" | "lead";
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  status: "active" | "closed" | "draft";
  applicants: number;
  views: number;
  postedDate: string;
  closingDate: string;
  category: string;
}

// Mock jobs data
const mockJobs: Job[] = [
  {
    id: 1,
    title: "Senior Tax Accountant - Form 1040",
    employer: "KPMG India",
    location: "Mumbai, Maharashtra",
    jobType: "full-time",
    experienceLevel: "senior",
    salaryMin: 800000,
    salaryMax: 1200000,
    description: "We are seeking an experienced Senior Tax Accountant with expertise in Form 1040 preparation and review.",
    requirements: ["5+ years of experience", "Form 1040 expertise", "CPA preferred", "Strong analytical skills"],
    responsibilities: ["Prepare and review Form 1040", "Client consultation", "Tax planning", "Team leadership"],
    benefits: ["Health insurance", "Performance bonus", "Work from home", "Professional development"],
    status: "active",
    applicants: 45,
    views: 320,
    postedDate: "2024-12-01",
    closingDate: "2025-02-28",
    category: "Individual Tax"
  },
  {
    id: 2,
    title: "Tax Manager - Partnership Returns",
    employer: "Deloitte India",
    location: "Bangalore, Karnataka",
    jobType: "full-time",
    experienceLevel: "lead",
    salaryMin: 1500000,
    salaryMax: 2000000,
    description: "Leading tax firm seeking a Tax Manager to oversee partnership tax return preparation and compliance.",
    requirements: ["8+ years experience", "Form 1065 expertise", "K-1 preparation", "Team management"],
    responsibilities: ["Manage tax team", "Partnership returns", "Client relationships", "Quality review"],
    benefits: ["Competitive salary", "Bonus structure", "Flexible hours", "Career growth"],
    status: "active",
    applicants: 28,
    views: 256,
    postedDate: "2024-12-10",
    closingDate: "2025-03-15",
    category: "Partnership Tax"
  },
  {
    id: 3,
    title: "Tax Associate - S Corporation",
    employer: "TaxWise Solutions",
    location: "New Delhi, Delhi",
    jobType: "full-time",
    experienceLevel: "mid",
    salaryMin: 500000,
    salaryMax: 700000,
    description: "Join our growing team as a Tax Associate specializing in S Corporation taxation.",
    requirements: ["3+ years experience", "Form 1120S knowledge", "Good communication", "Detail oriented"],
    responsibilities: ["Prepare S Corp returns", "Support senior team", "Research tax issues", "Client communication"],
    benefits: ["Training provided", "Health coverage", "Annual bonus", "Remote options"],
    status: "active",
    applicants: 67,
    views: 489,
    postedDate: "2024-11-25",
    closingDate: "2025-01-31",
    category: "Corporate Tax"
  },
  {
    id: 4,
    title: "Junior Tax Analyst",
    employer: "Grant Thornton India",
    location: "Gurgaon, Haryana",
    jobType: "full-time",
    experienceLevel: "entry",
    salaryMin: 350000,
    salaryMax: 500000,
    description: "Entry-level opportunity for fresh graduates or professionals with 1-2 years of tax experience.",
    requirements: ["0-2 years experience", "Accounting degree", "Basic tax knowledge", "MS Excel proficiency"],
    responsibilities: ["Assist in tax preparation", "Data entry", "Document organization", "Learning and development"],
    benefits: ["Training program", "Mentorship", "Health insurance", "Career path"],
    status: "active",
    applicants: 123,
    views: 678,
    postedDate: "2024-12-15",
    closingDate: "2025-02-15",
    category: "General Tax"
  },
  {
    id: 5,
    title: "Private Equity Tax Specialist",
    employer: "RSM India",
    location: "Mumbai, Maharashtra",
    jobType: "contract",
    experienceLevel: "senior",
    salaryMin: 1200000,
    salaryMax: 1800000,
    description: "Contract position for Private Equity tax specialist with complex deal structure experience.",
    requirements: ["7+ years PE experience", "Deal structuring", "K-1 allocations", "Big 4 experience"],
    responsibilities: ["PE tax compliance", "Deal support", "Client advisory", "Technical research"],
    benefits: ["High compensation", "Flexible schedule", "Remote work", "Extension opportunity"],
    status: "closed",
    applicants: 34,
    views: 234,
    postedDate: "2024-10-20",
    closingDate: "2024-12-31",
    category: "Private Equity"
  },
  {
    id: 6,
    title: "Tax Consultant - International",
    employer: "IndoTax Advisors",
    location: "Ahmedabad, Gujarat",
    jobType: "part-time",
    experienceLevel: "mid",
    salaryMin: 400000,
    salaryMax: 600000,
    description: "Part-time position for tax consultant with international taxation expertise.",
    requirements: ["4+ years experience", "International tax", "Transfer pricing", "English fluency"],
    responsibilities: ["International tax compliance", "Advisory services", "Client meetings", "Research"],
    benefits: ["Flexible hours", "Work from home", "Project-based", "Competitive rate"],
    status: "draft",
    applicants: 0,
    views: 12,
    postedDate: "2025-01-10",
    closingDate: "2025-03-31",
    category: "International Tax"
  }
];

const employers = [
  "KPMG India",
  "Deloitte India",
  "Grant Thornton India",
  "TaxWise Solutions",
  "IndoTax Advisors",
  "RSM India"
];

const categories = [
  "Individual Tax",
  "Corporate Tax",
  "Partnership Tax",
  "Private Equity",
  "International Tax",
  "General Tax"
];

export function JobManagement() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // New job form state
  const [newJob, setNewJob] = useState({
    title: "",
    employer: "",
    location: "",
    jobType: "full-time" as const,
    experienceLevel: "mid" as const,
    salaryMin: 0,
    salaryMax: 0,
    description: "",
    requirements: [""],
    responsibilities: [""],
    benefits: [""],
    category: "",
    closingDate: ""
  });

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.employer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    const matchesType = filterType === "all" || job.jobType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddJob = () => {
    const requirements = newJob.requirements.filter(r => r.trim() !== "");
    const responsibilities = newJob.responsibilities.filter(r => r.trim() !== "");
    const benefits = newJob.benefits.filter(b => b.trim() !== "");

    // Persist to shared database - find matching employer id
    const dbEmployers = LocalDatabase.getEmployers();
    const matchedEmployer = dbEmployers.find(e => e.company_name === newJob.employer);
    LocalDatabase.addJob({
      title: newJob.title,
      employerId: matchedEmployer?.id || `emp-unknown-${Date.now()}`,
      location: newJob.location,
      jobType: newJob.jobType,
      experienceLevel: newJob.experienceLevel,
      category: newJob.category,
      salaryMin: newJob.salaryMin,
      salaryMax: newJob.salaryMax,
      description: newJob.description,
      requirements,
      responsibilities,
      benefits,
      closingDate: newJob.closingDate,
    });

    const job: Job = {
      id: jobs.length + 1,
      ...newJob,
      requirements,
      responsibilities,
      benefits,
      status: "draft",
      applicants: 0,
      views: 0,
      postedDate: new Date().toISOString().split('T')[0]
    };
    setJobs([job, ...jobs]);
    setIsAddDialogOpen(false);
    resetNewJobForm();
  };

  const resetNewJobForm = () => {
    setNewJob({
      title: "",
      employer: "",
      location: "",
      jobType: "full-time",
      experienceLevel: "mid",
      salaryMin: 0,
      salaryMax: 0,
      description: "",
      requirements: [""],
      responsibilities: [""],
      benefits: [""],
      category: "",
      closingDate: ""
    });
  };

  const handleDeleteJob = (id: number) => {
    if (confirm("Are you sure you want to delete this job posting?")) {
      setJobs(jobs.filter(job => job.id !== id));
    }
  };

  const handleStatusChange = (id: number, newStatus: "active" | "closed" | "draft") => {
    setJobs(jobs.map(job => 
      job.id === id ? { ...job, status: newStatus } : job
    ));
  };

  const addArrayField = (field: 'requirements' | 'responsibilities' | 'benefits') => {
    setNewJob({
      ...newJob,
      [field]: [...newJob[field], ""]
    });
  };

  const updateArrayField = (field: 'requirements' | 'responsibilities' | 'benefits', index: number, value: string) => {
    const updated = [...newJob[field]];
    updated[index] = value;
    setNewJob({
      ...newJob,
      [field]: updated
    });
  };

  const removeArrayField = (field: 'requirements' | 'responsibilities' | 'benefits', index: number) => {
    setNewJob({
      ...newJob,
      [field]: newJob[field].filter((_, i) => i !== index)
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><XCircle className="w-3 h-3 mr-1" />Closed</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><FileText className="w-3 h-3 mr-1" />Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getJobTypeBadge = (type: string) => {
    const styles = {
      "full-time": "bg-blue-100 text-blue-800",
      "part-time": "bg-purple-100 text-purple-800",
      "contract": "bg-orange-100 text-orange-800",
      "temporary": "bg-pink-100 text-pink-800"
    };
    return <Badge className={`${styles[type as keyof typeof styles]} hover:${styles[type as keyof typeof styles]}`}>
      {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
    </Badge>;
  };

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === "active").length,
    totalApplicants: jobs.reduce((sum, job) => sum + job.applicants, 0),
    avgApplicants: Math.round(jobs.reduce((sum, job) => sum + job.applicants, 0) / jobs.length)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Job Management</h1>
        <p className="text-muted-foreground mt-1">Manage all job postings and opportunities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
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
                <p className="text-sm text-muted-foreground">Total Applicants</p>
                <p className="text-3xl font-bold mt-1 text-purple-600">{stats.totalApplicants}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg per Job</p>
                <p className="text-3xl font-bold mt-1 text-orange-600">{stats.avgApplicants}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Jobs</CardTitle>
              <CardDescription>View and manage job postings</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Job Posting</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create a new job posting
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      value={newJob.title}
                      onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                      placeholder="Senior Tax Accountant"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employer">Employer *</Label>
                      <Select value={newJob.employer} onValueChange={(value) => setNewJob({...newJob, employer: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employer" />
                        </SelectTrigger>
                        <SelectContent>
                          {employers.map(emp => (
                            <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={newJob.location}
                        onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                        placeholder="Mumbai, Maharashtra"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type *</Label>
                      <Select value={newJob.jobType} onValueChange={(value: any) => setNewJob({...newJob, jobType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full Time</SelectItem>
                          <SelectItem value="part-time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="temporary">Temporary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experienceLevel">Experience Level *</Label>
                      <Select value={newJob.experienceLevel} onValueChange={(value: any) => setNewJob({...newJob, experienceLevel: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                          <SelectItem value="lead">Lead/Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={newJob.category} onValueChange={(value) => setNewJob({...newJob, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salaryMin">Min Salary (₹) *</Label>
                      <Input
                        id="salaryMin"
                        type="number"
                        value={newJob.salaryMin}
                        onChange={(e) => setNewJob({...newJob, salaryMin: Number(e.target.value)})}
                        placeholder="500000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salaryMax">Max Salary (₹) *</Label>
                      <Input
                        id="salaryMax"
                        type="number"
                        value={newJob.salaryMax}
                        onChange={(e) => setNewJob({...newJob, salaryMax: Number(e.target.value)})}
                        placeholder="800000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="closingDate">Closing Date *</Label>
                      <Input
                        id="closingDate"
                        type="date"
                        value={newJob.closingDate}
                        onChange={(e) => setNewJob({...newJob, closingDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                      placeholder="Detailed job description..."
                      rows={4}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Requirements</Label>
                      <Button size="sm" variant="outline" onClick={() => addArrayField('requirements')}>
                        <Plus className="w-3 h-3 mr-1" />Add
                      </Button>
                    </div>
                    {newJob.requirements.map((req, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={req}
                          onChange={(e) => updateArrayField('requirements', index, e.target.value)}
                          placeholder="e.g., 5+ years of experience"
                        />
                        <Button size="sm" variant="ghost" onClick={() => removeArrayField('requirements', index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Responsibilities</Label>
                      <Button size="sm" variant="outline" onClick={() => addArrayField('responsibilities')}>
                        <Plus className="w-3 h-3 mr-1" />Add
                      </Button>
                    </div>
                    {newJob.responsibilities.map((resp, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={resp}
                          onChange={(e) => updateArrayField('responsibilities', index, e.target.value)}
                          placeholder="e.g., Prepare and review tax returns"
                        />
                        <Button size="sm" variant="ghost" onClick={() => removeArrayField('responsibilities', index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Benefits</Label>
                      <Button size="sm" variant="outline" onClick={() => addArrayField('benefits')}>
                        <Plus className="w-3 h-3 mr-1" />Add
                      </Button>
                    </div>
                    {newJob.benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={benefit}
                          onChange={(e) => updateArrayField('benefits', index, e.target.value)}
                          placeholder="e.g., Health insurance"
                        />
                        <Button size="sm" variant="ghost" onClick={() => removeArrayField('benefits', index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddJob}>Create Job</Button>
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
                placeholder="Search by title, employer, or location..."
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
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="temporary">Temporary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jobs List */}
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        {getStatusBadge(job.status)}
                        {getJobTypeBadge(job.jobType)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center space-x-1">
                          <Building2 className="w-4 h-4" />
                          <span>{job.employer}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>₹{(job.salaryMin/100000).toFixed(1)}L - ₹{(job.salaryMax/100000).toFixed(1)}L</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4" />
                          <span className="capitalize">{job.experienceLevel} level</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{job.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {job.applicants} applicants
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {job.views} views
                        </span>
                        <span>•</span>
                        <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Closes: {new Date(job.closingDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedJob(job);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Select
                        value={job.status}
                        onValueChange={(value: any) => handleStatusChange(job.id, value)}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No jobs found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Job Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(selectedJob.status)}
                    {getJobTypeBadge(selectedJob.jobType)}
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Building2 className="w-4 h-4 mr-1" />
                    {selectedJob.employer}
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedJob.location}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{selectedJob.experienceLevel} level</span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedJob.applicants}</p>
                      <p className="text-xs text-muted-foreground mt-1">Applicants</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{selectedJob.views}</p>
                      <p className="text-xs text-muted-foreground mt-1">Views</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">₹{(selectedJob.salaryMin/100000).toFixed(1)}L</p>
                      <p className="text-xs text-muted-foreground mt-1">Min Salary</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">₹{(selectedJob.salaryMax/100000).toFixed(1)}L</p>
                      <p className="text-xs text-muted-foreground mt-1">Max Salary</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{selectedJob.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Responsibilities</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {selectedJob.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.benefits.map((benefit, index) => (
                    <Badge key={index} variant="outline">{benefit}</Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Posted: {new Date(selectedJob.postedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Closes: {new Date(selectedJob.closingDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
