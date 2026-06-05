import { useEffect, useRef, useState } from "react";
import { jobApplicationService } from "../../api/jobApplicationService";
import { candidateService } from "../../api/candidateService";
import { isUuid } from "../../api/userAssessmentService";
import { resolveStorageDownloadUrl } from "../../api/fileService";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ArrowLeft, ExternalLink, Send, CheckCircle, Upload, IndianRupee, User, Briefcase, Percent, Plus, Trash2, Download } from "lucide-react";
import { toast } from "sonner@2.0.3";
import {
  StorageFileUpload,
  type UploadedStorageFile,
} from "../ui/storage-file-upload";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { loadJobApplicationPrefill } from "../../utils/jobApplicationPrefill";

type JsPdfWithAutoTable = jsPDF & { lastAutoTable?: { finalY: number } };

interface JobApplicationProps {
  jobTitle: string;
  companyName: string;
  jobPostingId?: string;
  employerId?: string;
  user?: {
    id?: string;
    email?: string;
    phone?: string;
    user_metadata?: { name?: string; phone?: string };
  };
  onBack: () => void;
  isCompetencyMode?: boolean;
}

type SkillLevel = "basic" | "intermediate" | "expert" | "not-applicable" | "";

interface SkillRatings {
  [key: string]: SkillLevel;
}

interface RoleEntry {
  id: string;
  responsibility: string;
  percentage: string;
}

export function JobApplication({
  jobTitle,
  companyName,
  jobPostingId,
  employerId,
  user,
  onBack,
  isCompetencyMode = false,
}: JobApplicationProps) {
  const [linkedinProfile, setLinkedinProfile] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [skillRatings, setSkillRatings] = useState<SkillRatings>({});
  const [whyHireMe, setWhyHireMe] = useState("");
  const [roleEntries, setRoleEntries] = useState<RoleEntry[]>([
    { id: `role-${Date.now()}`, responsibility: "", percentage: "" }
  ]);
  const [currentCompensation, setCurrentCompensation] = useState("");
  const [compensationRevisedDate, setCompensationRevisedDate] = useState("");
  const [expectedCompensation, setExpectedCompensation] = useState("");
  const [uploadedResume, setUploadedResume] = useState<UploadedStorageFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingPrefill, setIsLoadingPrefill] = useState(true);
  const prefillAppliedRef = useRef(false);

  const userId = user?.id ?? "guest";

  useEffect(() => {
    if (prefillAppliedRef.current) return;

    let cancelled = false;
    const applyPrefill = async () => {
      setIsLoadingPrefill(true);
      try {
        const prefill = await loadJobApplicationPrefill(userId, user);
        if (cancelled) return;

        setLinkedinProfile(prefill.linkedinProfile);
        setEmail(prefill.email);
        setPhone(prefill.phone);
        setSkillRatings(prefill.skillRatings);
        setWhyHireMe(prefill.whyHireMe);
        setRoleEntries(prefill.roleEntries);
        setCurrentCompensation(prefill.currentCompensation);
        setExpectedCompensation(prefill.expectedCompensation);
        setCompensationRevisedDate(prefill.compensationRevisedDate);
        setUploadedResume(prefill.resume);

        prefillAppliedRef.current = true;

        const hasProfileData =
          Boolean(prefill.email || prefill.phone || prefill.linkedinProfile) ||
          Object.keys(prefill.skillRatings).length > 0 ||
          Boolean(prefill.whyHireMe) ||
          prefill.roleEntries.some((e) => e.responsibility && e.percentage);

        if (hasProfileData) {
          toast.success("Application pre-filled from your profile");
        }
      } catch (err) {
        console.error("Failed to load application prefill:", err);
      } finally {
        if (!cancelled) setIsLoadingPrefill(false);
      }
    };

    applyPrefill();
    return () => {
      cancelled = true;
    };
  }, [userId, user]);

  const skills = [
    "1040HNI",
    "1040GMS", 
    "1040 COE",
    "1120 Federal",
    "1120 State",
    "1065 Federal",
    "1065 State",
    "1120S",
    "1065 Operating Partnership",
    "990"
  ];

  const responsibilities = [
    "Preparation",
    "First Level Review",
    "Second Level Review",
    "Managing Teams",
    "Client Management",
    "Strategy Meetings",
    "Other"
  ];

  const skillLevels = [
    { value: "basic", label: "Basic" },
    { value: "intermediate", label: "Intermediate" },
    { value: "expert", label: "Expert" },
    { value: "not-applicable", label: "Not Applicable" }
  ];

  const handleSkillRating = (skill: string, level: SkillLevel) => {
    setSkillRatings(prev => ({
      ...prev,
      [skill]: level
    }));
  };

  const addRoleEntry = () => {
    const newEntry: RoleEntry = {
      id: `role-${Date.now()}`,
      responsibility: "",
      percentage: ""
    };
    setRoleEntries(prev => [...prev, newEntry]);
  };

  const removeRoleEntry = (id: string) => {
    // Don't allow removing if it's the last entry
    if (roleEntries.length === 1) {
      toast.error("At least one responsibility entry is required");
      return;
    }
    setRoleEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const updateRoleEntry = (id: string, field: 'responsibility' | 'percentage', value: string) => {
    setRoleEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        if (field === 'percentage') {
          // Allow only numbers 0-100
          const numValue = value.replace(/\D/g, '');
          if (numValue === '' || (parseInt(numValue) >= 0 && parseInt(numValue) <= 100)) {
            return { ...entry, [field]: numValue };
          }
          return entry;
        }
        return { ...entry, [field]: value };
      }
      return entry;
    }));
  };

  const calculateTotalPercentage = () => {
    return roleEntries.reduce((sum, entry) => {
      return sum + (parseInt(entry.percentage) || 0);
    }, 0);
  };

  const getAvailableResponsibilities = (currentId: string) => {
    const selectedResponsibilities = roleEntries
      .filter(entry => entry.id !== currentId && entry.responsibility)
      .map(entry => entry.responsibility);
    return responsibilities.filter(r => !selectedResponsibilities.includes(r));
  };

  const generatePDF = (applicationData: any) => {
    const doc = new jsPDF() as JsPdfWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add text with word wrapping
    const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4);
    };

    // Header
    doc.setFillColor(3, 2, 19); // Primary color
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Job Application Summary', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`${applicationData.jobTitle} at ${applicationData.companyName}`, pageWidth / 2, 25, { align: 'center' });

    yPosition = 45;
    doc.setTextColor(0, 0, 0);

    // General Info Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('General Information', 15, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Email: ${applicationData.email}`, 15, yPosition);
    yPosition += 6;
    doc.text(`Phone: ${applicationData.phone}`, 15, yPosition);
    yPosition += 6;
    doc.text(`LinkedIn: ${applicationData.linkedinProfile}`, 15, yPosition);
    yPosition += 10;

    // Skill Ratings Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Skill Ratings', 15, yPosition);
    yPosition += 8;

    const skillData = Object.entries(applicationData.skillRatings).map(([skill, level]) => [
      skill,
      typeof level === 'string' ? level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ') : level
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Skill', 'Proficiency Level']],
      body: skillData,
      theme: 'striped',
      headStyles: { fillColor: [3, 2, 19] },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 9 }
    });

    yPosition = (doc.lastAutoTable?.finalY ?? yPosition) + 10;

    // Why Hire Me Section
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Why Should We Hire You?', 15, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition = addText(applicationData.whyHireMe, 15, yPosition, pageWidth - 30);
    yPosition += 10;

    // Role Distribution Section
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Role Distribution', 15, yPosition);
    yPosition += 8;

    const roleData = Object.entries(applicationData.roleDistribution).map(([role, percentage]) => [
      role,
      `${percentage}%`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Responsibility', 'Percentage']],
      body: roleData,
      theme: 'striped',
      headStyles: { fillColor: [3, 2, 19] },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 9 }
    });

    yPosition = (doc.lastAutoTable?.finalY ?? yPosition) + 10;

    // Compensation Section
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Compensation Details', 15, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Current Compensation: ₹${applicationData.compensation.current}`, 15, yPosition);
    yPosition += 6;
    doc.text(`Expected Compensation: ₹${applicationData.compensation.expected}`, 15, yPosition);
    yPosition += 6;
    doc.text(`Last Revised: ${applicationData.compensation.revisedDate}`, 15, yPosition);
    yPosition += 10;

    // Resume Info
    if (applicationData.resume) {
      doc.text(`Resume: ${applicationData.resume.name} (${(applicationData.resume.size / 1024).toFixed(2)} KB)`, 15, yPosition);
      yPosition += 6;
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 15, pageHeight - 10);
    doc.text('TaxTalent - Tax Professional Job Portal', pageWidth - 15, pageHeight - 10, { align: 'right' });

    return doc;
  };

  const downloadJSON = (applicationData: any) => {
    const jsonString = JSON.stringify(applicationData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-application-${applicationData.jobTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const validateForm = () => {
    if (!email.trim()) {
      toast.error("Please provide your email address");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please provide a valid email address");
      return false;
    }

    if (!phone.trim()) {
      toast.error("Please provide your phone number");
      return false;
    }

    // Phone validation (Indian phone numbers)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/\s|-/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast.error("Please provide a valid 10-digit Indian phone number");
      return false;
    }

    if (!linkedinProfile.trim()) {
      toast.error("Please provide your LinkedIn profile URL");
      return false;
    }

    if (!linkedinProfile.includes("linkedin.com")) {
      toast.error("Please provide a valid LinkedIn profile URL");
      return false;
    }

    const unratedSkills = skills.filter(skill => !skillRatings[skill]);
    if (unratedSkills.length > 0) {
      toast.error(`Please rate your proficiency in all skills. Missing: ${unratedSkills.join(", ")}`);
      return false;
    }

    if (!whyHireMe.trim()) {
      toast.error("Please tell us why we should hire you");
      return false;
    }

    if (whyHireMe.trim().length < 50) {
      toast.error("Please provide a more detailed response (at least 50 characters)");
      return false;
    }

    // Validate role distribution
    if (roleEntries.length === 0) {
      toast.error("Please add at least one responsibility and distribute your time (must total 100%)");
      return false;
    }

    const incompleteEntries = roleEntries.filter(entry => !entry.responsibility || !entry.percentage);
    if (incompleteEntries.length > 0) {
      toast.error("Please complete all responsibility entries (select responsibility and enter percentage)");
      return false;
    }

    const totalPercentage = calculateTotalPercentage();
    if (totalPercentage !== 100) {
      toast.error(`Role distribution must total 100%. Current total: ${totalPercentage}%`);
      return false;
    }

    if (!currentCompensation.trim()) {
      toast.error("Please provide your current compensation");
      return false;
    }

    if (!expectedCompensation.trim()) {
      toast.error("Please provide your expected compensation");
      return false;
    }

    if (!compensationRevisedDate.trim()) {
      toast.error("Please provide the date when your compensation was last revised");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const roleDistribution = roleEntries.reduce((acc, entry) => {
        acc[entry.responsibility] = entry.percentage;
        return acc;
      }, {} as { [key: string]: string });

      const applicationData = {
        jobTitle,
        companyName,
        email,
        phone,
        linkedinProfile,
        skillRatings,
        whyHireMe,
        roleDistribution,
        compensation: {
          current: currentCompensation,
          revisedDate: compensationRevisedDate,
          expected: expectedCompensation
        },
        resume: uploadedResume
          ? {
              name: uploadedResume.displayName,
              size: uploadedResume.size,
              blobName: uploadedResume.blobName,
            }
          : null,
        submittedAt: new Date().toISOString()
      };
      
      const userId = user?.id;
      if (
        userId &&
        isUuid(userId) &&
        jobPostingId &&
        employerId &&
        isUuid(jobPostingId) &&
        isUuid(employerId)
      ) {
        let candidate = await candidateService.getCandidateByUserId(userId, { ensure: true });
        if (!candidate) {
          candidate = await candidateService.upsertCandidate({
            userid: userId,
            email: email || user.email,
            phone,
            resumeurl: uploadedResume ? resolveStorageDownloadUrl(uploadedResume.blobName) : undefined,
            status: "pending",
          } as any);
        }
        if (candidate?.id) {
          await jobApplicationService.submit({
            jobpostingid: jobPostingId,
            candidateid: candidate.id,
            userid: userId,
            employerid: employerId,
            coverletter: whyHireMe,
            resumeurl: uploadedResume ? resolveStorageDownloadUrl(uploadedResume.blobName) : undefined,
            currentcompensation: currentCompensation ? Number(currentCompensation) : undefined,
            expectedcompensation: expectedCompensation ? Number(expectedCompensation) : undefined,
            notes: JSON.stringify({ skillRatings, roleDistribution, linkedinProfile }),
          });
        }
      }

      // Generate and download PDF
      const pdf = generatePDF(applicationData);
      pdf.save(`job-application-${jobTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`);
      
      // Generate and download JSON
      downloadJSON(applicationData);
      
      setIsSubmitted(true);
      toast.success("Application submitted successfully! PDF and JSON files downloaded.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "";
      const message =
        /already applied/i.test(detail)
          ? "You have already applied to this job. View it under Status."
          : detail || "Failed to submit application. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl mb-2">Application Submitted Successfully!</h2>
              <p className="text-muted-foreground">
                Your application for <strong>{jobTitle}</strong> at <strong>{companyName}</strong> has been submitted.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left space-y-2">
              <h3 className="text-blue-900 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Downloaded Files
              </h3>
              <ul className="space-y-1 text-blue-800">
                <li>• PDF Summary - Complete application overview for your records</li>
                <li>• JSON File - Structured data for database storage</li>
                <li>• Check your downloads folder for both files</li>
              </ul>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-left space-y-2">
              <h3>What happens next?</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Your application will be reviewed by the hiring team</li>
                <li>• You'll receive an email confirmation within 24 hours</li>
                <li>• If shortlisted, you'll be contacted for next steps</li>
                <li>• You can track your application status in the "Status" section</li>
              </ul>
            </div>
            <Button onClick={onBack} className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {isLoadingPrefill && (
        <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading your profile details…
        </div>
      )}

      {/* Header */}
      {!isCompetencyMode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Job Application
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Applying for <strong>{jobTitle}</strong> at <strong>{companyName}</strong>
                </p>
              </div>
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* General Info Section */}
      {!isCompetencyMode && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            General Info
          </CardTitle>
          <p className="text-muted-foreground">
            Provide your contact information and professional profile
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* LinkedIn Profile URL */}
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile URL *</Label>
            <Input
              id="linkedin"
              type="text"
              placeholder="https://www.linkedin.com/in/your-profile"
              value={linkedinProfile}
              onChange={(e) => setLinkedinProfile(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Copy and paste your complete LinkedIn profile URL from your browser
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="text"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              We'll use this email for all communication regarding your application
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="text"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => {
                // Allow only numbers and limit to 10 digits
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setPhone(value);
                }
              }}
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">
              Enter your 10-digit Indian mobile number without country code
            </p>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Skillset Survey */}
      <Card>
        <CardHeader>
          <CardTitle>Skillset Survey</CardTitle>
          <p className="text-muted-foreground">
            Please rate your proficiency level in the following tax preparation areas
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {skills.map((skill, index) => (
            <div key={skill} className="space-y-3">
              <Label className="text-base">{skill} *</Label>
              <RadioGroup
                value={skillRatings[skill] || ""}
                onValueChange={(value) => handleSkillRating(skill, value as SkillLevel)}
                className="flex flex-wrap gap-4"
              >
                {skillLevels.map((level) => (
                  <div 
                    key={level.value} 
                    className={`
                      flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
                      ${skillRatings[skill] === level.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }
                    `}
                    onClick={() => handleSkillRating(skill, level.value as SkillLevel)}
                  >
                    <RadioGroupItem 
                      value={level.value} 
                      id={`${skill}-${level.value}`}
                      className="w-5 h-5"
                    />
                    <Label 
                      htmlFor={`${skill}-${level.value}`} 
                      className="cursor-pointer select-none text-sm font-medium"
                    >
                      {level.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {index < skills.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Why Should We Hire You */}
      <Card>
        <CardHeader>
          <CardTitle>Why Should We Hire You?</CardTitle>
          <p className="text-muted-foreground">
            Tell us what makes you the ideal candidate for this position
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="why-hire">Your Response *</Label>
            <Textarea
              id="why-hire"
              placeholder="Describe your relevant experience, unique skills, achievements, and what value you would bring to this role..."
              value={whyHireMe}
              onChange={(e) => setWhyHireMe(e.target.value)}
              className="min-h-32 resize-none"
              rows={6}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Minimum 50 characters required</span>
              <span>{whyHireMe.length} characters</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Role Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Your Role
          </CardTitle>
          <p className="text-muted-foreground">
            How is your time typically distributed among your core responsibilities?
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Entries */}
          <div className="space-y-4">
            {roleEntries.map((entry, index) => (
              <div key={entry.id} className="flex items-start gap-3 p-4 border border-border rounded-lg bg-muted/20">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Responsibility Dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor={`responsibility-${entry.id}`}>
                      Responsibility *
                    </Label>
                    <Select
                      value={entry.responsibility}
                      onValueChange={(value) => updateRoleEntry(entry.id, 'responsibility', value)}
                    >
                      <SelectTrigger id={`responsibility-${entry.id}`}>
                        <SelectValue placeholder="Select responsibility" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableResponsibilities(entry.id).map((resp) => (
                          <SelectItem key={resp} value={resp}>
                            {resp}
                          </SelectItem>
                        ))}
                        {entry.responsibility && !getAvailableResponsibilities(entry.id).includes(entry.responsibility) && (
                          <SelectItem value={entry.responsibility}>
                            {entry.responsibility}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Percentage Input */}
                  <div className="space-y-2">
                    <Label htmlFor={`percentage-${entry.id}`}>
                      Percentage *
                    </Label>
                    <div className="relative">
                      <Input
                        id={`percentage-${entry.id}`}
                        type="text"
                        placeholder="0"
                        value={entry.percentage}
                        onChange={(e) => updateRoleEntry(entry.id, 'percentage', e.target.value)}
                        className="pr-8 text-right"
                        maxLength={3}
                      />
                      <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Remove Button - Only show if more than one entry */}
                {roleEntries.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRoleEntry(entry.id)}
                    className="text-muted-foreground hover:text-destructive mt-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            {/* Add Responsibility Button */}
            <Button
              type="button"
              variant="outline"
              onClick={addRoleEntry}
              className="w-full"
              disabled={roleEntries.length >= responsibilities.length}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Responsibility
            </Button>

            {roleEntries.length >= responsibilities.length && (
              <p className="text-sm text-muted-foreground text-center">
                All available responsibilities have been added
              </p>
            )}
          </div>

          {roleEntries.length > 0 && (
            <>
              <Separator />

              {/* Total Percentage Display */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="text-base">Total Percentage</span>
                <div className={`text-xl flex items-center gap-2 ${
                  calculateTotalPercentage() === 100 
                    ? 'text-green-600' 
                    : calculateTotalPercentage() > 100 
                      ? 'text-red-600' 
                      : 'text-muted-foreground'
                }`}>
                  <span>{calculateTotalPercentage()}</span>
                  <Percent className="w-5 h-5" />
                </div>
              </div>

              {/* Validation Messages */}
              {calculateTotalPercentage() !== 100 && calculateTotalPercentage() > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  ⚠️ Your total must equal 100%. {calculateTotalPercentage() < 100 
                    ? `You need to add ${100 - calculateTotalPercentage()}% more.` 
                    : `You need to reduce by ${calculateTotalPercentage() - 100}%.`}
                </div>
              )}

              {calculateTotalPercentage() === 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Perfect! Your role distribution totals 100%
                </div>
              )}
            </>
          )}

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm text-blue-900">💡 Tips for Role Distribution:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Click "Add Responsibility" to add your core responsibilities</li>
              <li>• Be honest about how you currently spend your time</li>
              <li>• Consider a typical work week or month</li>
              <li>• Total must equal exactly 100%</li>
              <li>• Use "Other" for tasks that don't fit the listed categories</li>
              <li>• This helps us match you with the right role and responsibilities</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Compensation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5" />
            Compensation Details
          </CardTitle>
          <p className="text-muted-foreground">
            Help us understand your current compensation and expectations
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Compensation */}
            <div className="space-y-2">
              <Label htmlFor="current-compensation">
                Your Current Fixed Compensation Excluding Bonus *
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="current-compensation"
                  type="text"
                  placeholder="e.g., 12,00,000"
                  value={currentCompensation}
                  onChange={(e) => {
                    // Format number with commas (Indian number system)
                    const value = e.target.value.replace(/,/g, '');
                    if (value === '' || /^\d+$/.test(value)) {
                      const formatted = value ? parseInt(value).toLocaleString('en-IN') : '';
                      setCurrentCompensation(formatted);
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your annual base salary in INR, excluding bonuses or benefits
              </p>
            </div>

            {/* Expected Compensation */}
            <div className="space-y-2">
              <Label htmlFor="expected-compensation">
                Your Expectation on Compensation *
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="expected-compensation"
                  type="text"
                  placeholder="e.g., 15,00,000"
                  value={expectedCompensation}
                  onChange={(e) => {
                    // Format number with commas (Indian number system)
                    const value = e.target.value.replace(/,/g, '');
                    if (value === '' || /^\d+$/.test(value)) {
                      const formatted = value ? parseInt(value).toLocaleString('en-IN') : '';
                      setExpectedCompensation(formatted);
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your expected annual salary in INR for this position
              </p>
            </div>
          </div>

          {/* Compensation Revision Date */}
          <div className="space-y-2">
            <Label htmlFor="compensation-revised">
              Your Compensation was revised on *
            </Label>
            <Input
              id="compensation-revised"
              type="month"
              value={compensationRevisedDate}
              onChange={(e) => setCompensationRevisedDate(e.target.value)}
              className="w-full md:w-64"
            />
            <p className="text-xs text-muted-foreground">
              Select the month and year when your current compensation was last revised
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm text-blue-900">💡 Compensation Tips:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Be honest about your current compensation to ensure fair negotiations</li>
              <li>• Research market rates for your experience level and location in India</li>
              <li>• Consider total compensation including benefits, not just base salary</li>
              <li>• Your expectations should align with your skills and experience level</li>
              <li>• All amounts should be in Indian Rupees (INR) per annum</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Resume Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Resume
          </CardTitle>
          <p className="text-muted-foreground">
            Upload your latest resume to support your application (Optional)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <StorageFileUpload
            folder="applications/resumes"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            maxSizeMb={5}
            hint="PDF, DOC, or DOCX files up to 5MB"
            value={uploadedResume}
            onChange={setUploadedResume}
          />
          
          <div className="bg-blue-50 rounded-lg p-3 text-sm space-y-1">
            <h4 className="text-blue-900">Tips for a great resume:</h4>
            <ul className="text-blue-800 text-xs space-y-0.5">
              <li>• Include your tax preparation experience and certifications</li>
              <li>• Highlight specific software proficiency (Drake, ProSeries, etc.)</li>
              <li>• Mention client volume and complexity handled</li>
              <li>• Keep it updated and under 2 pages</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Submit Section */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <h4 className="mb-2">Before you submit:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Verify your email address and phone number are correct</li>
                <li>• Ensure your LinkedIn profile URL is correct and accessible</li>
                <li>• Double-check your skill ratings for accuracy</li>
                <li>• Review your response to make sure it highlights your strengths</li>
                <li>• Confirm your role distribution totals exactly 100%</li>
                <li>• Make sure all required fields are completed</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none sm:w-auto"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Application
                </>
              )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}