import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  Users, 
  Eye, 
  UserCheck, 
  Calendar,
  TrendingUp,
  Search,
  FileText,
  Clock,
  Award
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

// Mock data for employer dashboard
const statsData = {
  totalCandidatesViewed: 342,
  shortlistedProfiles: 28,
  activeSearches: 5,
  interviewRequests: 12,
  avgResponseTime: "2.3 hours",
  profileViewsThisWeek: 87
};

const viewsChartData = [
  { name: "Mon", views: 45 },
  { name: "Tue", views: 52 },
  { name: "Wed", views: 48 },
  { name: "Thu", views: 61 },
  { name: "Fri", views: 55 },
  { name: "Sat", views: 38 },
  { name: "Sun", views: 43 },
];

const skillDemandData = [
  { skill: "Form 1040", demand: 85 },
  { skill: "Form 1065", demand: 72 },
  { skill: "Form 1120", demand: 68 },
  { skill: "S Corp", demand: 55 },
  { skill: "Partnership", demand: 48 },
  { skill: "Private Equity", demand: 42 },
];

const recentActivities = [
  {
    id: 1,
    type: "shortlist",
    candidate: "Priya Sharma",
    action: "Shortlisted for Senior Tax Analyst position",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "view",
    candidate: "Rahul Verma",
    action: "Viewed profile",
    time: "4 hours ago",
  },
  {
    id: 3,
    type: "interview",
    candidate: "Sneha Patel",
    action: "Interview request sent",
    time: "1 day ago",
  },
  {
    id: 4,
    type: "shortlist",
    candidate: "Amit Kumar",
    action: "Shortlisted for Tax Consultant role",
    time: "1 day ago",
  },
  {
    id: 5,
    type: "view",
    candidate: "Deepika Singh",
    action: "Viewed profile",
    time: "2 days ago",
  },
];

interface EmployerDashboardProps {
  onNavigate: (section: string) => void;
}

export function EmployerDashboard({ onNavigate }: EmployerDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Candidates Viewed</p>
                <p className="text-3xl mt-2">{statsData.totalCandidatesViewed}</p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +12% this month
                </p>
              </div>
              <Eye className="w-10 h-10 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shortlisted Profiles</p>
                <p className="text-3xl mt-2">{statsData.shortlistedProfiles}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Active candidates
                </p>
              </div>
              <UserCheck className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Searches</p>
                <p className="text-3xl mt-2">{statsData.activeSearches}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ongoing recruitment
                </p>
              </div>
              <Search className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interview Requests</p>
                <p className="text-3xl mt-2">{statsData.interviewRequests}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pending responses
                </p>
              </div>
              <Calendar className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Views Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Views This Week</CardTitle>
            <CardDescription>
              Daily breakdown of candidate profile views
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={viewsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#0066cc" 
                  strokeWidth={2}
                  dot={{ fill: '#0066cc', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Demand */}
        <Card>
          <CardHeader>
            <CardTitle>Top Skills in Demand</CardTitle>
            <CardDescription>
              Most searched tax expertise areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={skillDemandData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="skill" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="demand" fill="#0066cc" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest interactions with candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === "shortlist" && (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                    {activity.type === "view" && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    {activity.type === "interview" && (
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.candidate}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onNavigate("talent-search")}
            >
              <Search className="w-4 h-4 mr-2" />
              Search Candidates
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onNavigate("talent-search")}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              View Shortlisted
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Interviews
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Award className="w-4 h-4 mr-2" />
              View Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
