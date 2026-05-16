import { useState } from "react";
import { assetUrl } from "../utils/appPaths";
import { Button } from "./ui/button";
import { EmployerDashboard } from "./employer/EmployerDashboard";
import { TalentSearch } from "./employer/TalentSearch";
import { CandidateProfileView } from "./employer/CandidateProfileView";
import { 
  LayoutDashboard,
  Search,
  Building2,
  Calendar,
  Settings,
  Bell,
  LogOut
} from "lucide-react";

interface EmployerPortalProps {
  user: any;
  onLogout: () => void;
}

type EmployerSection = "dashboard" | "talent-search" | "candidate-profile" | "interviews" | "settings";

interface CandidateProfileData {
  candidateId: number;
}

export function EmployerPortal({ user, onLogout }: EmployerPortalProps) {
  const [activeSection, setActiveSection] = useState<EmployerSection>("dashboard");
  const [candidateProfileData, setCandidateProfileData] = useState<CandidateProfileData | null>(null);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "talent-search", label: "Search Talent", icon: Search },
    { id: "interviews", label: "Interviews", icon: Calendar },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleViewProfile = (candidateId: number) => {
    setCandidateProfileData({ candidateId });
    setActiveSection("candidate-profile");
  };

  const handleBackFromProfile = () => {
    setActiveSection("talent-search");
    setCandidateProfileData(null);
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section as EmployerSection);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <EmployerDashboard onNavigate={handleNavigate} />;
      case "talent-search":
        return <TalentSearch onViewProfile={handleViewProfile} />;
      case "candidate-profile":
        return candidateProfileData ? (
          <CandidateProfileView
            candidateId={candidateProfileData.candidateId}
            onBack={handleBackFromProfile}
          />
        ) : (
          <TalentSearch onViewProfile={handleViewProfile} />
        );
      case "interviews":
        return (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Interview management coming soon</p>
          </div>
        );
      case "settings":
        return (
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Settings coming soon</p>
          </div>
        );
      default:
        return <EmployerDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20 flex">
      {/* Sidebar */}
      <div className="w-52 bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0 h-screen">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-2 mb-1">
            <img src={assetUrl("images/logo.png")} alt="Tax Talent Solution" className="h-8 w-8 rounded-full" />
            <h1 className="text-lg font-semibold text-sidebar-primary">Tax Talent Solution</h1>
          </div>
          <span className="text-xs text-sidebar-foreground/70 ml-10">Employer Portal</span>
        </div>

        {/* Vertical Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as EmployerSection)}
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
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user.user_metadata?.company || "Employer Account"}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="flex-1 px-2">
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
                  {activeSection === "candidate-profile" 
                    ? "Candidate Profile" 
                    : navigationItems.find(item => item.id === activeSection)?.label || "Dashboard"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {activeSection === "dashboard" && "Overview of your recruitment activities"}
                  {activeSection === "talent-search" && "Search and filter tax professionals"}
                  {activeSection === "candidate-profile" && "Detailed candidate information"}
                  {activeSection === "interviews" && "Manage your interview schedule"}
                  {activeSection === "settings" && "Configure your employer account"}
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
