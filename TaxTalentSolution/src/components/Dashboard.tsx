import { useState, useMemo } from "react";
import { loadProfile } from "../database/profileStore";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ProfilePage } from "./dashboard/ProfilePage";
import { Settings } from "./dashboard/Settings";
import { BestMatches } from "./dashboard/BestMatches";
import { AssessmentCertificates } from "./dashboard/AssessmentCertificates";
import { Jobs } from "./dashboard/Jobs";
import { JobDetails } from "./dashboard/JobDetails";
import { StatusTracker } from "./dashboard/StatusTracker";
import { SalaryInsights } from "./dashboard/SalaryInsights";
import { JobApplication } from "./dashboard/JobApplication";
import { Competencies } from "./dashboard/Competencies";
import { InterviewFeedback } from "./dashboard/InterviewFeedback";
import { 
  User, 
  Target, 
  Award, 
  Activity, 
  DollarSign, 
  LogOut,
  Bell,
  Settings as SettingsIcon,
  Briefcase,
  MessageSquare,
  CheckCircle2,
  Clock,
  X
} from "lucide-react";

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

type DashboardSection = "profile" | "competencies" | "matches" | "assessments" | "jobs" | "status" | "salary" | "job-application" | "job-details" | "interview-feedback" | "settings";

interface ApplicationData {
  jobTitle: string;
  companyName: string;
}

interface JobDetailsData {
  jobId: number;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<DashboardSection>("profile");

  const candidateName = useMemo(() => {
    if (user?.id) {
      const profile = loadProfile(user.id);
      if (profile?.name) return profile.name;
    }
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'Candidate';
  }, [user?.id]);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [jobDetailsData, setJobDetailsData] = useState<JobDetailsData | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "job",
      title: "New job match found",
      body: "Senior Tax Analyst at Deloitte matches your profile.",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      type: "application",
      title: "Application viewed",
      body: "Grant Thornton viewed your application for Tax Manager.",
      time: "1 hr ago",
      read: false,
    },
    {
      id: 3,
      type: "assessment",
      title: "Assessment available",
      body: "A new 1040 competency assessment is ready for you.",
      time: "3 hrs ago",
      read: true,
    },
    {
      id: 4,
      type: "system",
      title: "Profile completion",
      body: "Add your certifications to reach 100% profile completeness.",
      time: "Yesterday",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const dismissNotif = (id: number) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const notifIcon = (type: string) => {
    switch (type) {
      case "job":         return <Briefcase className="w-4 h-4 text-blue-500" />;
      case "application": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "assessment":  return <Award className="w-4 h-4 text-purple-500" />;
      default:            return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const navigationItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "competencies", label: "Competencies", icon: Award },
    { id: "assessments", label: "Assessments", icon: Award },
    { id: "salary", label: "Salary Insights", icon: DollarSign },
    { id: "matches", label: "Best Matches", icon: Target },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "status", label: "Status", icon: Activity },
    { id: "interview-feedback", label: "Interviews", icon: MessageSquare },
  ];

  const handleJobApplication = (jobTitle: string, companyName: string) => {
    setApplicationData({ jobTitle, companyName });
    setActiveSection("job-application");
  };

  const handleBackFromApplication = () => {
    setActiveSection("jobs");
    setApplicationData(null);
  };

  const handleViewJobDetails = (jobId: number) => {
    setJobDetailsData({ jobId });
    setActiveSection("job-details");
  };

  const handleBackFromJobDetails = () => {
    setActiveSection("jobs");
    setJobDetailsData(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <ProfilePage user={user} />;
      case "competencies":
        return <Competencies user={user} />;
      case "matches":
        return <BestMatches />;
      case "assessments":
        return <AssessmentCertificates user={user} />;
      case "jobs":
        return <Jobs onJobApplication={handleJobApplication} onViewDetails={handleViewJobDetails} />;
      case "status":
        return <StatusTracker />;
      case "salary":
        return <SalaryInsights />;
      case "job-application":
        return applicationData ? (
          <JobApplication
            jobTitle={applicationData.jobTitle}
            companyName={applicationData.companyName}
            onBack={handleBackFromApplication}
          />
        ) : (
          <Jobs onJobApplication={handleJobApplication} onViewDetails={handleViewJobDetails} />
        );
      case "job-details":
        return jobDetailsData ? (
          <JobDetails
            jobId={jobDetailsData.jobId}
            onBack={handleBackFromJobDetails}
            onJobApplication={handleJobApplication}
          />
        ) : (
          <Jobs onJobApplication={handleJobApplication} onViewDetails={handleViewJobDetails} />
        );
      case "interview-feedback":
        return <InterviewFeedback />;
      case "settings":
        return <Settings user={user} />;
      default:
        return <ProfilePage user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20 flex">
      {/* Vertical Sidebar */}
      <div className="w-52 bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0 h-screen">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-2 mb-1">
            <img src="/images/logo.png" alt="Tax Talent Solution" className="h-8 w-8 rounded-full" />
            <h1 className="text-lg font-semibold text-sidebar-primary">Tax Talent Solution</h1>
          </div>
          <span className="text-xs text-sidebar-foreground/70 ml-10">{candidateName}</span>
        </div>

        {/* Vertical Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as DashboardSection)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile in Sidebar */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-8 h-8 bg-sidebar-primary text-sidebar-primary-foreground rounded-full flex items-center justify-center text-sm">
              {(user.user_metadata?.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user.user_metadata?.name || user.email.split('@')[0]}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="flex-1 px-2" onClick={() => setActiveSection("settings")}>
              <SettingsIcon className="w-3.5 h-3.5" />
            </Button>

            {/* Notification Bell Popover */}
            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="flex-1 px-2 relative">
                  <Bell className="w-3.5 h-3.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="end"
                className="w-80 p-0 shadow-xl"
                sideOffset={8}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <Badge className="h-5 px-1.5 text-[10px] bg-red-500 text-white border-0">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-72 overflow-y-auto divide-y">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                      <Bell className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                          !notif.read ? "bg-blue-50/60" : "hover:bg-secondary/30"
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">{notifIcon(notif.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold leading-snug ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{notif.body}</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {notif.time}
                          </p>
                        </div>
                        <button
                          onClick={() => dismissNotif(notif.id)}
                          className="flex-shrink-0 text-muted-foreground/50 hover:text-muted-foreground mt-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Actions */}
                <Separator />
                <div className="flex items-center justify-between px-4 py-2.5">
                  <button
                    onClick={() => { setActiveSection("settings"); setNotifOpen(false); }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Notification settings
                  </button>
                  <button
                    onClick={() => setNotifications([])}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Clear all
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="ghost" size="sm" className="flex-1 px-2" onClick={onLogout}>
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {activeSection === "job-application" 
                    ? "Job Application" 
                    : activeSection === "job-details"
                      ? "Job Details"
                      : navigationItems.find(item => item.id === activeSection)?.label || "Dashboard"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {activeSection === "job-application"
                    ? "Complete your application for this position"
                    : activeSection === "job-details"
                      ? "View detailed job information and company details"
                      : "Manage your professional profile and opportunities"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {activeSection === "profile" && (
                  <Button variant="default" size="sm">
                    Upload Resume
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  Help & Support
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}