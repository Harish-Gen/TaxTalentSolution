import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Activity, 
  Eye, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Building,
  Calendar,
  MessageSquare,
  Phone,
  Video,
  Mail,
  Loader2
} from "lucide-react";
import { useCandidateApplications, useJobs, useEmployers, useInterviews } from "../../database";

export function StatusTracker() {
  const [activeTab, setActiveTab] = useState("applications");
  
  // Use database hooks - for demo, using candidate ID 1
  const { applications: dbApplications, loading: appsLoading } = useCandidateApplications(1);
  const { jobs, loading: jobsLoading } = useJobs();
  const { employers, loading: employersLoading } = useEmployers();
  const { interviews } = useInterviews();
  
  const loading = appsLoading || jobsLoading || employersLoading;

  // Transform database applications to display format
  const transformedApplications = dbApplications.map(app => {
    const job = jobs.find(j => j.id === app.jobId);
    const employer = employers.find(e => e.id === job?.employerId);
    const interview = interviews.find(i => i.applicationId === app.id);
    
    const getProgress = (status: string) => {
      switch(status) {
        case 'submitted': return 20;
        case 'under_review': return 40;
        case 'shortlisted': return 60;
        case 'interview_scheduled': return 75;
        case 'offer_extended': return 90;
        case 'hired': return 100;
        case 'rejected': return 100;
        case 'withdrawn': return 100;
        default: return 20;
      }
    };
    
    const getDisplayStatus = (status: string) => {
      const statusMap: Record<string, string> = {
        'submitted': 'Application Submitted',
        'under_review': 'Under Review',
        'shortlisted': 'Shortlisted',
        'interview_scheduled': 'Interview Scheduled',
        'offer_extended': 'Offer Received',
        'hired': 'Hired',
        'rejected': 'Rejected',
        'withdrawn': 'Withdrawn'
      };
      return statusMap[status] || status;
    };
    
    const getStage = (status: string) => {
      if (status === 'interview_scheduled') return 'interview';
      if (status === 'rejected') return 'rejected';
      if (status === 'under_review' || status === 'shortlisted') return 'review';
      if (status === 'submitted') return 'submitted';
      return 'submitted';
    };
    
    return {
      id: app.id,
      jobTitle: job?.title || 'Unknown Position',
      company: employer?.companyName || 'Unknown Company',
      appliedDate: new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: getDisplayStatus(app.status),
      stage: getStage(app.status),
      progress: getProgress(app.status),
      nextStep: interview ? `Interview on ${new Date(interview.scheduledAt).toLocaleDateString()}` : 'Waiting for response',
      recruiterContact: "Recruiter",
      recruiterEmail: `hr@${employer?.companyName?.toLowerCase().replace(/\s+/g, '')}.com`,
      interviewType: interview?.interviewType || undefined,
      interviewTime: interview ? new Date(interview.scheduledAt).toLocaleString() : undefined,
      statusHistory: [
        { date: new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), action: "Application Submitted", status: "completed" },
        { date: app.status !== 'submitted' ? "Done" : "TBD", action: "Application Reviewed", status: app.status !== 'submitted' ? "completed" : "pending" },
        { date: interview ? new Date(interview.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "TBD", action: "Interview", status: interview ? "upcoming" : "pending" },
        { date: "TBD", action: "Decision", status: "pending" }
      ]
    };
  });

  // Fallback to hardcoded data if no database data
  const applications = transformedApplications.length > 0 ? transformedApplications : [
    {
      id: 1,
      jobTitle: "Senior Tax Associate",
      company: "Deloitte India",
      appliedDate: "March 10, 2024",
      status: "Interview Scheduled",
      stage: "interview",
      progress: 75,
      nextStep: "Technical Interview on March 18, 2024",
      recruiterContact: "Sarah Johnson",
      recruiterEmail: "sarah.johnson@deloitte.com",
      interviewType: "Video Call",
      interviewTime: "March 18, 2024 at 2:00 PM IST",
      statusHistory: [
        { date: "March 10", action: "Application Submitted", status: "completed" },
        { date: "March 12", action: "Application Reviewed", status: "completed" },
        { date: "March 14", action: "HR Screening Call", status: "completed" },
        { date: "March 18", action: "Technical Interview", status: "upcoming" },
        { date: "TBD", action: "Final Interview", status: "pending" },
        { date: "TBD", action: "Decision", status: "pending" }
      ]
    },
    {
      id: 2,
      jobTitle: "US Tax Manager",
      company: "EY GDS",
      appliedDate: "March 8, 2024",
      status: "Under Review",
      stage: "review",
      progress: 40,
      nextStep: "Awaiting recruiter response",
      recruiterContact: "Michael Chen",
      recruiterEmail: "michael.chen@ey.com",
      statusHistory: [
        { date: "March 8", action: "Application Submitted", status: "completed" },
        { date: "March 10", action: "Application Reviewed", status: "completed" },
        { date: "TBD", action: "HR Screening", status: "pending" },
        { date: "TBD", action: "Technical Interview", status: "pending" },
        { date: "TBD", action: "Final Interview", status: "pending" },
        { date: "TBD", action: "Decision", status: "pending" }
      ]
    },
    {
      id: 3,
      jobTitle: "Tax Consultant",
      company: "KPMG India",
      appliedDate: "March 5, 2024",
      status: "Rejected",
      stage: "rejected",
      progress: 100,
      nextStep: "Application closed",
      feedback: "Strong technical skills but looking for more partnership experience",
      statusHistory: [
        { date: "March 5", action: "Application Submitted", status: "completed" },
        { date: "March 7", action: "Application Reviewed", status: "completed" },
        { date: "March 9", action: "HR Screening Call", status: "completed" },
        { date: "March 12", action: "Decision - Not Selected", status: "rejected" }
      ]
    },
    {
      id: 4,
      jobTitle: "Senior Tax Analyst",
      company: "Genpact",
      appliedDate: "March 15, 2024",
      status: "Application Submitted",
      stage: "submitted",
      progress: 20,
      nextStep: "Waiting for initial review",
      statusHistory: [
        { date: "March 15", action: "Application Submitted", status: "completed" },
        { date: "TBD", action: "Application Review", status: "pending" },
        { date: "TBD", action: "HR Screening", status: "pending" },
        { date: "TBD", action: "Technical Interview", status: "pending" },
        { date: "TBD", action: "Final Interview", status: "pending" },
        { date: "TBD", action: "Decision", status: "pending" }
      ]
    }
  ];

  const profileViews = [
    {
      date: "March 16, 2024",
      company: "Accenture India",
      recruiter: "Jessica Williams",
      position: "HR Manager",
      viewType: "Full Profile"
    },
    {
      date: "March 15, 2024",
      company: "Wipro",
      recruiter: "Rajesh Kumar",
      position: "Talent Acquisition",
      viewType: "Basic Profile"
    },
    {
      date: "March 14, 2024",
      company: "TCS",
      recruiter: "Priya Sharma",
      position: "Senior Recruiter",
      viewType: "Full Profile"
    },
    {
      date: "March 12, 2024",
      company: "Infosys",
      recruiter: "David Miller",
      position: "Recruitment Lead",
      viewType: "Skills Only"
    },
    {
      date: "March 10, 2024",
      company: "Cognizant",
      recruiter: "Lisa Thompson",
      position: "HR Business Partner",
      viewType: "Full Profile"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Interview Scheduled": return "bg-blue-100 text-blue-800";
      case "Under Review": return "bg-yellow-100 text-yellow-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Application Submitted": return "bg-gray-100 text-gray-800";
      case "Offer Received": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "interview": return <Video className="w-5 h-5 text-blue-600" />;
      case "review": return <Eye className="w-5 h-5 text-yellow-600" />;
      case "rejected": return <XCircle className="w-5 h-5 text-red-600" />;
      case "submitted": return <FileText className="w-5 h-5 text-gray-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getHistoryIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "upcoming": return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading application status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Activity className="w-6 h-6 mr-2" />
            Application Status & Activity
          </CardTitle>
          <p className="text-muted-foreground">
            Track your job applications, profile views, and recruitment activity
          </p>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">4</div>
            <div className="text-sm text-muted-foreground">Active Applications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Profile Views (7 days)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Video className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">1</div>
            <div className="text-sm text-muted-foreground">Interviews Scheduled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-muted-foreground">Recruiter Messages</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications">Job Applications</TabsTrigger>
          <TabsTrigger value="activity">Profile Activity</TabsTrigger>
        </TabsList>

        {/* Job Applications */}
        <TabsContent value="applications" className="space-y-4">
          <div className="grid gap-4">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Application Overview */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          {getStageIcon(app.stage)}
                          <div>
                            <h3 className="text-lg font-semibold">{app.jobTitle}</h3>
                            <p className="text-primary font-medium">{app.company}</p>
                            <p className="text-sm text-muted-foreground">Applied on {app.appliedDate}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Application Progress</span>
                          <span>{app.progress}%</span>
                        </div>
                        <Progress value={app.progress} className="h-2" />
                      </div>

                      {/* Next Step */}
                      <div className="mb-4 p-3 bg-secondary/50 rounded-lg">
                        <h4 className="font-medium mb-1">Next Step</h4>
                        <p className="text-sm text-muted-foreground">{app.nextStep}</p>
                        {app.interviewTime && (
                          <div className="flex items-center mt-2 text-sm">
                            <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                            <span className="font-medium">{app.interviewTime}</span>
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      {app.recruiterContact && (
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Recruiter: </span>
                            <span className="font-medium">{app.recruiterContact}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Mail className="w-4 h-4 mr-1" />
                              Email
                            </Button>
                            {app.stage === "interview" && (
                              <Button size="sm">
                                <Video className="w-4 h-4 mr-1" />
                                Join Call
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Feedback for rejected applications */}
                      {app.feedback && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-medium text-red-800 mb-1">Feedback</h4>
                          <p className="text-sm text-red-700">{app.feedback}</p>
                        </div>
                      )}
                    </div>

                    {/* Status Timeline */}
                    <div className="lg:w-80">
                      <h4 className="font-medium mb-3">Application Timeline</h4>
                      <div className="space-y-3">
                        {app.statusHistory.map((item, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            {getHistoryIcon(item.status)}
                            <div className="flex-1">
                              <div className="text-sm font-medium">{item.action}</div>
                              <div className="text-xs text-muted-foreground">{item.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Profile Activity */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Recent Profile Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profileViews.map((view, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Building className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{view.recruiter}</p>
                        <p className="text-sm text-muted-foreground">{view.position} at {view.company}</p>
                        <p className="text-xs text-muted-foreground">{view.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {view.viewType}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}