import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useJobs, useEmployers } from "../../database/hooks";
import { jobService } from "../../api/jobService";
import { toast } from "sonner";
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
  id: string;
  title: string;
  employer_id: string;
  employerName: string;
  location: string;
  location_city?: string;
  location_state?: string;
  job_type: string;
  experience_level: string;
  salary_min: number;
  salary_max: number;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  status: string;
  applicant_count: number;
  view_count: number;
  posted_date: string;
  closing_date: string;
  category: string;
}

const categories = [
  "Individual Tax",
  "Corporate Tax",
  "Partnership Tax",
  "Private Equity",
  "International Tax",
  "General Tax"
];

const CustomJobModal = ({ isOpen, onClose, title, description, children, footer }: any) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-background rounded-lg border shadow-lg w-full max-w-4xl flex flex-col relative my-8" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity z-10">
          <XCircle className="w-5 h-5" />
        </button>
        <div className="p-6 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="p-6 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
          {children}
        </div>
        <div className="p-6 border-t flex-shrink-0 flex justify-end gap-2 bg-gray-50/50">
          {footer}
        </div>
      </div>
    </div>,
    document.body
  );
};

export function JobManagement() {
  const { jobs: dbJobs, loading, refresh } = useJobs();

  const { employers: dbEmployers } = useEmployers();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editJob, setEditJob] = useState<any | null>(null);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  // New job form state
  const [newJob, setNewJob] = useState({
    title: "",
    employer_id: "",
    location: "",
    job_type: "full-time" as any,
    experience_level: "mid" as any,
    salary_min: 0,
    salary_max: 0,
    description: "",
    requirements: [""],
    responsibilities: [""],
    benefits: [""],
    category: "",
    closing_date: ""
  });

  const jobs = useMemo(() => {
    return dbJobs.map(job => {
      const employer = dbEmployers.find(e => e.id === job.employer_id);
      return {
        ...job,
        employerName: employer?.company_name || "Unknown Employer"
      };
    });
  }, [dbJobs, dbEmployers]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.employerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location_state?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    const matchesType = filterType === "all" || job.job_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddJob = async () => {
    try {
      const requirements = newJob.requirements.filter(r => r.trim() !== "");
      const responsibilities = newJob.responsibilities.filter(r => r.trim() !== "");
      const benefits = newJob.benefits.filter(b => b.trim() !== "");

      await jobService.upsertJob({
        ...newJob,
        requirements,
        responsibilities,
        benefits,
        status: "active" as any
      });

      toast.success("Job posting created successfully");
      setIsAddDialogOpen(false);
      resetNewJobForm();
      refresh();
    } catch (error) {
      console.error("Failed to add job:", error);
      toast.error("Failed to create job posting");
    }
  };

  const handleSaveEdit = async () => {
    if (!editJob) return;
    try {
      const requirements = editJob.requirements.filter((r: string) => r.trim() !== "");
      const responsibilities = editJob.responsibilities.filter((r: string) => r.trim() !== "");
      const benefits = editJob.benefits.filter((b: string) => b.trim() !== "");

      await jobService.upsertJob({
        ...editJob,
        requirements,
        responsibilities,
        benefits
      });

      toast.success("Job posting updated successfully");
      setIsEditDialogOpen(false);
      refresh();
    } catch (error) {
      console.error("Failed to update job:", error);
      toast.error("Failed to update job posting");
    }
  };

  const handleEditClick = async (job: any) => {
    try {
      const fresh = await jobService.getJobById(job.id);
      setEditJob({ ...job, ...fresh });
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch job data:", error);
      toast.error("Failed to load latest job data");
    }
  };

  const resetNewJobForm = () => {
    setNewJob({
      title: "",
      employer_id: "",
      location: "",
      job_type: "full-time",
      experience_level: "mid",
      salary_min: 0,
      salary_max: 0,
      description: "",
      requirements: [""],
      responsibilities: [""],
      benefits: [""],
      category: "",
      closing_date: ""
    });
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await jobService.deleteJob(id);
      toast.success("Job posting deleted");
      refresh();
    } catch (error) {
      toast.error("Failed to delete job posting");
    } finally {
      setJobToDelete(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: any) => {
    try {
      await jobService.upsertJob({ id, status: newStatus });
      toast.success(`Job status updated to ${newStatus}`);
      refresh();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const addArrayField = (field: 'requirements' | 'responsibilities' | 'benefits', isEdit = false) => {
    if (isEdit) {
      setEditJob({
        ...editJob,
        [field]: [...editJob[field], ""]
      });
    } else {
      setNewJob({
        ...newJob,
        [field]: [...newJob[field], ""]
      });
    }
  };

  const updateArrayField = (field: 'requirements' | 'responsibilities' | 'benefits', index: number, value: string, isEdit = false) => {
    if (isEdit) {
      const updated = [...editJob[field]];
      updated[index] = value;
      setEditJob({
        ...editJob,
        [field]: updated
      });
    } else {
      const updated = [...newJob[field]];
      updated[index] = value;
      setNewJob({
        ...newJob,
        [field]: updated
      });
    }
  };

  const removeArrayField = (field: 'requirements' | 'responsibilities' | 'benefits', index: number, isEdit = false) => {
    if (isEdit) {
      setEditJob({
        ...editJob,
        [field]: editJob[field].filter((_: any, i: number) => i !== index)
      });
    } else {
      setNewJob({
        ...newJob,
        [field]: newJob[field].filter((_: any, i: number) => i !== index)
      });
    }
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
      {type?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
    </Badge>;
  };

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === "active").length,
    totalApplicants: jobs.reduce((sum, job) => sum + (job.applicant_count || 0), 0),
    avgApplicants: Math.round(jobs.reduce((sum, job) => sum + (job.applicant_count || 0), 0) / (jobs.length || 1))
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
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Job
            </Button>
            <CustomJobModal
              isOpen={isAddDialogOpen}
              onClose={() => setIsAddDialogOpen(false)}
              title="Create New Job Posting"
              description="Fill in the details below to create a new job posting"
              footer={
                <>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddJob}>Create Job Posting</Button>
                </>
              }
            >
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employer">Employer *</Label>
                    <Select value={newJob.employer_id} onValueChange={(value) => setNewJob({ ...newJob, employer_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employer" />
                      </SelectTrigger>
                      <SelectContent>
                        {dbEmployers.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.company_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type *</Label>
                    <Select value={newJob.job_type} onValueChange={(value: any) => setNewJob({ ...newJob, job_type: value })}>
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
                    <Select value={newJob.experience_level} onValueChange={(value: any) => setNewJob({ ...newJob, experience_level: value })}>
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
                    <Select value={newJob.category} onValueChange={(value) => setNewJob({ ...newJob, category: value })}>
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
                      value={newJob.salary_min}
                      onChange={(e) => setNewJob({ ...newJob, salary_min: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Max Salary (₹) *</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={newJob.salary_max}
                      onChange={(e) => setNewJob({ ...newJob, salary_max: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closingDate">Closing Date *</Label>
                    <Input
                      id="closingDate"
                      type="date"
                      value={newJob.closing_date}
                      onChange={(e) => setNewJob({ ...newJob, closing_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
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
                      />
                      <Button size="sm" variant="ghost" onClick={() => removeArrayField('benefits', index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CustomJobModal>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, employers, or locations..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Job Type" />
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

          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold text-lg">No jobs found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden hover:border-blue-200 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          {getStatusBadge(job.status)}
                          {getJobTypeBadge(job.job_type)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center space-x-1">
                            <Building2 className="w-4 h-4" />
                            <span>{job.employerName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>₹{(job.salary_min / 100000).toFixed(1)}L - ₹{(job.salary_max / 100000).toFixed(1)}L</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Award className="w-4 h-4" />
                            <span className="capitalize">{job.experience_level} level</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {job.applicant_count || 0} applicants
                          </span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {job.view_count || 0} views
                          </span>
                          <span>•</span>
                          <span>Posted: {new Date(job.posted_date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Closes: {job.closing_date ? new Date(job.closing_date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedJob(job);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(job)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {job.status === "active" ? (
                          <Button variant="ghost" size="icon" className="text-orange-600" onClick={() => handleStatusChange(job.id, "closed")}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="text-green-600" onClick={() => handleStatusChange(job.id, "active")}>
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setJobToDelete(job.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Job Dialog */}
      <CustomJobModal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Edit Job Posting"
        description="Update the job details below"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </>
        }
      >
        {editJob && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="editJobTitle">Job Title *</Label>
              <Input
                id="editJobTitle"
                value={editJob.title}
                onChange={(e) => setEditJob({ ...editJob, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editEmployer">Employer *</Label>
                <Select value={editJob.employer_id} onValueChange={(value) => setEditJob({ ...editJob, employer_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employer" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbEmployers.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.company_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLocation">Location *</Label>
                <Input
                  id="editLocation"
                  value={editJob.location}
                  onChange={(e) => setEditJob({ ...editJob, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editJobType">Job Type *</Label>
                <Select value={editJob.job_type} onValueChange={(value: any) => setEditJob({ ...editJob, job_type: value })}>
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
                <Label htmlFor="editExperienceLevel">Experience Level *</Label>
                <Select value={editJob.experience_level} onValueChange={(value: any) => setEditJob({ ...editJob, experience_level: value })}>
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
                <Label htmlFor="editCategory">Category *</Label>
                <Select value={editJob.category} onValueChange={(value) => setEditJob({ ...editJob, category: value })}>
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
                <Label htmlFor="editSalaryMin">Min Salary (₹) *</Label>
                <Input
                  id="editSalaryMin"
                  type="number"
                  value={editJob.salary_min}
                  onChange={(e) => setEditJob({ ...editJob, salary_min: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSalaryMax">Max Salary (₹) *</Label>
                <Input
                  id="editSalaryMax"
                  type="number"
                  value={editJob.salary_max}
                  onChange={(e) => setEditJob({ ...editJob, salary_max: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClosingDate">Closing Date *</Label>
                <Input
                  id="editClosingDate"
                  type="date"
                  value={editJob.closing_date}
                  onChange={(e) => setEditJob({ ...editJob, closing_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDescription">Job Description *</Label>
              <Textarea
                id="editDescription"
                value={editJob.description}
                onChange={(e) => setEditJob({ ...editJob, description: e.target.value })}
                rows={4}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Requirements</Label>
                <Button size="sm" variant="outline" onClick={() => addArrayField('requirements', true)}>
                  <Plus className="w-3 h-3 mr-1" />Add
                </Button>
              </div>
              {editJob.requirements.map((req: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={req}
                    onChange={(e) => updateArrayField('requirements', index, e.target.value, true)}
                  />
                  <Button size="sm" variant="ghost" onClick={() => removeArrayField('requirements', index, true)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Responsibilities</Label>
                <Button size="sm" variant="outline" onClick={() => addArrayField('responsibilities', true)}>
                  <Plus className="w-3 h-3 mr-1" />Add
                </Button>
              </div>
              {editJob.responsibilities.map((resp: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={resp}
                    onChange={(e) => updateArrayField('responsibilities', index, e.target.value, true)}
                  />
                  <Button size="sm" variant="ghost" onClick={() => removeArrayField('responsibilities', index, true)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Benefits</Label>
                <Button size="sm" variant="outline" onClick={() => addArrayField('benefits', true)}>
                  <Plus className="w-3 h-3 mr-1" />Add
                </Button>
              </div>
              {editJob.benefits.map((benefit: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={benefit}
                    onChange={(e) => updateArrayField('benefits', index, e.target.value, true)}
                  />
                  <Button size="sm" variant="ghost" onClick={() => removeArrayField('benefits', index, true)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CustomJobModal>

      {/* View Job Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedJob && (
            <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
              <DialogHeader>
                <div className="flex items-center justify-between pr-8">
                  <DialogTitle className="text-2xl">{selectedJob.title}</DialogTitle>
                  {getStatusBadge(selectedJob.status)}
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center text-muted-foreground">
                    <Building2 className="w-4 h-4 mr-1" />
                    <span>{selectedJob.employerName}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{selectedJob.location}</span>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedJob.applicant_count || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Applicants</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{selectedJob.view_count || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Views</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">₹{(selectedJob.salary_min / 100000).toFixed(1)}L</p>
                      <p className="text-xs text-muted-foreground mt-1">Min Salary</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">₹{(selectedJob.salary_max / 100000).toFixed(1)}L</p>
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
                    {selectedJob.requirements.map((req: string, index: number) => (
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
                    {selectedJob.responsibilities.map((resp: string, index: number) => (
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
                  {selectedJob.benefits.map((benefit: string, index: number) => (
                    <Badge key={index} variant="outline">{benefit}</Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Posted: {new Date(selectedJob.posted_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Closes: {selectedJob.closing_date ? new Date(selectedJob.closing_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <DialogContent className="max-w-md sm:max-w-md">
          <DialogHeader className="sm:text-center flex flex-col items-center pt-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-center pt-2 text-base">
              Are you sure you want to delete this job posting? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-6 flex-row gap-3 justify-center w-full">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setJobToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" className="w-full sm:w-auto" onClick={() => jobToDelete && handleDeleteJob(jobToDelete)}>
              Delete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
