import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  Users, 
  Building2, 
  Award, 
  TrendingUp,
  FileText,
  UserCheck,
  Clock,
  Activity,
  AlertCircle,
  Loader2,
  Briefcase
} from "lucide-react";
import { useMemo } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useDashboardStats, useCandidates, useEmployers, useUsers } from "../../database";

interface AdminDashboardProps {
  onNavigate: (section: string) => void;
}

function timeAgo(dateStr: string): string {
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  const m = Math.floor(diffDays / 30);
  if (m < 12) return `${m} month${m > 1 ? 's' : ''} ago`;
  const y = Math.floor(m / 12);
  return `${y} year${y > 1 ? 's' : ''} ago`;
}

function computeGrowthData(
  candidateList: { created_at: string }[],
  employerList: { created_at: string }[]
) {
  const allDates = [
    ...candidateList.map(c => new Date(c.created_at)),
    ...employerList.map(e => new Date(e.created_at)),
  ].filter(d => !isNaN(d.getTime())).sort((a, b) => a.getTime() - b.getTime());
  if (allDates.length === 0) return [];
  const latest = allDates[allDates.length - 1];
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(latest.getFullYear(), latest.getMonth() - (5 - i), 1);
    const yr = d.getFullYear(), mo = d.getMonth();
    const isBefore = (dt: Date) => dt.getFullYear() < yr || (dt.getFullYear() === yr && dt.getMonth() <= mo);
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      candidates: candidateList.filter(c => isBefore(new Date(c.created_at))).length,
      employers: employerList.filter(e => isBefore(new Date(e.created_at))).length,
    };
  });
}

const assessmentDistribution = [
  { name: "Form 1040", value: 450, color: "#0066cc" },
  { name: "Form 1065", value: 320, color: "#00cc66" },
  { name: "Form 1120", value: 280, color: "#cc6600" },
  { name: "S Corp", value: 210, color: "#cc0066" },
  { name: "Partnership", value: 180, color: "#6600cc" },
  { name: "Private Equity", value: 140, color: "#00cccc" },
];

const revenueData = [
  { month: "Jan", assessments: 245000, subscriptions: 178000 },
  { month: "Feb", assessments: 268000, subscriptions: 195000 },
  { month: "Mar", assessments: 292000, subscriptions: 212000 },
  { month: "Apr", assessments: 315000, subscriptions: 228000 },
  { month: "May", assessments: 338000, subscriptions: 245000 },
  { month: "Jun", assessments: 362000, subscriptions: 262000 },
];



export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { stats, loading } = useDashboardStats();
  const { candidates: candidateList } = useCandidates();
  const { employers: employerList } = useEmployers();
  const { users: userList } = useUsers();

  const userGrowthData = useMemo(
    () => computeGrowthData(candidateList, employerList),
    [candidateList, employerList]
  );

  const recentActions = useMemo(() => {
    type Item = { id: number; type: string; user: string; action: string; time: string; status: string; _date: Date };
    const items: Item[] = [
      ...candidateList.map(c => ({
        id: 0,
        type: 'candidate',
        user: userList.find(u => u.id === c.user_id)?.name || 'Unknown',
        action: c.status === 'pending' ? 'New candidate — pending review' : 'Candidate profile active',
        time: timeAgo(c.created_at),
        status: c.status === 'approved' ? 'success' : 'warning',
        _date: new Date(c.created_at),
      })),
      ...employerList.map(e => ({
        id: 0,
        type: 'employer',
        user: e.company_name,
        action: 'Employer account registered',
        time: timeAgo(e.created_at),
        status: 'success',
        _date: new Date(e.created_at),
      })),
    ];
    return items
      .sort((a, b) => b._date.getTime() - a._date.getTime())
      .slice(0, 5)
      .map((item, i) => ({ ...item, id: i + 1 }));
  }, [candidateList, employerList, userList]);
  
  // Use database stats or defaults
  const platformStats = {
    totalCandidates: stats?.totalCandidates || 0,
    approvedCandidates: stats?.approvedCandidates || 0,
    pendingCandidates: stats?.pendingCandidates || 0,
    totalEmployers: stats?.totalEmployers || 0,
    activeEmployers: stats?.activeEmployers || 0,
    completedAssessments: stats?.totalCertificates || 0,
    totalAssessments: stats?.totalAssessments || 0,
    avgAssessmentScore: 82.4,
    platformUptime: 99.8,
    totalJobs: stats?.totalJobs || 0,
    activeJobs: stats?.activeJobs || 0,
    totalApplications: stats?.totalApplications || 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate("candidate-management")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-3xl mt-2">{platformStats.totalCandidates.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {platformStats.approvedCandidates} approved · {platformStats.pendingCandidates} pending
                </p>
              </div>
              <Users className="w-10 h-10 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employers</p>
                <p className="text-3xl mt-2">{platformStats.totalEmployers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {platformStats.activeEmployers} active
                </p>
              </div>
              <Building2 className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate("assessment-management")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-3xl mt-2">{platformStats.activeJobs.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {platformStats.totalApplications} applications
                </p>
              </div>
              <Briefcase className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
                <p className="text-3xl mt-2">{platformStats.totalAssessments.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {platformStats.completedAssessments} certificates issued
                </p>
              </div>
              <Award className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
            <CardDescription>Candidates and employers over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="candidates" stroke="#0066cc" strokeWidth={2} name="Candidates" />
                <Line type="monotone" dataKey="employers" stroke="#00cc66" strokeWidth={2} name="Employers" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Assessment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Distribution</CardTitle>
            <CardDescription>By tax form category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assessmentDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {assessmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Assessments vs Subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="assessments" fill="#0066cc" name="Assessments" />
                <Bar dataKey="subscriptions" fill="#00cc66" name="Subscriptions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Platform metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Platform Uptime</span>
                <Badge className="bg-green-100 text-green-800">
                  {platformStats.platformUptime}%
                </Badge>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${platformStats.platformUptime}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Assessment Score</span>
                <Badge variant="outline">{platformStats.avgAssessmentScore}%</Badge>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${platformStats.avgAssessmentScore}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span className="text-sm">API Status</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Avg Response Time</span>
                </div>
                <span className="text-sm">124ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
          <CardDescription>Real-time system events and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActions.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 pb-3 border-b last:border-b-0">
                <div className="flex-shrink-0 mt-1">
                  {activity.type === "candidate" && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  {activity.type === "employer" && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  {activity.type === "assessment" && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  {activity.type === "alert" && (
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                      {activity.status === "success" && (
                        <Badge className="bg-green-100 text-green-800">Success</Badge>
                      )}
                      {activity.status === "warning" && (
                        <Badge className="bg-orange-100 text-orange-800">Warning</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">View All Activity</Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button 
          className="h-auto py-6 flex-col items-start" 
          variant="outline"
          onClick={() => onNavigate("candidate-management")}
        >
          <Users className="w-6 h-6 mb-2" />
          <span>Manage Candidates</span>
          <span className="text-xs text-muted-foreground mt-1">Review and approve profiles</span>
        </Button>
        <Button 
          className="h-auto py-6 flex-col items-start" 
          variant="outline"
          onClick={() => onNavigate("assessment-management")}
        >
          <Award className="w-6 h-6 mb-2" />
          <span>Manage Assessments</span>
          <span className="text-xs text-muted-foreground mt-1">Create and update tests</span>
        </Button>
        <Button className="h-auto py-6 flex-col items-start" variant="outline">
          <Building2 className="w-6 h-6 mb-2" />
          <span>Employer Accounts</span>
          <span className="text-xs text-muted-foreground mt-1">Manage subscriptions</span>
        </Button>
        <Button className="h-auto py-6 flex-col items-start" variant="outline">
          <FileText className="w-6 h-6 mb-2" />
          <span>Generate Reports</span>
          <span className="text-xs text-muted-foreground mt-1">Platform analytics</span>
        </Button>
      </div>
    </div>
  );
}
