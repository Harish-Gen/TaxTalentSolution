import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  downloadStorageFile,
  resolveStorageDownloadUrl,
  uploadFileToStorage,
} from "../../api/fileService";
import {
  StorageFileUpload,
  type StorageFileUploadHandle,
  type UploadedStorageFile,
} from "../ui/storage-file-upload";
import { toast } from "sonner";
import { 
  Edit, 
  Plus, 
  MapPin, 
  Calendar, 
  Globe, 
  Mail, 
  Phone,
  Building,
  GraduationCap,
  Award,
  ExternalLink,
  Clock,
  X,
  Loader2,
  Save,
  CheckCircle2,
  Link2,
  FileText,
} from "lucide-react";
import {
  loadProfile,
  saveProfile,
  loadProfileImage,
  saveProfileImage,
  createEmptyProfileFromUser,
  loadResume,
  saveResume,
  clearResume,
  type StoredProfile,
} from "../../database/profileStore";
import { LocalDatabase } from "../../database/localDb";
import { candidateService, matchCandidateByLinkedInUrl } from "../../api/candidateService";

function calculateProfileCompleteness(prof: StoredProfile): number {
  let score = 10; // base score
  if (prof.name) score += 10;
  if (prof.title) score += 15;
  if (prof.location) score += 10;
  if (prof.summary) score += 15;
  if (prof.skills && prof.skills.length > 0) score += 15;
  if (prof.experience && prof.experience.length > 0) score += 15;
  if (prof.education && prof.education.length > 0) score += 10;
  return Math.min(score, 100);
}



interface ProfilePageProps {
  user: any;
  /** Increment from parent to open the resume file picker (e.g. header Upload Resume). */
  resumeUploadTrigger?: number;
}

// Predefined US Taxation Skills List
const US_TAX_SKILLS = [
  // Tax Return Types
  "1040 Individual Returns",
  "1065 Partnership Returns",
  "1120 Corporate Returns",
  "1120S S Corporation Returns",
  "990 Non-Profit Returns",
  "1041 Estate & Trust Returns",
  "706 Estate Tax Returns",
  "709 Gift Tax Returns",
  "5472 Foreign Reporting",
  
  // State & Local Tax
  "Multi-State Tax Filing",
  "State Income Tax",
  "Sales & Use Tax",
  "Property Tax",
  
  // International Tax
  "International Tax Compliance",
  "FBAR Reporting",
  "FATCA Compliance",
  "Transfer Pricing",
  "Foreign Tax Credits",
  "Expatriate Tax",
  
  // Tax Planning & Strategy
  "Tax Planning",
  "Tax Research",
  "Tax Advisory",
  "Estimated Tax Calculations",
  "Quarterly Tax Preparation",
  "Year-End Tax Planning",
  
  // Software & Tools
  "Drake Software",
  "ProSeries",
  "Lacerte",
  "UltraTax CS",
  "CCH Axcess",
  "Thomson Reuters",
  "TaxAct",
  "TurboTax",
  "ProConnect Tax",
  "TaxSlayer Pro",
  "ATX Tax Software",
  "QuickBooks",
  "Xero",
  "Sage",
  "Excel Advanced",
  
  // Compliance & Regulations
  "IRS Regulations",
  "Tax Code Compliance",
  "Audit Support",
  "IRS Representation",
  "Tax Controversy",
  "Tax Resolution",
  "Offer in Compromise",
  "Installment Agreements",
  "Penalty Abatement",
  
  // Business Tax
  "Business Tax Consulting",
  "Payroll Tax",
  "Employment Tax",
  "Self-Employment Tax",
  "Franchise Tax",
  
  // Specialized Areas
  "Real Estate Taxation",
  "Depreciation & Amortization",
  "Capital Gains & Losses",
  "Passive Activity Loss",
  "Like-Kind Exchanges (1031)",
  "Cryptocurrency Taxation",
  "Stock Options & RSUs",
  "Alternative Minimum Tax (AMT)",
  "Net Investment Income Tax",
  
  // Bookkeeping & Accounting
  "Bookkeeping",
  "Financial Statement Preparation",
  "Account Reconciliation",
  "General Ledger",
  "Accounts Payable/Receivable",
];

export function ProfilePage({ user, resumeUploadTrigger = 0 }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showSkillDialog, setShowSkillDialog] = useState(false);
  const [customSkill, setCustomSkill] = useState("");
  const [selectedPredefinedSkills, setSelectedPredefinedSkills] = useState<string[]>([]);
  const [showExperienceDialog, setShowExperienceDialog] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null);
  const [experienceForm, setExperienceForm] = useState({
    company: "",
    position: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    isPresent: false,
    location: "",
    description: ""
  });
  const [showEducationDialog, setShowEducationDialog] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState<number | null>(null);
  const [educationForm, setEducationForm] = useState({
    institution: "",
    degree: "",
    field: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    description: ""
  });
  const [showCertificationDialog, setShowCertificationDialog] = useState(false);
  const [editingCertificationIndex, setEditingCertificationIndex] = useState<number | null>(null);
  const [certificationForm, setCertificationForm] = useState({
    name: "",
    issuingOrg: "",
    issueYear: "",
    expiryYear: "",
    credentialId: ""
  });

  // LinkedIn Connect
  const [showLinkedInDialog, setShowLinkedInDialog] = useState(false);
  const [linkedInInputUrl, setLinkedInInputUrl] = useState("");
  const [linkedInStatus, setLinkedInStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [linkedInMessage, setLinkedInMessage] = useState("");

  const userId = user?.id ?? "guest";
  const accountEmail = user?.email ?? "";
  const resumeUploadRef = useRef<StorageFileUploadHandle>(null);
  const resumeSectionRef = useRef<HTMLDivElement>(null);
  const skipAutoSaveRef = useRef(true);
  const [uploadedResume, setUploadedResume] = useState<UploadedStorageFile | null>(null);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      if (profileImageInputRef.current) profileImageInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      if (profileImageInputRef.current) profileImageInputRef.current.value = "";
      return;
    }

    setImageUploading(true);
    setImageUploadProgress(0);

    try {
      const stored = await uploadFileToStorage(
        file,
        `profiles/avatars/${userId}`,
        (percent) => setImageUploadProgress(percent)
      );
      setImageUploadProgress(100);
      const imageUrl = resolveStorageDownloadUrl(stored.name);
      setProfileImage(imageUrl);
      saveProfileImage(userId, imageUrl);
      toast.success("Profile photo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setImageUploading(false);
      setImageUploadProgress(0);
      if (profileImageInputRef.current) profileImageInputRef.current.value = "";
    }
  };

  const handleAddSkills = () => {
    const newSkills: string[] = [];
    
    // Add selected predefined skills
    selectedPredefinedSkills.forEach(skill => {
      if (!profile.skills.includes(skill)) {
        newSkills.push(skill);
      }
    });
    
    // Add custom skill if provided
    if (customSkill.trim() && !profile.skills.includes(customSkill.trim())) {
      newSkills.push(customSkill.trim());
    }
    
    if (newSkills.length > 0) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, ...newSkills]
      }));
    }
    
    // Reset and close
    setCustomSkill("");
    setSelectedPredefinedSkills([]);
    setShowSkillDialog(false);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const togglePredefinedSkill = (skill: string) => {
    setSelectedPredefinedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleAddExperience = () => {
    setEditingExperienceId(null);
    setExperienceForm({
      company: "",
      position: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      isPresent: false,
      location: "",
      description: ""
    });
    setShowExperienceDialog(true);
  };

  const handleEditExperience = (exp: any) => {
    setEditingExperienceId(exp.id);
    
    // Parse duration string (e.g., "Jan 2022 - Present" or "Jan 2022 - Dec 2023")
    const durationParts = exp.duration.split(' - ');
    const startParts = durationParts[0]?.split(' ') || [];
    const endParts = durationParts[1]?.split(' ') || [];
    const isPresent = durationParts[1]?.toLowerCase() === 'present';
    
    setExperienceForm({
      company: exp.company,
      position: exp.position,
      startMonth: startParts[0] || "",
      startYear: startParts[1] || "",
      endMonth: isPresent ? "" : endParts[0] || "",
      endYear: isPresent ? "" : endParts[1] || "",
      isPresent: isPresent,
      location: exp.location,
      description: exp.description
    });
    setShowExperienceDialog(true);
  };

  const handleSaveExperience = () => {
    if (!experienceForm.company || !experienceForm.position) {
      alert('Please fill in Company and Position fields');
      return;
    }

    if (!experienceForm.startMonth || !experienceForm.startYear) {
      alert('Please select start date');
      return;
    }

    if (!experienceForm.isPresent && (!experienceForm.endMonth || !experienceForm.endYear)) {
      alert('Please select end date or check "Present"');
      return;
    }

    // Format duration string
    const startDate = `${experienceForm.startMonth} ${experienceForm.startYear}`;
    const endDate = experienceForm.isPresent ? "Present" : `${experienceForm.endMonth} ${experienceForm.endYear}`;
    const duration = `${startDate} - ${endDate}`;

    const expData = {
      company: experienceForm.company,
      position: experienceForm.position,
      duration: duration,
      location: experienceForm.location,
      description: experienceForm.description
    };

    if (editingExperienceId) {
      // Update existing experience
      setProfile(prev => ({
        ...prev,
        experience: prev.experience.map(exp => 
          exp.id === editingExperienceId 
            ? { ...exp, ...expData }
            : exp
        )
      }));
    } else {
      // Add new experience
      const newExp = {
        id: profile.experience.length + 1,
        ...expData
      };
      setProfile(prev => ({
        ...prev,
        experience: [...prev.experience, newExp]
      }));
    }

    setShowExperienceDialog(false);
    setEditingExperienceId(null);
    setExperienceForm({
      company: "",
      position: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      isPresent: false,
      location: "",
      description: ""
    });
  };

  const handleDeleteExperience = (id: number) => {
    if (confirm('Are you sure you want to delete this experience?')) {
      setProfile(prev => ({
        ...prev,
        experience: prev.experience.filter(exp => exp.id !== id)
      }));
    }
  };

  const handleAddEducation = () => {
    setEditingEducationId(null);
    setEducationForm({
      institution: "",
      degree: "",
      field: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      description: ""
    });
    setShowEducationDialog(true);
  };

  const handleEditEducation = (edu: any) => {
    setEditingEducationId(edu.id);
    
    // Parse duration string (e.g., "2017 - 2019")
    const durationParts = edu.duration.split(' - ');
    const startYear = durationParts[0] || "";
    const endYear = durationParts[1] || "";
    
    setEducationForm({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startMonth: "",
      startYear: startYear,
      endMonth: "",
      endYear: endYear,
      description: edu.description
    });
    setShowEducationDialog(true);
  };

  const handleSaveEducation = () => {
    if (!educationForm.institution || !educationForm.degree || !educationForm.field) {
      alert('Please fill in Institution, Degree, and Field of Study');
      return;
    }

    if (!educationForm.startYear || !educationForm.endYear) {
      alert('Please select start and end years');
      return;
    }

    // Format duration string
    const duration = `${educationForm.startYear} - ${educationForm.endYear}`;

    const eduData = {
      institution: educationForm.institution,
      degree: educationForm.degree,
      field: educationForm.field,
      duration: duration,
      description: educationForm.description
    };

    if (editingEducationId) {
      // Update existing education
      setProfile(prev => ({
        ...prev,
        education: prev.education.map(edu => 
          edu.id === editingEducationId 
            ? { ...edu, ...eduData }
            : edu
        )
      }));
    } else {
      // Add new education
      const newEdu = {
        id: profile.education.length + 1,
        ...eduData
      };
      setProfile(prev => ({
        ...prev,
        education: [...prev.education, newEdu]
      }));
    }

    setShowEducationDialog(false);
    setEditingEducationId(null);
    setEducationForm({
      institution: "",
      degree: "",
      field: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      description: ""
    });
  };

  const handleDeleteEducation = (id: number) => {
    if (confirm('Are you sure you want to delete this education?')) {
      setProfile(prev => ({
        ...prev,
        education: prev.education.filter(edu => edu.id !== id)
      }));
    }
  };

  const handleAddCertification = () => {
    setEditingCertificationIndex(null);
    setCertificationForm({
      name: "",
      issuingOrg: "",
      issueYear: "",
      expiryYear: "",
      credentialId: ""
    });
    setShowCertificationDialog(true);
  };

  const handleEditCertification = (cert: string, index: number) => {
    setEditingCertificationIndex(index);
    // For simple string certs, just use the name
    setCertificationForm({
      name: cert,
      issuingOrg: "",
      issueYear: "",
      expiryYear: "",
      credentialId: ""
    });
    setShowCertificationDialog(true);
  };

  const handleSaveCertification = () => {
    if (!certificationForm.name) {
      alert('Please enter the certification name');
      return;
    }

    const certName = certificationForm.name;

    if (editingCertificationIndex !== null) {
      // Update existing certification
      setProfile(prev => ({
        ...prev,
        certifications: prev.certifications.map((cert, idx) => 
          idx === editingCertificationIndex ? certName : cert
        )
      }));
    } else {
      // Add new certification
      setProfile(prev => ({
        ...prev,
        certifications: [...prev.certifications, certName]
      }));
    }

    setShowCertificationDialog(false);
    setEditingCertificationIndex(null);
    setCertificationForm({
      name: "",
      issuingOrg: "",
      issueYear: "",
      expiryYear: "",
      credentialId: ""
    });
  };

  const handleDeleteCertification = (index: number) => {
    if (confirm('Are you sure you want to delete this certification?')) {
      setProfile(prev => ({
        ...prev,
        certifications: prev.certifications.filter((_, idx) => idx !== index)
      }));
    }
  };

  const emptyProfile = createEmptyProfileFromUser(user);

  const [profile, setProfile] = useState<StoredProfile>(() => {
    const saved = loadProfile(userId);
    if (saved) {
      return { ...emptyProfile, ...saved, email: accountEmail || saved.email };
    }
    return emptyProfile;
  });

  // Reload profile when the signed-in user changes
  useEffect(() => {
    const base = createEmptyProfileFromUser(user);
    const saved = loadProfile(userId);
    if (saved) {
      setProfile({ ...base, ...saved, email: accountEmail || saved.email });
    } else {
      setProfile(base);
    }
    const savedImg = loadProfileImage(userId);
    setProfileImage(savedImg);
    skipAutoSaveRef.current = true;
  }, [userId, user]);

  useEffect(() => {
    if (userId === "guest") {
      setUploadedResume(null);
      return;
    }
    setUploadedResume(loadResume(userId));
  }, [userId]);

  useEffect(() => {
    if (!resumeUploadTrigger) return;
    resumeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const timer = window.setTimeout(() => resumeUploadRef.current?.openFilePicker(), 400);
    return () => window.clearTimeout(timer);
  }, [resumeUploadTrigger]);

  const handleResumeChange = (file: UploadedStorageFile | null) => {
    setUploadedResume(file);
    if (userId === "guest") return;
    if (file) {
      saveResume(userId, file);
    } else {
      clearResume(userId);
    }
  };

  const handleDownloadResume = async () => {
    if (!uploadedResume) return;
    try {
      await downloadStorageFile(uploadedResume.blobName, uploadedResume.displayName);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not download resume");
    }
  };

  const persistProfile = useCallback(() => {
    if (userId === "guest") return;
    setSaveStatus("saving");
    const profileToSave = { ...profile, email: accountEmail || profile.email };
    saveProfile(userId, profileToSave);
    if (profileImage) saveProfileImage(userId, profileImage);

    // Sync to backend database
    candidateService.getCandidateByUserId(userId, { ensure: true })
      .then((dbCandidate) => {
        if (dbCandidate) {
          const parts = (profileToSave.location || "").split(",").map((s) => s.trim());
          const city = parts[0] || "";
          const state = parts[1] || "";
          const country = parts[2] || "IN";

          candidateService.upsertCandidate({
            id: dbCandidate.id,
            user_id: userId,
            name: profileToSave.name,
            phone: profileToSave.phone,
            location_city: city,
            location_state: state,
            location_country: country,
            linkedin_url: profileToSave.website,
            headline: profileToSave.title,
            summary: profileToSave.summary,
            taxexpertise: profileToSave.skills,
            certifications: profileToSave.certifications,
            profile_completeness: calculateProfileCompleteness(profileToSave),
          }).catch((err) => {
            console.error("Failed to save profile to database:", err);
          });
        }
      })
      .catch((err) => {
        console.error("Failed to retrieve database candidate for save:", err);
      });

    window.setTimeout(() => setSaveStatus("saved"), 400);
    window.setTimeout(() => setSaveStatus("idle"), 2500);
  }, [userId, profile, profileImage, accountEmail]);

  const handleSaveProfile = useCallback(() => {
    persistProfile();
  }, [persistProfile]);

  // Auto-save profile changes (skills, experience, availability, etc.)
  useEffect(() => {
    if (skipAutoSaveRef.current) {
      skipAutoSaveRef.current = false;
      return;
    }
    if (userId === "guest" || isEditing) return;

    const timer = window.setTimeout(() => {
      persistProfile();
    }, 400);

    return () => window.clearTimeout(timer);
  }, [profile, isEditing, userId, persistProfile]);

  const reloadProfileFromStorage = useCallback(() => {
    const base = createEmptyProfileFromUser(user);
    const saved = loadProfile(userId);
    if (saved) {
      setProfile({ ...base, ...saved, email: accountEmail || saved.email });
    } else {
      setProfile(base);
    }
    skipAutoSaveRef.current = true;
  }, [userId, user, accountEmail]);

  const handleConnectLinkedIn = () => {
    const url = linkedInInputUrl.trim();
    if (!url) {
      setLinkedInStatus('not-found');
      setLinkedInMessage('Please enter a LinkedIn profile URL.');
      return;
    }
    setLinkedInStatus('loading');
    setLinkedInMessage('');
    
    matchCandidateByLinkedInUrl(url)
      .then((linkedInMatch) => {
        if (linkedInMatch) {
          setProfile((prev) => ({
            ...prev,
            name: linkedInMatch.name || prev.name,
            title: linkedInMatch.title || prev.title,
            location: linkedInMatch.location || prev.location,
            summary: linkedInMatch.summary || prev.summary,
            website: linkedInMatch.website || url,
            experience: linkedInMatch.experience || prev.experience,
            education: linkedInMatch.education || prev.education,
            skills: linkedInMatch.skills || prev.skills,
            certifications: linkedInMatch.certifications || prev.certifications,
          }));
          setLinkedInStatus('found');
          setLinkedInMessage('LinkedIn profile successfully imported and synced!');
        } else {
          setProfile((prev) => ({ ...prev, website: url }));
          setLinkedInStatus('not-found');
          setLinkedInMessage('LinkedIn URL saved to your profile. Profile import from LinkedIn is not connected yet.');
        }
      })
      .catch((err) => {
        console.error("LinkedIn match failed:", err);
        setProfile((prev) => ({ ...prev, website: url }));
        setLinkedInStatus('not-found');
        setLinkedInMessage('LinkedIn URL saved to your profile. Profile import from LinkedIn is not connected yet.');
      });
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2 w-32">
              <div className="relative w-32">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-4xl">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <input
                  ref={profileImageInputRef}
                  type="file"
                  id="profile-image-upload"
                  accept="image/*"
                  className="hidden"
                  disabled={imageUploading}
                  onChange={handleImageUpload}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                  disabled={imageUploading}
                  onClick={() => profileImageInputRef.current?.click()}
                >
                  {imageUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Edit className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {imageUploading && (
                <div className="w-full space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Uploading photo</span>
                    <span>{imageUploadProgress > 0 ? `${imageUploadProgress}%` : "..."}</span>
                  </div>
                  <Progress value={imageUploadProgress} className="h-2 w-full" />
                </div>
              )}
            </div>

            {/* Availability + Preferred Location stacked */}
            <div className="flex-shrink-0 flex flex-col gap-4">
              {/* Availability Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="availability" className="text-sm font-medium text-muted-foreground">
                  My Availability
                </Label>
                <Select
                  value={profile.availability}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, availability: value }))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available Immediately">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-green-600" />
                        Available Immediately
                      </div>
                    </SelectItem>
                    <SelectItem value="Actively Looking">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-green-500" />
                        Actively Looking
                      </div>
                    </SelectItem>
                    <SelectItem value="Open to New Roles (Can Join in 30 Days)">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-blue-600" />
                        Open to New Roles (Can Join in 30 Days)
                      </div>
                    </SelectItem>
                    <SelectItem value="Available in 1–3 Months">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        Available in 1–3 Months
                      </div>
                    </SelectItem>
                    <SelectItem value="Exploring Opportunities">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                        Exploring Opportunities
                      </div>
                    </SelectItem>
                    <SelectItem value="Considering a Move Soon">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                        Considering a Move Soon
                      </div>
                    </SelectItem>
                    <SelectItem value="Not Actively Looking">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-orange-600" />
                        Not Actively Looking
                      </div>
                    </SelectItem>
                    <SelectItem value="Open for the Right Opportunity">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-orange-500" />
                        Open for the Right Opportunity
                      </div>
                    </SelectItem>
                    <SelectItem value="Happy in Current Role (Keep in Touch)">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        Happy in Current Role (Keep in Touch)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Location Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="preferredLocation" className="text-sm font-medium text-muted-foreground">
                  Preferred Location
                </Label>
                <Select
                  value={profile.preferredLocation}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, preferredLocation: value }))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bangalore">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        Bangalore
                      </div>
                    </SelectItem>
                    <SelectItem value="Ahmedabad">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        Ahmedabad
                      </div>
                    </SelectItem>
                    <SelectItem value="Mumbai">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        Mumbai
                      </div>
                    </SelectItem>
                    <SelectItem value="Hyderabad">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        Hyderabad
                      </div>
                    </SelectItem>
                    <SelectItem value="Gurugram">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        Gurugram
                      </div>
                    </SelectItem>
                    <SelectItem value="Pune">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        Pune
                      </div>
                    </SelectItem>
                    <SelectItem value="Chennai">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        Chennai
                      </div>
                    </SelectItem>
                    <SelectItem value="Others">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                        Others
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>{/* end availability+location column */}

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl mb-1">{profile.name}</h1>
                  <p className="text-lg text-muted-foreground mb-2">{profile.title}</p>
                  <div className="flex items-center text-muted-foreground text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profile.location}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <Button
                      variant={profile.website ? "secondary" : "outline"}
                      onClick={() => {
                        setLinkedInInputUrl(profile.website || "");
                        setLinkedInStatus("idle");
                        setLinkedInMessage("");
                        setShowLinkedInDialog(true);
                      }}
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      {profile.website ? "LinkedIn Connected" : "Connect LinkedIn"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saveStatus === "saving"}
                      variant={saveStatus === "saved" ? "secondary" : "outline"}
                    >
                      {saveStatus === "saving" ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving…
                        </>
                      ) : saveStatus === "saved" ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save now
                        </>
                      )}
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Changes save automatically
                  </span>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Professional Title</Label>
                    <Input
                      id="title"
                      value={profile.title}
                      onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      rows={4}
                      value={profile.summary}
                      onChange={(e) => setProfile(prev => ({ ...prev, summary: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={accountEmail || profile.email}
                        readOnly
                        disabled
                        className="bg-muted cursor-not-allowed"
                        aria-describedby="email-hint"
                      />
                      <p id="email-hint" className="text-xs text-muted-foreground mt-1">
                        Email is tied to your sign-in account and cannot be changed here.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website/LinkedIn</Label>
                      <Input
                        id="website"
                        value={profile.website}
                        onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => { handleSaveProfile(); setIsEditing(false); }}>
                      Done
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        reloadProfileFromStorage();
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">{profile.summary}</p>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                      {accountEmail || profile.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                      {profile.phone}
                    </div>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                      {profile.website ? (
                        <a 
                          href={profile.website.startsWith('http://') || profile.website.startsWith('https://') ? profile.website : `https://${profile.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline"
                        >
                          {profile.website}
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic">No website/LinkedIn linked</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Skills & Expertise
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowSkillDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1 flex items-center gap-2">
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-black hover:text-red-600 transition-colors"
                  title="Remove skill"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Work Experience
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAddExperience}>
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {profile.experience.map((exp, index) => (
              <div key={exp.id} className="relative">
                {index > 0 && <Separator className="mb-6" />}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{exp.position}</h3>
                    <p className="text-primary">{exp.company}</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {exp.duration}
                      <span className="mx-2">•</span>
                      <MapPin className="w-4 h-4 mr-1" />
                      {exp.location}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditExperience(exp)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteExperience(exp.id)} className="text-red-600 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground">{exp.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            Education
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAddEducation}>
            <Plus className="w-4 h-4 mr-2" />
            Add Education
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {profile.education.map((edu, index) => (
              <div key={edu.id} className="relative">
                {index > 0 && <Separator className="mb-6" />}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{edu.institution}</h3>
                    <p className="text-primary">{edu.degree} - {edu.field}</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {edu.duration}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditEducation(edu)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteEducation(edu.id)} className="text-red-600 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground">{edu.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Licenses & Certifications
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAddCertification}>
            <Plus className="w-4 h-4 mr-2" />
            Add Certification
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profile.certifications.map((cert, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{cert}</p>
                    <p className="text-sm text-muted-foreground">Valid through 2025</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditCertification(cert, index)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteCertification(index)} className="text-red-600 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resume — bottom of profile */}
      <Card id="profile-resume-section" ref={resumeSectionRef}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resume
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload your latest resume for job applications and employer review.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadedResume ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{uploadedResume.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {uploadedResume.size < 1024 * 1024
                        ? `${(uploadedResume.size / 1024).toFixed(1)} KB`
                        : `${(uploadedResume.size / (1024 * 1024)).toFixed(1)} MB`}
                      {" · "}
                      Saved to your profile
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button type="button" variant="outline" size="sm" onClick={handleDownloadResume}>
                    Download
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => resumeUploadRef.current?.openFilePicker()}
                    disabled={userId === "guest"}
                  >
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleResumeChange(null)}
                    disabled={userId === "guest"}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
          <div className={uploadedResume ? "hidden" : undefined}>
            <StorageFileUpload
              ref={resumeUploadRef}
              folder={`profiles/resumes/${userId}`}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              maxSizeMb={5}
              hint="PDF, DOC, or DOCX up to 5MB"
              value={uploadedResume}
              onChange={handleResumeChange}
              disabled={userId === "guest"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Skill Popup */}
      {showSkillDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSkillDialog(false)}
          />
          
          {/* Popup Content */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
            {/* Header */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Add Skills to Your Profile</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose from our curated list of US Taxation skills or add your own custom skills.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSkillDialog(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-4">
                {/* Custom Skill Input */}
                <div className="space-y-2">
                  <Label htmlFor="custom-skill" className="text-sm font-medium">
                    Add Custom Skill
                  </Label>
                  <Input
                    id="custom-skill"
                    placeholder="Type a custom skill and press Add..."
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Predefined Skills */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Select from US Taxation Skills
                  </Label>
                  <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {US_TAX_SKILLS.filter(skill => !profile.skills.includes(skill)).map((skill) => (
                        <div key={skill} className="flex items-start space-x-2">
                          <Checkbox
                            id={`skill-${skill}`}
                            checked={selectedPredefinedSkills.includes(skill)}
                            onCheckedChange={() => togglePredefinedSkill(skill)}
                          />
                          <label
                            htmlFor={`skill-${skill}`}
                            className="text-xs leading-tight cursor-pointer select-none"
                          >
                            {skill}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedPredefinedSkills.length} skill(s) selected
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSkillDialog(false);
                  setCustomSkill("");
                  setSelectedPredefinedSkills([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSkills}
                disabled={selectedPredefinedSkills.length === 0 && !customSkill.trim()}
              >
                Add {selectedPredefinedSkills.length + (customSkill.trim() ? 1 : 0)} Skill(s)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Experience Popup */}
      {showExperienceDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowExperienceDialog(false)}
          />
          
          {/* Popup Content */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
            {/* Header */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {editingExperienceId ? 'Edit Work Experience' : 'Add Work Experience'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details of your work experience
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExperienceDialog(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position/Job Title *</Label>
                    <Input
                      id="position"
                      placeholder="e.g., Senior Tax Associate"
                      value={experienceForm.position}
                      onChange={(e) => setExperienceForm(prev => ({ ...prev, position: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      placeholder="e.g., TaxPro Solutions"
                      value={experienceForm.company}
                      onChange={(e) => setExperienceForm(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={experienceForm.startMonth}
                        onValueChange={(value) => setExperienceForm(prev => ({ ...prev, startMonth: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={experienceForm.startYear}
                        onValueChange={(value) => setExperienceForm(prev => ({ ...prev, startYear: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>End Date</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="present"
                          checked={experienceForm.isPresent}
                          onCheckedChange={(checked) => 
                            setExperienceForm(prev => ({ 
                              ...prev, 
                              isPresent: checked as boolean,
                              endMonth: checked ? "" : prev.endMonth,
                              endYear: checked ? "" : prev.endYear
                            }))
                          }
                        />
                        <label htmlFor="present" className="text-sm cursor-pointer">
                          Present (Currently working here)
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={experienceForm.endMonth}
                        onValueChange={(value) => setExperienceForm(prev => ({ ...prev, endMonth: value }))}
                        disabled={experienceForm.isPresent}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={experienceForm.endYear}
                        onValueChange={(value) => setExperienceForm(prev => ({ ...prev, endYear: value }))}
                        disabled={experienceForm.isPresent}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exp-location">Location</Label>
                    <Input
                      id="exp-location"
                      placeholder="e.g., Mumbai, India"
                      value={experienceForm.location}
                      onChange={(e) => setExperienceForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    placeholder="Describe your role, responsibilities, and achievements..."
                    value={experienceForm.description}
                    onChange={(e) => setExperienceForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowExperienceDialog(false);
                  setEditingExperienceId(null);
                  setExperienceForm({
                    company: "",
                    position: "",
                    duration: "",
                    location: "",
                    description: ""
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveExperience}>
                {editingExperienceId ? 'Update Experience' : 'Add Experience'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Education Popup */}
      {showEducationDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowEducationDialog(false)}
          />
          
          {/* Popup Content */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
            {/* Header */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {editingEducationId ? 'Edit Education' : 'Add Education'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details of your educational background
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEducationDialog(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution/University *</Label>
                  <Input
                    id="institution"
                    placeholder="e.g., University of Mumbai"
                    value={educationForm.institution}
                    onChange={(e) => setEducationForm(prev => ({ ...prev, institution: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="degree">Degree *</Label>
                    <Input
                      id="degree"
                      placeholder="e.g., Master of Commerce"
                      value={educationForm.degree}
                      onChange={(e) => setEducationForm(prev => ({ ...prev, degree: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="field">Field of Study *</Label>
                    <Input
                      id="field"
                      placeholder="e.g., Taxation"
                      value={educationForm.field}
                      onChange={(e) => setEducationForm(prev => ({ ...prev, field: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Year *</Label>
                    <Select
                      value={educationForm.startYear}
                      onValueChange={(value) => setEducationForm(prev => ({ ...prev, startYear: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>End Year *</Label>
                    <Select
                      value={educationForm.endYear}
                      onValueChange={(value) => setEducationForm(prev => ({ ...prev, endYear: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edu-description">Description</Label>
                  <Textarea
                    id="edu-description"
                    rows={4}
                    placeholder="Describe your achievements, specialization, or notable coursework..."
                    value={educationForm.description}
                    onChange={(e) => setEducationForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEducationDialog(false);
                  setEditingEducationId(null);
                  setEducationForm({
                    institution: "",
                    degree: "",
                    field: "",
                    startMonth: "",
                    startYear: "",
                    endMonth: "",
                    endYear: "",
                    description: ""
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEducation}>
                {editingEducationId ? 'Update Education' : 'Add Education'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Certification Popup */}
      {showCertificationDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCertificationDialog(false)}
          />
          
          {/* Popup Content */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
            {/* Header */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {editingCertificationIndex !== null ? 'Edit Certification' : 'Add Certification'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your professional licenses and certifications
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCertificationDialog(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cert-name">Certification Name *</Label>
                  <Input
                    id="cert-name"
                    placeholder="e.g., IRS Annual Filing Season Program"
                    value={certificationForm.name}
                    onChange={(e) => setCertificationForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issuing-org">Issuing Organization</Label>
                  <Input
                    id="issuing-org"
                    placeholder="e.g., Internal Revenue Service (IRS)"
                    value={certificationForm.issuingOrg}
                    onChange={(e) => setCertificationForm(prev => ({ ...prev, issuingOrg: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Issue Year</Label>
                    <Select
                      value={certificationForm.issueYear}
                      onValueChange={(value) => setCertificationForm(prev => ({ ...prev, issueYear: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Year</Label>
                    <Select
                      value={certificationForm.expiryYear}
                      onValueChange={(value) => setCertificationForm(prev => ({ ...prev, expiryYear: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No expiration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Expiration</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credential-id">Credential ID (Optional)</Label>
                  <Input
                    id="credential-id"
                    placeholder="e.g., ABC123456"
                    value={certificationForm.credentialId}
                    onChange={(e) => setCertificationForm(prev => ({ ...prev, credentialId: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCertificationDialog(false);
                  setEditingCertificationIndex(null);
                  setCertificationForm({
                    name: "",
                    issuingOrg: "",
                    issueYear: "",
                    expiryYear: "",
                    credentialId: ""
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveCertification}>
                {editingCertificationIndex !== null ? 'Update Certification' : 'Add Certification'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Connect LinkedIn Dialog */}
      {showLinkedInDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => { setShowLinkedInDialog(false); setLinkedInStatus('idle'); setLinkedInMessage(''); }}
          />
          {/* Popup Content */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-blue-600" />
                    Connect LinkedIn Profile
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter your LinkedIn URL to load your profile details from our database.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => { setShowLinkedInDialog(false); setLinkedInStatus('idle'); setLinkedInMessage(''); }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
                <Input
                  id="linkedin-url"
                  placeholder="e.g. linkedin.com/in/yourname"
                  value={linkedInInputUrl}
                  onChange={(e) => { setLinkedInInputUrl(e.target.value); setLinkedInStatus('idle'); setLinkedInMessage(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleConnectLinkedIn(); }}
                  disabled={linkedInStatus === 'loading'}
                  autoFocus
                />
              </div>
              {linkedInStatus === 'found' && (
                <div className="flex items-start gap-2 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                  {linkedInMessage}
                </div>
              )}
              {linkedInStatus === 'not-found' && (
                <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                  {linkedInMessage}
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => { setShowLinkedInDialog(false); setLinkedInStatus('idle'); setLinkedInMessage(''); }}
              >
                {linkedInStatus === 'found' ? 'Done' : 'Cancel'}
              </Button>
              {linkedInStatus !== 'found' && (
                <Button onClick={handleConnectLinkedIn} disabled={linkedInStatus === 'loading'}>
                  {linkedInStatus === 'loading' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Searching…</>
                  ) : (
                    <><Link2 className="w-4 h-4 mr-2" />Connect</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}