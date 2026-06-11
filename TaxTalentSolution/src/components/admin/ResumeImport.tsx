import { useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { parseLinkedInPDF } from "../../utils/resumeParser";
import type { ParsedCandidate } from "../../utils/resumeParser";
import { candidateService } from "../../api/candidateService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import {
  Upload,
  FileText,
  CheckCircle2,
  X,
  Plus,
  Loader2,
  AlertCircle,
  UserPlus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { uploadFileToStorage } from "../../api/fileService";

// Use CDN worker to avoid Vite bundler complexity with pdfjs workers
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// ---- Types ----

interface ExperienceEntry {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

export interface CandidateForm {
  name: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  locationCity: string;
  locationState: string;
  locationCountry: string;
  headline: string;
  summary: string;
  skills: string[];
  certifications: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  availability: string;
  workMode: string;
  experienceYears: number;
  hourlyRate: number;
  expectedSalaryMin: number;
  expectedSalaryMax: number;
}

interface FileItem {
  id: string;
  name: string;
  file: File;
  status: "queued" | "parsing" | "ready" | "error" | "saved";
  error?: string;
  rawText?: string;
  form: CandidateForm;
}

// ---- Helpers ----

function parsedToForm(parsed: ParsedCandidate): CandidateForm {
  return {
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone,
    linkedinUrl: parsed.linkedinUrl,
    locationCity: parsed.locationCity,
    locationState: parsed.locationState,
    locationCountry: parsed.locationCountry,
    headline: parsed.headline,
    summary: parsed.summary,
    skills: parsed.skills,
    certifications: parsed.certifications,
    experience: parsed.experience.map((e) => ({
      company: e.company,
      position: e.position,
      startDate: e.startDate,
      endDate: e.endDate,
      isCurrent: e.isCurrent,
      description: e.description || "",
    })),
    education: parsed.education.map((e) => ({
      institution: e.institution,
      degree: e.degree,
      field: e.field,
      startYear: e.startYear,
      endYear: e.endYear,
    })),
    availability: "immediate",
    workMode: "remote",
    experienceYears: parsed.experienceYears,
    hourlyRate: 0,
    expectedSalaryMin: 0,
    expectedSalaryMax: 0,
  };
}

function emptyForm(): CandidateForm {
  return {
    name: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    locationCity: "",
    locationState: "",
    locationCountry: "",
    headline: "",
    summary: "",
    skills: [],
    certifications: [],
    experience: [],
    education: [],
    availability: "immediate",
    workMode: "remote",
    experienceYears: 0,
    hourlyRate: 0,
    expectedSalaryMin: 0,
    expectedSalaryMax: 0,
  };
}

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageTexts: string[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    let pageText = "";
    for (const item of content.items) {
      if ("str" in item) {
        pageText += item.str;
        if (item.hasEOL) pageText += "\n";
      }
    }
    pageTexts.push(pageText);
  }
  return pageTexts.join("\n");
}

// ---- Main Component ----

export function ResumeImport() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedFile = files.find((f) => f.id === selectedId) ?? null;

  const processFile = useCallback(async (fileItem: FileItem) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileItem.id ? { ...f, status: "parsing" } : f))
    );
    try {
      const text = await extractPdfText(fileItem.file);
      const parsed = parseLinkedInPDF(text);
      const form = parsedToForm(parsed);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: "ready", rawText: text, form } : f
        )
      );
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: "error", error: String(err) } : f
        )
      );
    }
  }, []);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const pdfs = Array.from(incoming).filter(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );
      if (pdfs.length === 0) {
        toast.error("Please upload PDF files only");
        return;
      }
      const items: FileItem[] = pdfs.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        file,
        status: "queued",
        form: emptyForm(),
      }));
      setFiles((prev) => {
        const next = [...prev, ...items];
        return next;
      });
      if (!selectedId && items.length > 0) setSelectedId(items[0].id);
      for (const item of items) processFile(item);
    },
    [selectedId, processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const updateForm = (id: string, updates: Partial<CandidateForm>) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, form: { ...f.form, ...updates } } : f
      )
    );
  };

  // Skills
  const addSkill = () => {
    if (!skillInput.trim() || !selectedFile) return;
    updateForm(selectedFile.id, {
      skills: [...selectedFile.form.skills, skillInput.trim()],
    });
    setSkillInput("");
  };
  const removeSkill = (idx: number) => {
    if (!selectedFile) return;
    updateForm(selectedFile.id, {
      skills: selectedFile.form.skills.filter((_, i) => i !== idx),
    });
  };

  // Certifications
  const addCert = () => {
    if (!certInput.trim() || !selectedFile) return;
    updateForm(selectedFile.id, {
      certifications: [...selectedFile.form.certifications, certInput.trim()],
    });
    setCertInput("");
  };
  const removeCert = (idx: number) => {
    if (!selectedFile) return;
    updateForm(selectedFile.id, {
      certifications: selectedFile.form.certifications.filter((_, i) => i !== idx),
    });
  };

  // Experience
  const addExpEntry = () => {
    if (!selectedFile) return;
    updateForm(selectedFile.id, {
      experience: [
        ...selectedFile.form.experience,
        { company: "", position: "", startDate: "", endDate: "", isCurrent: false, description: "" },
      ],
    });
  };
  const updateExp = (idx: number, updates: Partial<ExperienceEntry>) => {
    if (!selectedFile) return;
    updateForm(selectedFile.id, {
      experience: selectedFile.form.experience.map((e, i) =>
        i === idx ? { ...e, ...updates } : e
      ),
    });
  };
  const removeExp = (idx: number) => {
    if (!selectedFile) return;
    updateForm(selectedFile.id, {
      experience: selectedFile.form.experience.filter((_, i) => i !== idx),
    });
  };

  // Education
  const addEduEntry = () => {
    if (!selectedFile) return;
    updateForm(selectedFile.id, {
      education: [
        ...selectedFile.form.education,
        { institution: "", degree: "", field: "", startYear: "", endYear: "" },
      ],
    });
  };
  const updateEdu = (idx: number, updates: Partial<EducationEntry>) => {
    if (!selectedFile) return;
    updateForm(selectedFile.id, {
      education: selectedFile.form.education.map((e, i) =>
        i === idx ? { ...e, ...updates } : e
      ),
    });
  };
  const removeEdu = (idx: number) => {
    if (!selectedFile) return;
    updateForm(selectedFile.id, {
      education: selectedFile.form.education.filter((_, i) => i !== idx),
    });
  };

  const handleSave = async (fileId: string) => {
    const f = files.find((fi) => fi.id === fileId);
    if (!f) return;
    if (!f.form.email) {
      toast.error("Email is required to create a profile");
      return;
    }
    try {
      const stored = await uploadFileToStorage(f.file, "resumes");
      await candidateService.upsertCandidate({
        name: f.form.name,
        email: f.form.email,
        phone: f.form.phone || "0000000000",
        headline: f.form.headline,
        location_city: f.form.locationCity || "",
        location_state: f.form.locationState || "",
        experience_years: f.form.experienceYears || 0,
        summary: f.form.summary,
        resume_url: stored.name,
        status: "pending",
        availability: "immediate",
        work_mode: "remote",
        taxexpertise: f.form.skills,
        certifications: f.form.certifications,
        experience: f.form.experience,
        education: f.form.education,
      });
      setFiles((prev) =>
        prev.map((fi) => (fi.id === fileId ? { ...fi, status: "saved" } : fi))
      );
      toast.success(`Profile created for ${f.form.name || f.name}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create profile");
    }
  };

  const statusIcon = (status: FileItem["status"]) => {
    switch (status) {
      case "parsing":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />;
      case "ready":
        return <FileText className="w-4 h-4 text-green-500 shrink-0" />;
      case "saved":
        return <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground shrink-0" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Resume Import</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Upload LinkedIn PDF exports to bulk-create candidate profiles
          </p>
        </div>
        {files.length > 0 && (
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload More
          </Button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && addFiles(e.target.files)}
      />

      {files.length === 0 ? (
        /* ---- Drop Zone (empty state) ---- */
        <div
          className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-5 transition-colors cursor-pointer ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
          }`}
          style={{ minHeight: 320 }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-9 h-9 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">Drop PDF resumes here</p>
            <p className="text-sm text-muted-foreground mt-1">
              LinkedIn PDF exports · Multiple files supported
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <Plus className="w-4 h-4" />
            Select Files
          </Button>
        </div>
      ) : (
        /* ---- Two-column review layout ---- */
        <div className="flex gap-5 flex-1 min-h-0">
          {/* Left: file list */}
          <div className="w-56 shrink-0 flex flex-col">
            {/* Mini drop zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-3 mb-3 flex flex-col items-center gap-1 text-center cursor-pointer transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/20 hover:border-primary/40"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Drop more PDFs</p>
            </div>

            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-1">
                {files.map((f) => (
                  <button
                    key={f.id}
                    className={`w-full text-left rounded-lg px-2.5 py-2 flex items-center gap-2 transition-colors text-sm ${
                      selectedId === f.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedId(f.id)}
                  >
                    {statusIcon(f.status)}
                    <span className="truncate flex-1" title={f.name}>
                      {f.name.replace(/\.pdf$/i, "")}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>

            {/* Stats */}
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Total</span>
                <span>{files.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Ready</span>
                <span className="text-green-600">
                  {files.filter((f) => f.status === "ready").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Saved</span>
                <span className="text-blue-600">
                  {files.filter((f) => f.status === "saved").length}
                </span>
              </div>
            </div>
          </div>

          {/* Right: review panel */}
          <div className="flex-1 min-w-0">
            {!selectedFile ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Select a resume from the list to review</p>
                </div>
              </div>
            ) : selectedFile.status === "parsing" ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
                  <p className="font-medium">Extracting text from PDF…</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Parsing {selectedFile.name}
                  </p>
                </div>
              </div>
            ) : selectedFile.status === "error" ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-destructive max-w-sm">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3" />
                  <p className="font-medium">Failed to parse PDF</p>
                  <p className="text-sm mt-1 opacity-75">{selectedFile.error}</p>
                </div>
              </div>
            ) : selectedFile.status === "saved" ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-green-600">
                  <CheckCircle2 className="w-14 h-14 mx-auto mb-4" />
                  <p className="text-xl font-bold">Profile Created!</p>
                  <p className="text-muted-foreground mt-2 text-sm max-w-xs">
                    {selectedFile.form.name} has been added to the candidate pool
                    with <strong>pending</strong> status.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-5"
                    onClick={() =>
                      setFiles((prev) =>
                        prev.map((f) =>
                          f.id === selectedFile.id ? { ...f, status: "ready" } : f
                        )
                      )
                    }
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            ) : (
              <ReviewForm
                fileItem={selectedFile}
                updateForm={(updates) => updateForm(selectedFile.id, updates)}
                skillInput={skillInput}
                setSkillInput={setSkillInput}
                addSkill={addSkill}
                removeSkill={removeSkill}
                certInput={certInput}
                setCertInput={setCertInput}
                addCert={addCert}
                removeCert={removeCert}
                addExpEntry={addExpEntry}
                updateExp={updateExp}
                removeExp={removeExp}
                addEduEntry={addEduEntry}
                updateEdu={updateEdu}
                removeEdu={removeEdu}
                onSave={() => handleSave(selectedFile.id)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Review Form sub-component ----

interface ReviewFormProps {
  fileItem: FileItem;
  updateForm: (updates: Partial<CandidateForm>) => void;
  skillInput: string;
  setSkillInput: (v: string) => void;
  addSkill: () => void;
  removeSkill: (i: number) => void;
  certInput: string;
  setCertInput: (v: string) => void;
  addCert: () => void;
  removeCert: (i: number) => void;
  addExpEntry: () => void;
  updateExp: (i: number, u: Partial<ExperienceEntry>) => void;
  removeExp: (i: number) => void;
  addEduEntry: () => void;
  updateEdu: (i: number, u: Partial<EducationEntry>) => void;
  removeEdu: (i: number) => void;
  onSave: () => void;
}

function ReviewForm({
  fileItem,
  updateForm,
  skillInput,
  setSkillInput,
  addSkill,
  removeSkill,
  certInput,
  setCertInput,
  addCert,
  removeCert,
  addExpEntry,
  updateExp,
  removeExp,
  addEduEntry,
  updateEdu,
  removeEdu,
  onSave,
}: ReviewFormProps) {
  const form = fileItem.form;

  return (
    <ScrollArea className="h-[calc(100vh-230px)]">
      <div className="space-y-5 pr-3 pb-4">
        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm({ email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => updateForm({ phone: e.target.value })}
                  placeholder="+1 555 000 0000"
                />
              </div>
              <div className="space-y-1.5">
                <Label>LinkedIn URL</Label>
                <Input
                  value={form.linkedinUrl}
                  onChange={(e) => updateForm({ linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input
                  value={form.locationCity}
                  onChange={(e) => updateForm({ locationCity: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-1.5">
                <Label>State / Province</Label>
                <Input
                  value={form.locationState}
                  onChange={(e) => updateForm({ locationState: e.target.value })}
                  placeholder="State"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input
                  value={form.locationCountry}
                  onChange={(e) => updateForm({ locationCountry: e.target.value })}
                  placeholder="Country"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Headline</Label>
              <Input
                value={form.headline}
                onChange={(e) => updateForm({ headline: e.target.value })}
                placeholder="Professional headline"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Professional Summary</Label>
              <Textarea
                value={form.summary}
                onChange={(e) => updateForm({ summary: e.target.value })}
                rows={4}
                placeholder="Professional summary…"
              />
            </div>
          </CardContent>
        </Card>

        {/* TTS Profile Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">TTS Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Experience Years</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.experienceYears}
                  onChange={(e) => updateForm({ experienceYears: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Availability</Label>
                <Select
                  value={form.availability}
                  onValueChange={(v) => updateForm({ availability: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="2_weeks">2 Weeks</SelectItem>
                    <SelectItem value="1_month">1 Month</SelectItem>
                    <SelectItem value="not_looking">Not Looking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Work Mode</Label>
                <Select
                  value={form.workMode}
                  onValueChange={(v) => updateForm({ workMode: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Hourly Rate (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.hourlyRate || ""}
                  onChange={(e) => updateForm({ hourlyRate: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Salary Min (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.expectedSalaryMin || ""}
                  onChange={(e) =>
                    updateForm({ expectedSalaryMin: Number(e.target.value) })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Salary Max (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.expectedSalaryMax || ""}
                  onChange={(e) =>
                    updateForm({ expectedSalaryMax: Number(e.target.value) })
                  }
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {form.skills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1">
                  {skill}
                  <button
                    onClick={() => removeSkill(i)}
                    className="hover:text-destructive ml-0.5 focus:outline-none"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {form.skills.length === 0 && (
                <p className="text-sm text-muted-foreground">No skills added yet</p>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Type a skill and press Enter…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={addSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {form.certifications.map((cert, i) => (
                <Badge key={i} variant="outline" className="gap-1 pr-1">
                  {cert}
                  <button
                    onClick={() => removeCert(i)}
                    className="hover:text-destructive ml-0.5 focus:outline-none"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {form.certifications.length === 0 && (
                <p className="text-sm text-muted-foreground">No certifications added yet</p>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                placeholder="Add certification…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCert();
                  }
                }}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={addCert}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Work Experience */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Work Experience</CardTitle>
            <Button variant="outline" size="sm" onClick={addExpEntry} className="gap-1 h-8">
              <Plus className="w-3.5 h-3.5" /> Add Entry
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.experience.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No experience entries. Add one manually or they will be auto-extracted from the PDF.
              </p>
            )}
            {form.experience.map((exp, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Entry {i + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeExp(i)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExp(i, { company: e.target.value })}
                      placeholder="Company name"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Role / Title</Label>
                    <Input
                      value={exp.position}
                      onChange={(e) => updateExp(i, { position: e.target.value })}
                      placeholder="Job title"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      value={exp.startDate}
                      onChange={(e) => updateExp(i, { startDate: e.target.value })}
                      placeholder="YYYY-MM-DD"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">End Date</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={exp.endDate}
                        onChange={(e) => updateExp(i, { endDate: e.target.value })}
                        placeholder="YYYY-MM-DD"
                        disabled={exp.isCurrent}
                        className="h-8 text-sm flex-1"
                      />
                      <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={exp.isCurrent}
                          onChange={(e) => updateExp(i, { isCurrent: e.target.checked })}
                          className="rounded"
                        />
                        Current
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateExp(i, { description: e.target.value })}
                    rows={2}
                    className="text-sm resize-none"
                    placeholder="Role description…"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Education</CardTitle>
            <Button variant="outline" size="sm" onClick={addEduEntry} className="gap-1 h-8">
              <Plus className="w-3.5 h-3.5" /> Add Entry
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.education.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No education entries. Add one manually or they will be auto-extracted from the PDF.
              </p>
            )}
            {form.education.map((edu, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Entry {i + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeEdu(i)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Institution</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateEdu(i, { institution: e.target.value })}
                      placeholder="Institution name"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEdu(i, { degree: e.target.value })}
                      placeholder="e.g. CPA, MBA"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Field of Study</Label>
                    <Input
                      value={edu.field}
                      onChange={(e) => updateEdu(i, { field: e.target.value })}
                      placeholder="e.g. Accounting & Finance"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Start Year</Label>
                    <Input
                      value={edu.startYear}
                      onChange={(e) => updateEdu(i, { startYear: e.target.value })}
                      placeholder="YYYY"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">End Year</Label>
                    <Input
                      value={edu.endYear}
                      onChange={(e) => updateEdu(i, { endYear: e.target.value })}
                      placeholder="YYYY"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Raw extracted text (collapsible) */}
        {fileItem.rawText && (
          <details>
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground select-none py-1">
              View Raw Extracted Text
            </summary>
            <pre className="mt-2 text-xs bg-muted rounded-lg p-3 overflow-auto max-h-64 whitespace-pre-wrap font-mono leading-relaxed">
              {fileItem.rawText}
            </pre>
          </details>
        )}

        {/* Save */}
        <div className="flex justify-end">
          <Button onClick={onSave} size="lg" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Create Profile
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
