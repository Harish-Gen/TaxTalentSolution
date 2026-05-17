import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Users,
  FileText,
  Calendar,
  Search,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useEmployerPortal, formatApplicationStatus } from "../../hooks/useEmployerPortal";
import { isUuid } from "../../api/userAssessmentService";

interface EmployerDashboardProps {
  userId?: string;
  userEmail?: string;
  onNavigate: (section: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function EmployerDashboard({ userId, userEmail, onNavigate }: EmployerDashboardProps) {
  const {
    employerName,
    recentApplications,
    applicationsByDay,
    skillDemand,
    stats,
    loading,
    profileError,
    hasEmployer,
  } = useEmployerPortal(userId, userEmail);

  if (!userId || !isUuid(userId)) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>Sign in with a platform account (UUID) to use the employer portal with live data.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading dashboard…</span>
      </div>
    );
  }

  if (!hasEmployer) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-amber-600" />
          <p className="font-medium mb-2">No employer linked to this account</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {profileError ||
              (userEmail
                ? `No employer is assigned to ${userEmail}. An admin can link your account under Admin → User Management, or sign in with recruiter@kpmg.demo after running migrations 006–009.`
                : "Link your user to an employer in the database (user_employers) or sign in as recruiter@kpmg.demo after sample data migration.")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {employerName && (
        <p className="text-sm text-muted-foreground">
          Recruiting for <span className="font-medium text-foreground">{employerName}</span>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active job postings</p>
            <p className="text-3xl mt-2">{stats.activeJobs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Applications received</p>
            <p className="text-3xl mt-2">{stats.totalApplications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Under review</p>
            <p className="text-3xl mt-2">{stats.underReview}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Interview / shortlist</p>
            <p className="text-3xl mt-2">{stats.interviewStage}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Applications this week</CardTitle>
            <CardDescription>By day of week (from applied date)</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.totalApplications === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No applications yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={applicationsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#0066cc" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open roles by category</CardTitle>
            <CardDescription>Your active postings</CardDescription>
          </CardHeader>
          <CardContent>
            {skillDemand.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No active jobs posted.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={skillDemand} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="skill" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="demand" fill="#0066cc" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent applications</CardTitle>
            <CardDescription>Latest candidates applying to your roles</CardDescription>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No applications yet. Post a job or share your listings.
              </p>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-start justify-between pb-4 border-b last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{row.candidateName}</p>
                      <p className="text-sm text-muted-foreground">{row.jobTitle}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {formatApplicationStatus(row.status)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {timeAgo(row.appliedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => onNavigate("talent-search")}>
              <Search className="w-4 h-4 mr-2" />
              Search candidates
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => onNavigate("applications")}>
              <Calendar className="w-4 h-4 mr-2" />
              View applications
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => onNavigate("jobs")}>
              <FileText className="w-4 h-4 mr-2" />
              Your job postings
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => onNavigate("talent-search")}>
              <Users className="w-4 h-4 mr-2" />
              Browse talent pool
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
