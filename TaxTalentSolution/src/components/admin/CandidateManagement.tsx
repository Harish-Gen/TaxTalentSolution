import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { loadScreening, saveScreening, DEFAULT_SCREENING } from "../../database/screeningStore";
import type { StoredScreening } from "../../database/screeningStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";

import { 
  Search, 
  Filter,
  Edit,
  CheckCircle,
  XCircle,
  Award,
  Eye,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Star,
  Calendar,
  Download,
  Send,
  Clock,
  DollarSign,
  TrendingUp,
  FileText,
  LinkedinIcon,
  Loader2
} from "lucide-react";
import { useCandidates } from "../../database";
import { loadProfile } from "../../database/profileStore";
import { candidateService } from "../../api/candidateService";
import { certificateService } from "../../api/certificateService";
import type { Certificate } from "../../database/types";
import { toast } from "sonner";
import { downloadStorageFile, isExternalFileUrl } from "../../api/fileService";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: number;
  status: "pending" | "approved" | "rejected";
  profileCompleteness: number;
  assessmentsTaken: number;
  rating: number;
  joinedDate: string;
  skills: string[];
}

// Detailed candidate data for profile view (similar to employer view)
const getCandidateDetails = (
  candidateId: string,
  listCandidates: Candidate[],
  dbCandidates: import("../../database/types").Candidate[],
  apiCertificates: Certificate[] = []
) => {
  const candidate = listCandidates.find(c => c.id === candidateId);
  if (!candidate) return null;

  // Find matching DB record to pull real fields
  const dbRecord = dbCandidates.find(c => c.id === candidateId);

  const hourlyRate = dbRecord?.hourly_rate ?? 0;
  const salaryMin = dbRecord?.expected_salary_min ?? 0;
  const salaryMax = dbRecord?.expected_salary_max ?? 0;
  const preferredRate = hourlyRate > 0
    ? `₹${hourlyRate.toLocaleString()}/hr`
    : salaryMin > 0
      ? `₹${(salaryMin / 100000).toFixed(1)}L – ₹${(salaryMax / 100000).toFixed(1)}L`
      : 'Not specified';

  const availabilityLabel: Record<string, string> = {
    immediate: 'Immediate',
    '2_weeks': '2 Weeks Notice',
    '1_month': '1 Month Notice',
    not_looking: 'Not Looking',
  };
  const workModeLabel: Record<string, string> = {
    remote: 'Remote',
    hybrid: 'Hybrid',
    onsite: 'On-site',
  };

  // ── Load candidate's saved profile from localStorage ───────────────────
  const storedProfile = dbRecord?.user_id ? loadProfile(dbRecord.user_id) : null;

  // ── Load candidate's competencies from localStorage ──────────────────────
  const competenciesRaw = dbRecord?.user_id
    ? (() => { try { const raw = localStorage.getItem(`tts_competencies_${dbRecord.user_id}`); return raw ? JSON.parse(raw) : null; } catch { return null; } })()
    : null;

  const taxSkills = (dbRecord as { tax_expertise?: string[] } | undefined)?.tax_expertise || candidate.skills;
  const skills_detailed = storedProfile?.skills?.length
    ? storedProfile.skills.map(s => ({ name: s, proficiency: "Competency", verified: true }))
    : taxSkills.length > 0
      ? taxSkills.map(s => ({ name: s, proficiency: "Intermediate", verified: false }))
      : [{ name: "No skills on record", proficiency: "N/A", verified: false }];

  // Experience: from profile
  const experience_details = storedProfile?.experience?.length
    ? storedProfile.experience.map(e => ({
        role: e.position,
        company: e.company,
        duration: e.duration,
        description: e.description,
        achievements: [] as string[],
      }))
    : [] as Array<{ role: string; company: string; duration: string; description: string; achievements: string[] }>;

  // Education: from profile
  const education = storedProfile?.education?.length
    ? storedProfile.education.map(e => ({
        degree: e.degree + (e.field ? ` — ${e.field}` : ''),
        institution: e.institution,
        year: e.duration || '',
      }))
    : [] as Array<{ degree: string; institution: string; year: string | number }>;

  const apiCertRows = apiCertificates.map((c) => ({
    name: c.title,
    issuer: 'TaxTalent',
    year: new Date(c.issue_date).getFullYear(),
    score: c.score ?? null,
  }));
  const profileCerts = storedProfile?.certifications?.length
    ? storedProfile.certifications.map(c => ({ name: c, issuer: '', year: null as number | null, score: null as number | null }))
    : [];
  const certifications = apiCertRows.length > 0 ? apiCertRows : profileCerts;

  return {
    ...candidate,
    // Prefer storedProfile for all fields the candidate can edit in their ProfilePage
    name: storedProfile?.name || candidate.name,
    email: storedProfile?.email || candidate.email,
    phone: storedProfile?.phone || candidate.phone,
    location: storedProfile?.location || candidate.location,
    title: storedProfile?.title || dbRecord?.headline || candidate.name,
    linkedin: dbRecord?.linkedin_url
      ? dbRecord.linkedin_url.replace(/^https?:\/\//, '')
      : '',
    profileViews: dbRecord?.profile_views ?? 0,
    availability: availabilityLabel[dbRecord?.availability ?? ''] || storedProfile?.availability || 'Immediate',
    hourlyRate,
    preferredRate,
    workMode: workModeLabel[dbRecord?.work_mode ?? ''] || 'Remote',
    timeZone: "—",
    summary: storedProfile?.summary || dbRecord?.summary || "No summary provided.",
    resumeUrl: dbRecord?.resume_url,

    skills_detailed,
    competencies: competenciesRaw,
    certifications,
    experience_details,
    education,

    assessmentsTaken: apiCertificates.length,
    languages: [] as string[],
    tools: [] as string[],
    interviewFeedback: {
      totalInterviews: 0,
      avgRating: 0,
      recommendations: { highly: 0, recommended: 0, maybe: 0, not: 0 },
    },
    screening: loadScreening(candidateId) || { ...DEFAULT_SCREENING },
  };
};

export function CandidateManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [detailCerts, setDetailCerts] = useState<Certificate[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!selectedCandidate) {
      setDetailCerts([]);
      return;
    }
    certificateService
      .getByCandidateId(selectedCandidate.id)
      .then(setDetailCerts)
      .catch(() => setDetailCerts([]));
  }, [selectedCandidate?.id]);

  // Local status overrides so UI reflects changes immediately after approve/reject
const [statusOverrides, setStatusOverrides] = useState<Record<string, "approved" | "rejected" | "pending">>({});

  // Screening edit state
  const [screeningEditMode, setScreeningEditMode] = useState(false);
  const [screeningDraft, setScreeningDraft] = useState<StoredScreening | null>(null);

  // Edit view state
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "", email: "", phone: "", location_city: "", location_state: "", location_country: "IN",
    experience_years: 0, headline: "", availability: "immediate", work_mode: "remote", hourly_rate: 0,
  });
  
  // Fetch from database
  const { candidates: dbCandidates, loading: candidatesLoading, refresh: refreshCandidates } = useCandidates();
  
  const loading = candidatesLoading;
  
  // Transform database candidates to component format
  const candidates: Candidate[] = useMemo(() => {
    return dbCandidates.map(candidate => {
      const candidateData = candidate as {
        name?: string;
        email?: string;
        phone?: string;
        tax_expertise?: string[];
      };
      const skills = candidateData.tax_expertise || [];

      return {
        id: candidate.id,
        name: candidateData.name || candidate.headline || 'Candidate',
        email: candidateData.email || '',
        phone: candidateData.phone || '',
        location: candidate.location_city ? `${candidate.location_city}, ${candidate.location_state || ''}` : "Remote",
        experience: candidate.experience_years || 0,
        status: (statusOverrides[candidate.id] ?? candidate.status ?? 'pending') as "pending" | "approved" | "rejected",
        profileCompleteness: candidate.profile_completeness || 0,
        assessmentsTaken: 0,
        rating: candidate.rating || 0,
        joinedDate: candidate.created_at?.split('T')[0] || '',
        skills: skills
      };
    });
  }, [dbCandidates, statusOverrides]);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = searchQuery === "" || 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || candidate.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApprove = async (candidateId: string) => {
    try {
      await candidateService.updateStatus(candidateId, 'approved');
      setStatusOverrides(prev => ({ ...prev, [candidateId]: 'approved' }));
      // Sync selectedCandidate status so detail view header badge updates
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(prev => prev ? { ...prev, status: 'approved' } : prev);
      }
      toast.success("Candidate profile approved successfully");
    } catch (error) {
      console.error('Failed to approve candidate:', error);
      toast.error("Failed to approve candidate profile");
    }
  };

  const handleReject = async (candidateId: string) => {
    try {
      await candidateService.updateStatus(candidateId, 'rejected');
      setStatusOverrides(prev => ({ ...prev, [candidateId]: 'rejected' }));
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(prev => prev ? { ...prev, status: 'rejected' } : prev);
      }
      toast.success("Candidate profile rejected");
    } catch (error) {
      console.error('Failed to reject candidate:', error);
      toast.error("Failed to reject candidate profile");
    }
  };

  const handleAssignAssessment = (candidateId: string) => {
    // TODO: wire to assessment assignment flow
    console.log("Assign assessment to candidate:", candidateId);
  };

  const openEdit = async (candidate: Candidate) => {
    try {
      const fresh = await candidateService.getCandidateById(candidate.id);
      setEditingCandidate(candidate);
      setEditForm({
        name: fresh.name || candidate.name || '',
        email: fresh.email || candidate.email,
        phone: fresh.phone || candidate.phone,
        location_city: fresh.location_city || '',
        location_state: fresh.location_state || '',
        location_country: fresh.location_country || 'IN',
        experience_years: fresh.experience_years || candidate.experience,
        headline: fresh.headline || '',
        availability: fresh.availability || 'immediate',
        work_mode: fresh.work_mode || 'remote',
        hourly_rate: fresh.hourly_rate || 0,
      });
    } catch (error) {
      console.error("Failed to fetch candidate data:", error);
      toast.error("Failed to load latest candidate data. Using local data.");
      
      const dbRecord = dbCandidates.find(c => c.id === candidate.id);
      setEditingCandidate(candidate);
      setEditForm({
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        location_city: dbRecord?.location_city || '',
        location_state: dbRecord?.location_state || '',
        experience_years: candidate.experience,
        headline: dbRecord?.headline || '',
        availability: dbRecord?.availability || 'immediate',
        work_mode: dbRecord?.work_mode || 'remote',
        hourly_rate: dbRecord?.hourly_rate || 0,
      });
    }
  };

  const handleEditSave = async () => {
    if (!editingCandidate) return;
    
    try {
      await candidateService.upsertCandidate({
        id: editingCandidate.id,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        location_city: editForm.location_city,
        location_state: editForm.location_state,
        location_country: editForm.location_country,
        experience_years: editForm.experience_years,
        headline: editForm.headline,
        availability: editForm.availability as any,
        work_mode: editForm.work_mode as any,
        hourly_rate: editForm.hourly_rate,
      });

      const freshList = await candidateService.getCandidates();
      await refreshCandidates();

      if (selectedCandidate?.id === editingCandidate.id) {
        const listFromFresh = freshList.map((c) => {
          const row = c as { name?: string; email?: string; phone?: string; tax_expertise?: string[] };
          return {
            id: c.id,
            name: row.name || c.headline || "Candidate",
            email: row.email || "",
            phone: row.phone || "",
            location: [c.location_city, c.location_state, c.location_country].filter(Boolean).join(", ") || "Remote",
            experience: c.experience_years || 0,
            status: c.status,
            skills: row.tax_expertise || [],
          } as Candidate;
        });
        const details = getCandidateDetails(
          editingCandidate.id,
          listFromFresh,
          freshList,
          detailCerts
        );
        if (details) setSelectedCandidate(details);
      }

      toast.success("Candidate information updated successfully");
      setEditingCandidate(null);
    } catch (error) {
      console.error('Failed to update candidate:', error);
      toast.error("Failed to update candidate information");
    }
  };

  const handleCreateSave = async () => {
    if (!editForm.name) {
      toast.error("Name is required");
      return;
    }
    
    try {
      await candidateService.upsertCandidate({
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        location_city: editForm.location_city,
        location_state: editForm.location_state,
        location_country: editForm.location_country,
        experience_years: editForm.experience_years,
        headline: editForm.headline,
        availability: editForm.availability as any,
        work_mode: editForm.work_mode as any,
        hourly_rate: editForm.hourly_rate,
        status: 'pending',
      });
      
      await refreshCandidates();
      toast.success("Candidate profile created successfully");
      setIsAddingCandidate(false);
      // Reset form
      setEditForm({
        name: "", email: "", phone: "", location_city: "", location_state: "", location_country: "IN",
        experience_years: 0, headline: "", availability: "immediate", work_mode: "remote", hourly_rate: 0,
      });
    } catch (error) {
      console.error('Failed to create candidate:', error);
      toast.error("Failed to create candidate profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading candidates...</span>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
        <span className="ml-2 text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (selectedCandidate && !getCandidateDetails(selectedCandidate.id, candidates, dbCandidates)) {
    // will fall through to list view naturally since candidateDetails will be null
  }

  const candidateDetails = selectedCandidate
    ? getCandidateDetails(selectedCandidate.id, candidates, dbCandidates, detailCerts)
    : null;

  // ── Create/Edit View Logic ──────────────────────────────────────────────
  if (editingCandidate || isAddingCandidate) {
    const isEditing = !!editingCandidate;
    const backLabel = isEditing ? (selectedCandidate ? "← Back to Profile" : "← Back to List") : "← Back to List";
    const handleBack = () => {
      setEditingCandidate(null);
      setIsAddingCandidate(false);
      if (!isEditing) {
        setEditForm({
          name: "", email: "", phone: "", location_city: "", location_state: "", location_country: "IN",
          experience_years: 0, headline: "", availability: "immediate", work_mode: "remote", hourly_rate: 0,
        });
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBack}>{backLabel}</Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleBack}>Cancel</Button>
            <Button onClick={isEditing ? handleEditSave : handleCreateSave}>
              {isEditing ? "Save Changes" : "Create Candidate"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? `Edit Candidate: ${editingCandidate.name}` : "Add New Candidate"}</CardTitle>
            {!isEditing && <CardDescription>Enter candidate details to create a new profile in the system.</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label>Full Name</Label>
                <Input className="mt-1" value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Email</Label>
                <Input className="mt-1" type="email" value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input className="mt-1" value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>

            <div>
              <Label>Headline / Title</Label>
              <Input className="mt-1" value={editForm.headline}
                onChange={e => setEditForm(f => ({ ...f, headline: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>City</Label>
                <Input className="mt-1" value={editForm.location_city}
                  onChange={e => setEditForm(f => ({ ...f, location_city: e.target.value }))} />
              </div>
              <div>
                <Label>State</Label>
                <Input className="mt-1" value={editForm.location_state}
                  onChange={e => setEditForm(f => ({ ...f, location_state: e.target.value }))} />
              </div>
              <div>
                <Label>Country</Label>
                <Input className="mt-1" value={editForm.location_country}
                  onChange={e => setEditForm(f => ({ ...f, location_country: e.target.value }))} placeholder="IN" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Experience (years)</Label>
                <Input className="mt-1" type="number" min={0} value={editForm.experience_years}
                  onChange={e => setEditForm(f => ({ ...f, experience_years: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Hourly Rate (₹)</Label>
                <Input className="mt-1" type="number" min={0} value={editForm.hourly_rate}
                  onChange={e => setEditForm(f => ({ ...f, hourly_rate: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Availability</Label>
                <Select value={editForm.availability} onValueChange={(v: string) => setEditForm(f => ({ ...f, availability: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="2_weeks">2 Weeks Notice</SelectItem>
                    <SelectItem value="1_month">1 Month Notice</SelectItem>
                    <SelectItem value="not_looking">Not Looking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Work Mode</Label>
                <Select value={editForm.work_mode} onValueChange={(v: string) => setEditForm(f => ({ ...f, work_mode: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleBack}>Cancel</Button>
              <Button onClick={isEditing ? handleEditSave : handleCreateSave}>
                {isEditing ? "Save Changes" : "Create Candidate"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedCandidate && candidateDetails) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedCandidate(null)}>
            ← Back to List
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={!candidateDetails.resumeUrl}
              onClick={async () => {
                const ref = candidateDetails.resumeUrl;
                if (!ref) {
                  toast.error("No resume on file for this candidate");
                  return;
                }
                try {
                  if (isExternalFileUrl(ref)) {
                    window.open(ref, "_blank", "noopener,noreferrer");
                  } else {
                    await downloadStorageFile(ref);
                  }
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Download failed");
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Resume
            </Button>
            {(candidateDetails.status === "pending" || candidateDetails.status === "rejected") && (
              <Button onClick={() => handleApprove(candidateDetails.id)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Profile
              </Button>
            )}
            {(candidateDetails.status === "pending" || candidateDetails.status === "approved") && (
              <Button variant="destructive" onClick={() => handleReject(candidateDetails.id)}>
                <XCircle className="w-4 h-4 mr-2" />
                Reject Profile
              </Button>
            )}
            <Button variant="outline" onClick={() => openEdit(selectedCandidate!)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl">
                  {candidateDetails.name.split(' ').map(n => n[0]).join('')}
                </div>
                
                {/* Basic Info */}
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl">{candidateDetails.name}</h2>
                    <Badge className={getStatusColor(candidateDetails.status)}>
                      {candidateDetails.status.charAt(0).toUpperCase() + candidateDetails.status.slice(1)}
                    </Badge>
                    {candidateDetails.status === "approved" && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-3">{candidateDetails.title}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{candidateDetails.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{candidateDetails.experience} years exp.</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{candidateDetails.availability}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{candidateDetails.preferredRate}/hr</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      {renderStars(candidateDetails.rating)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {candidateDetails.profileViews} profile views
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-right">
                <div className="flex items-center justify-end space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{candidateDetails.email}</span>
                </div>
                <div className="flex items-center justify-end space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{candidateDetails.phone}</span>
                </div>
                {candidateDetails.linkedin ? (
                  <div className="flex items-center justify-end space-x-2 text-sm">
                    <LinkedinIcon className="w-4 h-4 text-muted-foreground" />
                    <a href={`https://${candidateDetails.linkedin}`} className="text-primary hover:underline">
                      LinkedIn Profile
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full justify-start">
            <TabsTrigger value="overview" className="flex-1 text-sm">Overview</TabsTrigger>
            <TabsTrigger value="skills" className="flex-1 text-sm">Skills</TabsTrigger>
            <TabsTrigger value="experience" className="flex-1 text-sm">Exp & Education</TabsTrigger>
            <TabsTrigger value="certifications" className="flex-1 text-sm">Certs</TabsTrigger>
            <TabsTrigger value="screening" className="flex-1 text-sm">Screening</TabsTrigger>
            <TabsTrigger value="interviews" className="flex-1 text-sm">Interviews</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {candidateDetails.summary}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Work Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Work Mode:</span>
                    <span className="text-sm">{candidateDetails.workMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time Zone:</span>
                    <span className="text-sm">{candidateDetails.timeZone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Availability:</span>
                    <Badge variant="secondary">{candidateDetails.availability}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Expected Rate:</span>
                    <span className="text-sm">{candidateDetails.preferredRate}/hr</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {candidateDetails.languages.map((lang, i) => (
                        <Badge key={i} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Software Tools</p>
                    <div className="flex flex-wrap gap-2">
                      {candidateDetails.tools.map((tool, i) => (
                        <Badge key={i} variant="secondary">{tool}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Briefcase className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-2xl mb-1">{candidateDetails.experience}</div>
                      <p className="text-xs text-muted-foreground">Years Exp.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Award className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl mb-1">{candidateDetails.assessmentsTaken}</div>
                      <p className="text-xs text-muted-foreground">Assessments</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Star className="w-6 h-6 mx-auto mb-2 text-yellow-400 fill-yellow-400" />
                      <div className="text-2xl mb-1">{candidateDetails.rating || "N/A"}</div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="relative w-12 h-12 mx-auto mb-2">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 20}`}
                            strokeDashoffset={`${2 * Math.PI * 20 * (1 - candidateDetails.profileCompleteness / 100)}`}
                            className="text-primary"
                          />
                        </svg>
                      </div>
                      <div className="text-2xl mb-1">{candidateDetails.profileCompleteness}%</div>
                      <p className="text-xs text-muted-foreground">Complete</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills & Assessments Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Competencies / Skills</CardTitle>
                <CardDescription>Skills filled and completed by the candidate on their profile</CardDescription>
              </CardHeader>
              <CardContent>
                {candidateDetails.skills_detailed.length === 0 || candidateDetails.skills_detailed[0].name === "No skills on record" ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No skills have been added to this profile yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {candidateDetails.skills_detailed.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-muted/30">
                        {skill.verified && (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {candidateDetails.competencies && (() => {
              const comp = candidateDetails.competencies;
              const allSkillKeys = Object.keys(comp.skillRatings || {});
              const ratedSkills = allSkillKeys.filter(k => comp.skillRatings[k] && comp.skillRatings[k] !== 'not-applicable');
              const naSkills = allSkillKeys.filter(k => comp.skillRatings[k] === 'not-applicable');
              const levelColor: Record<string, string> = {
                basic: 'bg-yellow-100 text-yellow-800',
                intermediate: 'bg-blue-100 text-blue-800',
                expert: 'bg-green-100 text-green-800',
              };
              return (
                <>
                  {ratedSkills.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Skill Ratings</CardTitle>
                        <CardDescription>Self-assessed proficiency levels from the candidate's competencies profile</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-3">
                          {ratedSkills.map(skill => (
                            <div key={skill} className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-muted/30">
                              <span className="text-sm font-medium">{skill}</span>
                              <Badge className={levelColor[comp.skillRatings[skill]] || 'bg-gray-100 text-gray-800'}>
                                {comp.skillRatings[skill].charAt(0).toUpperCase() + comp.skillRatings[skill].slice(1)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        {naSkills.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-3">Not applicable: {naSkills.join(', ')}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {comp.roleEntries?.length > 0 && comp.roleEntries.some((e: any) => e.responsibility) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Role Distribution</CardTitle>
                        <CardDescription>How the candidate distributes their time across responsibilities</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {comp.roleEntries.filter((e: any) => e.responsibility).map((entry: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                              <span className="text-sm">{entry.responsibility}</span>
                              <span className="text-sm font-medium">{entry.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {comp.whyHireMe && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Why Hire Me</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{comp.whyHireMe}</p>
                      </CardContent>
                    </Card>
                  )}
                </>
              );
            })()}

            {!candidateDetails.competencies && (
              <Card>
                <CardHeader>
                  <CardTitle>Competency Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground py-4 text-center">No competencies data has been filled by this candidate yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Experience & Education Tab */}
          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
              </CardHeader>
              <CardContent>
                {candidateDetails.experience_details.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No work experience has been added to this profile yet.</p>
                ) : (
                  <div className="space-y-6">
                    {candidateDetails.experience_details.map((exp, index) => (
                      <div key={index} className="relative pl-8 pb-6 border-l-2 border-primary last:border-l-0">
                        <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 bg-primary rounded-full"></div>
                        <div>
                          <h4 className="mb-1">{exp.role}</h4>
                          <p className="text-sm text-muted-foreground mb-1">{exp.company}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                            <Calendar className="w-4 h-4" />
                            <span>{exp.duration}</span>
                          </div>
                          {exp.description && <p className="text-sm mb-3">{exp.description}</p>}
                          {exp.achievements.length > 0 && (
                            <div>
                              <p className="text-sm mb-2">Key Achievements:</p>
                              <ul className="space-y-1">
                                {exp.achievements.map((achievement, i) => (
                                  <li key={i} className="flex items-start space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-muted-foreground">{achievement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent>
                {candidateDetails.education.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No education has been added to this profile yet.</p>
                ) : (
                  <div className="space-y-3">
                    {candidateDetails.education.map((edu, index) => (
                      <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="text-sm mb-1">{edu.degree}</h4>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                        </div>
                        <Badge variant="outline">{edu.year}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Earned Certificates</CardTitle>
                <CardDescription>Certificates the candidate has earned on TaxTalent</CardDescription>
              </CardHeader>
              <CardContent>
                {candidateDetails.certifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No certificates have been earned yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {candidateDetails.certifications.map((cert, index) => (
                      <Card key={index} className="border-2">
                        <CardContent className="pt-6">
                          <div className="flex items-start space-x-3">
                            <Award className="w-8 h-8 text-primary flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="text-sm mb-1">{cert.name}</h4>
                              {cert.issuer && <p className="text-sm text-muted-foreground mb-2">{cert.issuer}</p>}
                              <div className="flex items-center gap-2 flex-wrap">
                                {cert.year && <Badge variant="outline">Year: {cert.year}</Badge>}
                                {cert.score && (
                                  <Badge className="bg-green-100 text-green-800">Score: {cert.score}%</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Screening Tab - Admin Use Only */}
          <TabsContent value="screening" className="space-y-6">
            {(() => {
              const screening = screeningEditMode && screeningDraft ? screeningDraft : candidateDetails.screening;

              const categories: { key: keyof Pick<StoredScreening, 'domainKnowledge'|'communicationSkills'|'interpersonalSkills'|'leadershipAbility'|'cultureFit'|'overallRating'>; label: string; highlight?: boolean }[] = [
                { key: 'domainKnowledge',    label: 'Domain Knowledge' },
                { key: 'communicationSkills',label: 'Communication Skills' },
                { key: 'interpersonalSkills',label: 'Interpersonal Skills' },
                { key: 'leadershipAbility',  label: 'Leadership Ability' },
                { key: 'cultureFit',         label: 'Culture Fit' },
                { key: 'overallRating',      label: 'Overall Rating', highlight: true },
              ];

              const handleEditStart = () => {
                setScreeningDraft(JSON.parse(JSON.stringify(candidateDetails.screening)));
                setScreeningEditMode(true);
              };

              const handleEditCancel = () => {
                setScreeningEditMode(false);
                setScreeningDraft(null);
              };

              const handleEditSaveScreening = () => {
                if (!screeningDraft || !selectedCandidate) return;
                const updated: StoredScreening = {
                  ...screeningDraft,
                  lastUpdated: new Date().toISOString().split('T')[0],
                };
                saveScreening(selectedCandidate.id, updated);
                setScreeningEditMode(false);
                setScreeningDraft(null);
                // Force re-render of candidateDetails by re-setting selectedCandidate
                setSelectedCandidate(prev => prev ? { ...prev } : prev);
              };

              const updateDraftRating = (cat: string, val: number) => {
                setScreeningDraft(prev => prev ? { ...prev, [cat]: { ...(prev as any)[cat], rating: val } } : prev);
              };

              const updateDraftComment = (cat: string, val: string) => {
                setScreeningDraft(prev => prev ? { ...prev, [cat]: { ...(prev as any)[cat], comments: val } } : prev);
              };

              return (
                <Card className="border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Admin Screening Assessment</CardTitle>
                        <CardDescription>
                          Internal evaluation visible to employers only — Last updated: {screening.lastUpdated}
                        </CardDescription>
                      </div>
                      {screeningEditMode ? (
                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={handleEditCancel}>Cancel</Button>
                          <Button onClick={handleEditSaveScreening}>Save Screening</Button>
                        </div>
                      ) : (
                        <Button variant="outline" onClick={handleEditStart}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Screening
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-6">
                      {categories.map(({ key, label, highlight }) => {
                        const cat = screening[key];
                        const draftCat = (screeningDraft as any)?.[key];
                        return (
                          <Card key={key} className={highlight ? 'border-2 border-primary bg-blue-50' : ''}>
                            <CardHeader>
                              <CardTitle className="text-base">{label}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                                    <div
                                      key={num}
                                      onClick={() => screeningEditMode && updateDraftRating(key, num)}
                                      className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                                        num <= (screeningEditMode ? (draftCat?.rating ?? 0) : cat.rating)
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-gray-200 text-gray-500'
                                      } ${screeningEditMode ? 'cursor-pointer hover:bg-primary/70 hover:text-primary-foreground' : ''}`}
                                    >
                                      {num}
                                    </div>
                                  ))}
                                </div>
                                {highlight ? (
                                  <Badge className="bg-green-600 text-white text-base px-4 py-2">
                                    {(screeningEditMode ? draftCat?.rating : cat.rating) ?? 0}/10
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-base px-3 py-1">
                                    {(screeningEditMode ? draftCat?.rating : cat.rating) ?? 0}/10
                                  </Badge>
                                )}
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground">Comments</Label>
                                {screeningEditMode ? (
                                  <Textarea
                                    className="mt-1 text-sm"
                                    rows={3}
                                    value={draftCat?.comments ?? ''}
                                    onChange={e => updateDraftComment(key, e.target.value)}
                                  />
                                ) : (
                                  <p className={`text-sm mt-1 p-3 rounded-md ${highlight ? 'bg-white' : 'bg-muted'}`}>
                                    {cat.comments || <span className="text-muted-foreground italic">No comments yet.</span>}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                      <span>Verified by: {screening.verifiedBy}</span>
                      <span>Last updated: {new Date(screening.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </TabsContent>

          {/* Interview Feedback Tab */}
          <TabsContent value="interviews" className="space-y-6">
            {candidateDetails.interviewFeedback.totalInterviews === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No interview records for this candidate yet.</p>
                </CardContent>
              </Card>
            ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl mb-1">{candidateDetails.interviewFeedback.totalInterviews}</div>
                  <p className="text-sm text-muted-foreground">Interviews</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-yellow-400 fill-yellow-400" />
                  <div className="text-2xl mb-1">{candidateDetails.interviewFeedback.avgRating}</div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl mb-1">{candidateDetails.interviewFeedback.recommendations.highly}</div>
                  <p className="text-sm text-muted-foreground">Highly Recommended</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl mb-1">{candidateDetails.interviewFeedback.recommendations.recommended}</div>
                  <p className="text-sm text-muted-foreground">Recommended</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Interview Performance</CardTitle>
                <CardDescription>
                  Full interview feedback and detailed notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Detailed interview feedback available for admins</p>
                  <p className="text-sm mt-2">Summary ratings and recommendations are displayed above</p>
                </div>
              </CardContent>
            </Card>
            </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl">Candidate Management</h3>
          <p className="text-sm text-muted-foreground">
            Review, approve, and manage candidate profiles
          </p>
        </div>
        <Button onClick={() => setIsAddingCandidate(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-2xl mt-1">{candidates.length}</p>
              </div>
              <Badge variant="outline">{candidates.length}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl mt-1 text-green-600">
                  {candidates.filter(c => c.status === "approved").length}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl mt-1 text-yellow-600">
                  {candidates.filter(c => c.status === "pending").length}
                </p>
              </div>
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl mt-1 text-red-600">
                  {candidates.filter(c => c.status === "rejected").length}
                </p>
              </div>
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label>Search Candidates</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Candidates</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidate List */}
      <Card>
        <CardHeader>
          <CardTitle>Candidates ({filteredCandidates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4>{candidate.name}</h4>
                        <Badge className={getStatusColor(candidate.status)}>
                          {candidate.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{candidate.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{candidate.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Briefcase className="w-4 h-4 text-muted-foreground" />
                          <span>{candidate.experience} years</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Award className="w-4 h-4 text-muted-foreground" />
                          <span>{candidate.assessmentsTaken} assessments</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        <div>
                          Profile: <span className="text-primary">{candidate.profileCompleteness}%</span>
                        </div>
                        {candidate.rating > 0 && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{candidate.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(candidate)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      {candidate.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleApprove(candidate.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleReject(candidate.id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
