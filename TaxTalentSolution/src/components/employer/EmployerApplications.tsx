import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2, AlertCircle, User } from "lucide-react";
import { useEmployerPortal, formatApplicationStatus } from "../../hooks/useEmployerPortal";
import { isUuid } from "../../api/userAssessmentService";
import { jobApplicationService } from "../../api/jobApplicationService";
import type { ApplicationStatus } from "../../database/types";

interface EmployerApplicationsProps {
  userId?: string;
  userEmail?: string;
  onViewCandidate?: (candidateId: string) => void;
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "shortlisted",
  "interview_scheduled",
  "offered",
  "rejected",
];

export function EmployerApplications({ userId, userEmail, onViewCandidate }: EmployerApplicationsProps) {
  const { applications, candidates, employerJobs, loading, hasEmployer, profileError, refreshApplications } =
    useEmployerPortal(userId, userEmail);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const candidateNameById = new Map(
    candidates.map((c) => [
      c.id,
      (c as { name?: string }).name || c.headline || `Candidate ${c.id.slice(0, 8)}`,
    ])
  );
  const jobTitleById = new Map(employerJobs.map((j) => [j.id, j.title]));

  const sorted = [...applications].sort(
    (a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
  );

  if (!userId || !isUuid(userId)) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Sign in with a platform account to view applications.
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
        <h3 className="text-xl font-semibold">Applications</h3>
        <p className="text-sm text-muted-foreground">
          Candidates who applied to your job postings
        </p>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No applications yet. Active jobs will appear here when candidates apply.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All applications</CardTitle>
            <CardDescription>{sorted.length} total</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sorted.map((app) => (
              <div
                key={app.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {candidateNameById.get(app.candidate_id) || "Candidate"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {jobTitleById.get(app.job_id) || "Role"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    value={app.status}
                    disabled={updatingId === app.id}
                    onValueChange={async (value) => {
                      setUpdatingId(app.id);
                      try {
                        await jobApplicationService.updateStatus(app, value as ApplicationStatus);
                        await refreshApplications();
                      } finally {
                        setUpdatingId(null);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[160px] h-8">
                      <SelectValue>{formatApplicationStatus(app.status)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {formatApplicationStatus(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {onViewCandidate && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewCandidate(app.candidate_id)}
                    >
                      <User className="w-4 h-4 mr-1" />
                      Profile
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
