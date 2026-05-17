import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Loader2, AlertCircle, MapPin, Briefcase } from "lucide-react";
import { useEmployerPortal } from "../../hooks/useEmployerPortal";
import { isUuid } from "../../api/userAssessmentService";

interface EmployerJobsProps {
  userId?: string;
  userEmail?: string;
}

export function EmployerJobs({ userId, userEmail }: EmployerJobsProps) {
  const { employerJobs, loading, hasEmployer, profileError } = useEmployerPortal(userId, userEmail);

  if (!userId || !isUuid(userId)) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Sign in with a platform account to view job postings.
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasEmployer) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-amber-600" />
          <p className="font-medium">No employer linked</p>
          <p className="text-sm text-muted-foreground mt-2">{profileError}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Job postings</h3>
        <p className="text-sm text-muted-foreground">Roles published under your employer account</p>
      </div>

      {employerJobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No jobs found for this employer. Add postings via the API or sample data migration.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {employerJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription>{job.category || "General"}</CardDescription>
                  </div>
                  <Badge variant={job.status === "active" ? "default" : "secondary"}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {(job.location_city || job.location_state) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {[job.location_city, job.location_state].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {job.job_type && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {job.job_type.replace(/_/g, " ")}
                    </span>
                  )}
                  {job.salary_min != null && job.salary_max != null && (
                    <span>
                      ₹{job.salary_min.toLocaleString()} – ₹{job.salary_max.toLocaleString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
