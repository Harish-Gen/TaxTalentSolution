import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  MapPin,
  Briefcase,
  Award,
  Star,
  Mail,
  Phone,
  DollarSign,
  Clock,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { candidateService } from "../../api/candidateService";
import { profileViewService } from "../../api/profileViewService";
import { useCandidateCertificates, useSavedCandidates } from "../../database";

interface CandidateProfileViewProps {
  candidateId: string;
  onBack: () => void;
  employerId?: string;
  userId?: string;
}

type CandidateDetail = Awaited<ReturnType<typeof candidateService.getCandidateById>>;

function formatAvailability(value?: string): string {
  if (!value) return "Immediate";
  return value.replace(/_/g, " ");
}

export function CandidateProfileView({
  candidateId,
  onBack,
  employerId,
  userId,
}: CandidateProfileViewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { certificates, loading: certsLoading } = useCandidateCertificates(candidateId);
  const { savedIds, toggleSave } = useSavedCandidates(employerId);

  useEffect(() => {
    if (employerId) {
      void profileViewService.record({
        candidateid: candidateId,
        employerid: employerId,
        vieweruserid: userId,
        viewtype: "full",
        source: "candidate_profile",
      });
    }
  }, [candidateId, employerId, userId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    candidateService
      .getCandidateById(candidateId)
      .then((data) => {
        if (!cancelled) setCandidate(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not load candidate profile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loadError || !candidate) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-amber-600" />
          <p>{loadError || "Candidate not found"}</p>
          <Button variant="outline" className="mt-4" onClick={onBack}>
            Back to search
          </Button>
        </CardContent>
      </Card>
    );
  }

  const name = candidate.name || "Candidate";
  const location =
    [candidate.location_city, candidate.location_state].filter(Boolean).join(", ") || "Remote";
  const skills = candidate.tax_expertise || [];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button variant="outline" onClick={onBack}>
          ← Back to Search
        </Button>
        <Button
          variant={savedIds.has(candidateId) ? "default" : "outline"}
          disabled={!employerId || saving}
          onClick={async () => {
            if (!employerId) return;
            setSaving(true);
            try {
              await toggleSave(candidateId, userId);
            } finally {
              setSaving(false);
            }
          }}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {savedIds.has(candidateId) ? "Shortlisted" : "Shortlist"}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-semibold">{name}</h2>
                  {candidate.status === "approved" && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-3">
                  {candidate.headline || "Tax Professional"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    {candidate.experience_years || 0} years
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {formatAvailability(candidate.availability)}
                  </span>
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    ₹{(candidate.hourly_rate || 0).toLocaleString()}/hr
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{(candidate.rating || 0).toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    · {candidate.profile_views || 0} profile views
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{candidate.email || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{candidate.phone || "Not provided"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.summary ? (
                <p className="text-muted-foreground leading-relaxed">{candidate.summary}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No summary provided.</p>
              )}
              <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                <div>
                  <p className="text-muted-foreground">Work mode</p>
                  <p className="capitalize">{candidate.work_mode?.replace(/_/g, " ") || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Profile completeness</p>
                  <p>{candidate.profile_completeness || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax expertise</CardTitle>
              <CardDescription>From candidate profile</CardDescription>
            </CardHeader>
            <CardContent>
              {skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No skills listed.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
              <CardDescription>Platform-issued credentials</CardDescription>
            </CardHeader>
            <CardContent>
              {certsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : certificates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No certificates on file.</p>
              ) : (
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <Award className="w-6 h-6 text-primary shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{cert.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Issued {new Date(cert.issue_date).toLocaleDateString()}
                          {cert.score != null ? ` · Score ${cert.score}%` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
