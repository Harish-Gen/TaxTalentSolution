import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Building,
  BookmarkPlus,
  Share2,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useJob, useEmployers } from "../../database";

interface JobDetailsProps {
  jobId: string;
  onBack: () => void;
  onJobApplication?: (
    jobTitle: string,
    companyName: string,
    jobPostingId: string,
    employerId: string
  ) => void;
}

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return "Not disclosed";
  const fmt = (n: number) => `₹${(n / 100000).toFixed(0)}L`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return min ? fmt(min) : max ? fmt(max!) : "Not disclosed";
}

export function JobDetails({ jobId, onBack, onJobApplication }: JobDetailsProps) {
  const { job, loading: jobLoading } = useJob(jobId);
  const { employers, loading: employersLoading } = useEmployers();

  const loading = jobLoading || employersLoading;
  const employer = job ? employers.find((e) => e.id === job.employer_id) : undefined;
  const companyName = employer?.company_name || "Employer";

  const requirements = Array.isArray(job?.requirements)
    ? job!.requirements
    : typeof job?.requirements === "string"
      ? [job!.requirements]
      : [];
  const responsibilities = Array.isArray(job?.responsibilities)
    ? job!.responsibilities
    : typeof job?.responsibilities === "string"
      ? [job!.responsibilities]
      : [];
  const benefits = Array.isArray(job?.benefits)
    ? job!.benefits
    : typeof job?.benefits === "string"
      ? [job!.benefits]
      : [];
  const skills = Array.isArray(job?.required_skills) ? job!.required_skills : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading job details...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Job not found or no longer available.
          </CardContent>
        </Card>
      </div>
    );
  }

  const location = [job.location_city, job.location_state].filter(Boolean).join(", ");
  const apply = () =>
    onJobApplication?.(job.title, companyName, job.id, job.employer_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BookmarkPlus className="w-4 h-4 mr-2" />
            Save Job
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">{job.title}</h1>
                  <div className="flex items-center text-lg text-primary">
                    <Building className="w-5 h-5 mr-2" />
                    {companyName}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{location || "Remote / TBD"}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{job.job_type || "Full-time"}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground">Level:</span>
                  <span className="ml-1">{job.experience_level || "—"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {job.is_urgent && <Badge variant="destructive">Urgent</Badge>}
                {job.is_remote && <Badge variant="outline">Remote</Badge>}
                {job.category && <Badge variant="outline">{job.category}</Badge>}
              </div>
            </div>
            <Button size="lg" className="px-8" onClick={apply}>
              Apply Now
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {job.description && (
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
              </CardContent>
            </Card>
          )}

          {responsibilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {requirements.map((item, index) => (
                    <li key={index} className="text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Apply</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={apply}>
                Apply Now
              </Button>
            </CardContent>
          </Card>

          {skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {employer?.description && (
            <Card>
              <CardHeader>
                <CardTitle>About {companyName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{employer.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
