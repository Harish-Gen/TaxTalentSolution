import { useState } from "react";
import { assetUrl } from "../utils/appPaths";
import { Button } from "./ui/button";
import { useEmployerPortal } from "../hooks/useEmployerPortal";
import { useNotifications } from "../database";
import { isUuid } from "../api/userAssessmentService";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { EmployerDashboard } from "./employer/EmployerDashboard";
import { TalentSearch } from "./employer/TalentSearch";
import { CandidateProfileView } from "./employer/CandidateProfileView";
import { EmployerApplications } from "./employer/EmployerApplications";
import { EmployerJobs } from "./employer/EmployerJobs";
import { EmployerSettings } from "./employer/EmployerSettings";
import {
  LayoutDashboard,
  Search,
  Building2,
  Calendar,
  Settings,
  Bell,
  LogOut,
  FileText,
} from "lucide-react";

interface EmployerPortalProps {
  user: { id?: string; email?: string; user_metadata?: { company?: string } };
  onLogout: () => void;
}

type EmployerSection =
  | "dashboard"
  | "talent-search"
  | "candidate-profile"
  | "applications"
  | "jobs"
  | "settings";

export function EmployerPortal({ user, onLogout }: EmployerPortalProps) {
  const [activeSection, setActiveSection] = useState<EmployerSection>("dashboard");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const userId = user?.id;
  const { employerId, employerName, setEmployerName } = useEmployerPortal(
    userId,
    user?.email
  );
  const { notifications, unreadCount } = useNotifications(
    userId && isUuid(userId) ? userId : undefined
  );

  const navigationItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "talent-search" as const, label: "Search Talent", icon: Search },
    { id: "jobs" as const, label: "Job Postings", icon: FileText },
    { id: "applications" as const, label: "Applications", icon: Calendar },
    { id: "settings" as const, label: "Settings", icon: Settings },
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
    setActiveSection(section as EmployerSection);
  };

  const sectionTitle =
    activeSection === "candidate-profile"
      ? "Candidate Profile"
      : navigationItems.find((item) => item.id === activeSection)?.label || "Dashboard";

  const sectionSubtitle: Record<EmployerSection, string> = {
    dashboard: "Overview of your recruitment activities",
    "talent-search": "Search and filter tax professionals",
    "candidate-profile": "Detailed candidate information",
    applications: "Manage applications to your job postings",
    jobs: "Your active and draft job listings",
    settings: "Configure your employer account",
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <EmployerDashboard userId={userId} userEmail={user.email} onNavigate={handleNavigate} />
        );
      case "talent-search":
        return (
          <TalentSearch
            onViewProfile={handleViewProfile}
            employerId={employerId}
            userId={userId}
          />
        );
      case "candidate-profile":
        return selectedCandidateId ? (
          <CandidateProfileView
            candidateId={selectedCandidateId}
            employerId={employerId}
            userId={userId}
            onBack={handleBackFromProfile}
          />
        ) : (
          <TalentSearch
            onViewProfile={handleViewProfile}
            employerId={employerId}
            userId={userId}
          />
        );
      case "applications":
        return (
          <EmployerApplications
            userId={userId}
            userEmail={user.email}
            onViewCandidate={handleViewProfile}
          />
        );
      case "jobs":
        return <EmployerJobs userId={userId} userEmail={user.email} />;
      case "settings":
        return (
          <EmployerSettings
            userId={userId}
            userEmail={user.email}
            onEmployerUpdated={setEmployerName}
          />
        );
      default:
        return (
          <EmployerDashboard userId={userId} userEmail={user.email} onNavigate={handleNavigate} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20 flex">
      <div className="w-52 bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0 h-screen">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-2 mb-1">
            <img
              src={assetUrl("images/logo.png")}
              alt="Tax Talent Solution"
              className="h-8 w-8 rounded-full"
            />
            <h1 className="text-lg font-semibold text-sidebar-primary">Tax Talent Solution</h1>
          </div>
          <span className="text-xs text-sidebar-foreground/70 ml-10">Employer Portal</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
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

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-8 h-8 bg-sidebar-primary text-sidebar-primary-foreground rounded-full flex items-center justify-center text-sm">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {employerName || user.user_metadata?.company || "Employer Account"}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 px-2"
              onClick={() => setActiveSection("settings")}
            >
              <Settings className="w-3.5 h-3.5" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 px-2 relative"
                  title="Notifications"
                  disabled={!userId || !isUuid(userId)}
                >
                  <Bell className="w-3.5 h-3.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <p className="font-medium text-sm mb-2">Notifications</p>
                {notifications.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No notifications</p>
                ) : (
                  <ul className="space-y-2 max-h-64 overflow-auto">
                    {notifications.slice(0, 8).map((n) => (
                      <li key={n.id} className="text-xs border-b pb-2">
                        <p className="font-medium">{n.title}</p>
                        {n.message && (
                          <p className="text-muted-foreground mt-0.5">{n.message}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="sm" className="flex-1 px-2" onClick={onLogout}>
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">{sectionTitle}</h2>
            <p className="text-sm text-muted-foreground">
              {sectionSubtitle[activeSection === "candidate-profile" ? "candidate-profile" : activeSection]}
            </p>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">{renderContent()}</div>
      </div>
    </div>
  );
}
