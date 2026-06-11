import { useState } from "react";
import { assetUrl } from "../utils/appPaths";
import { Button } from "./ui/button";
import { AdminDashboard } from "./admin/AdminDashboard";
import { CandidateManagement } from "./admin/CandidateManagement";
import { AssessmentManagement } from "./admin/AssessmentManagement";
import { EmployerManagement } from "./admin/EmployerManagement";
import { UserManagement } from "./admin/UserManagement";
import { JobManagement } from "./admin/JobManagement";
import { ResumeImport } from "./admin/ResumeImport";
import { AdminSettings } from "./admin/AdminSettings";
import { TalentSearch } from "./employer/TalentSearch";
import { CandidateProfileView } from "./employer/CandidateProfileView";
import { 
  LayoutDashboard,
  Users,
  Award,
  Building2,
  Settings,
  Bell,
  LogOut,
  Shield,
  UserCog,
  Briefcase,
  FileUp,
  Search
} from "lucide-react";

interface AdminPortalProps {
  user: any;
  onLogout: () => void;
}

type AdminSection = 
  | "dashboard" 
  | "talent-search"
  | "candidate-profile"
  | "candidate-management" 
  | "assessment-management" 
  | "employer-management" 
  | "user-management" 
  | "job-management" 
  | "resume-import" 
  | "settings";

export function AdminPortal({ user, onLogout }: AdminPortalProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "talent-search", label: "Search Talent", icon: Search },
    { id: "candidate-management", label: "Candidates", icon: Users },
    { id: "assessment-management", label: "Assessments", icon: Award },
    { id: "employer-management", label: "Employers", icon: Building2 },
    { id: "job-management", label: "Jobs", icon: Briefcase },
    { id: "user-management", label: "Users", icon: UserCog },
    { id: "resume-import", label: "Resume Import", icon: FileUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleViewProfile = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setActiveSection("candidate-profile");
  };

  const handleBackFromProfile = () => {
    setActiveSection("talent-search");
    setSelectedCandidateId(null);
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section as AdminSection);
  };

  const sectionTitle =
    activeSection === "candidate-profile"
      ? "Candidate Profile"
      : navigationItems.find((item) => item.id === activeSection)?.label || "Dashboard";

  const sectionSubtitle: Record<AdminSection, string> = {
    dashboard: "Platform overview and analytics",
    "talent-search": "Search and filter tax professionals",
    "candidate-profile": "Detailed candidate information",
    "candidate-management": "Manage candidate profiles and approvals",
    "assessment-management": "Create and manage skill assessments",
    "employer-management": "Manage employer accounts and subscriptions",
    "job-management": "Manage active and draft job listings",
    "user-management": "Manage platform users and account associations",
    "resume-import": "Bulk upload and parse candidate resumes",
    settings: "Configure platform settings",
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard onNavigate={handleNavigate} />;
      case "talent-search":
        return (
          <TalentSearch
            onViewProfile={handleViewProfile}
            userId={user?.id}
          />
        );
      case "candidate-profile":
        return selectedCandidateId ? (
          <CandidateProfileView
            candidateId={selectedCandidateId}
            userId={user?.id}
            onBack={handleBackFromProfile}
          />
        ) : (
          <TalentSearch
            onViewProfile={handleViewProfile}
            userId={user?.id}
          />
        );
      case "candidate-management":
        return <CandidateManagement />;
      case "assessment-management":
        return <AssessmentManagement />;
      case "employer-management":
        return <EmployerManagement />;
      case "job-management":
        return <JobManagement />;
      case "user-management":
        return <UserManagement />;
      case "resume-import":
        return <ResumeImport />;
      case "settings":
        return <AdminSettings user={user} />;
      default:
        return <AdminDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20 flex">
      {/* Sidebar */}
      <div className="w-52 bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0 h-screen">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-2">
            <img src={assetUrl("images/logo.png")} alt="Tax Talent Solution" className="h-8 w-8 rounded-full" />
            <div>
              <h1 className="text-lg font-semibold text-sidebar-primary">Tax Talent Solution</h1>
              <span className="text-xs text-sidebar-foreground/70">Admin Portal</span>
            </div>
          </div>
        </div>

        {/* Vertical Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as AdminSection);
                  setSelectedCandidateId(null);
                }}
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
            <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user.user_metadata?.name || "Admin"}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                Administrator
              </p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 px-2"
              onClick={() => {
                setActiveSection("settings");
                setSelectedCandidateId(null);
              }}
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 px-2">
              <Bell className="w-3.5 h-3.5" />
            </Button>
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
                  {sectionTitle}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {sectionSubtitle[activeSection]}
                </p>
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
