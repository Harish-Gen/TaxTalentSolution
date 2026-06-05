import { useState, useEffect } from "react";
import { LoginPage, type SignupRole } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { EmployerPortal } from "./components/EmployerPortal";
import { AdminPortal } from "./components/AdminPortal";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { Pricing } from "./components/Pricing";
import { Testimonials } from "./components/Testimonials";
import { Articles } from "./components/Articles";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import { EmployerInfo } from "./components/EmployerInfo";
import { Separator } from "./components/ui/separator";
import { supabase } from "./utils/supabase/client";
import { PaymentModal, PendingPlan } from "./components/PaymentModal";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { CookieConsent } from "./components/CookieConsent";
import { TermsOfService } from "./components/TermsOfService";
import { About } from "./components/About";
import { EntraAuthRedirect } from "./components/EntraAuthRedirect";
import { initializeFromStorage, activateSubscription } from "./database/userStore";
import type { CandidatePlan, BillingCycle } from "./database/types";
import {
  clearAuthSession,
  getAuthToken,
  getStoredEntraUser,
  hasActiveEntraSession,
  isTokenExpired,
} from "./utils/entra/tokenUtils";
import {
  clearAuthBridgeQueryFromUrl,
  isAuthBridgeReturnUrl,
  pushAuthBridgeHistory,
  type EntraAuthMode,
} from "./utils/entra/entraAuthService";
import { setLoginSessionRole } from "./utils/sessionRole";
import { clearSignupIntent, setSignupIntent } from "./utils/entra/signupIntent";

type View =
  | "landing"
  | "login"
  | "entra-auth"
  | "dashboard"
  | "employer-portal"
  | "admin-portal"
  | "employer-info"
  | "privacy-policy"
  | "terms-of-service"
  | "about";

type LoginPageConfig = {
  mode: "login" | "signup";
  signupRole: SignupRole;
  lockSignupRole: boolean;
};

const DEFAULT_LOGIN_CONFIG: LoginPageConfig = {
  mode: "login",
  signupRole: "candidate",
  lockSignupRole: false,
};

const VIEW_PARAM_MAP: Record<string, View> = {
  dashboard: "dashboard",
  "employer-portal": "employer-portal",
  "admin-portal": "admin-portal",
  login: "login",
  landing: "landing",
};

function viewFromEntraRole(role?: string): View {
  if (role === "admin") return "admin-portal";
  if (role === "employer") return "employer-portal";
  return "dashboard";
}

function initialViewFromUrl(): View | null {
  const viewParam = new URLSearchParams(window.location.search).get("view");
  return viewParam ? VIEW_PARAM_MAP[viewParam] ?? null : null;
}

function readInitialAuthState(): { user: any | null; view: View } {
  if (isAuthBridgeReturnUrl()) {
    return { user: null, view: "landing" };
  }

  const entraToken = getAuthToken();
  const entraUser = getStoredEntraUser();
  if (entraToken && entraUser && !isTokenExpired(entraToken)) {
    const role =
      (entraUser.user_metadata as { role?: string })?.role ?? "candidate";
    return {
      user: entraUser,
      view: initialViewFromUrl() ?? viewFromEntraRole(role),
    };
  }
  return { user: null, view: "landing" };
}

export default function App() {
  const initialAuth = readInitialAuthState();
  const [currentView, setCurrentView] = useState<View>(initialAuth.view);
  const [user, setUser] = useState<any>(initialAuth.user);
  const [loading, setLoading] = useState(true);
  const [pendingPlan, setPendingPlan] = useState<PendingPlan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [privacyScrollTarget, setPrivacyScrollTarget] = useState<string | undefined>(undefined);
  const [showLinkedInLoading, setShowLinkedInLoading] = useState(false);
  const [loginPageConfig, setLoginPageConfig] = useState<LoginPageConfig>(DEFAULT_LOGIN_CONFIG);
  const [entraAuthBridge, setEntraAuthBridge] = useState<{
    mode: EntraAuthMode;
    signupRole: SignupRole;
  }>({ mode: "signup", signupRole: "candidate" });

  useEffect(() => {
    // Re-hydrate localStorage-registered accounts into in-memory DB
    initializeFromStorage();
  }, []);

  useEffect(() => {
    // Check for existing session (Entra or Supabase)
    const checkSession = async () => {
      if (isAuthBridgeReturnUrl()) {
        clearAuthBridgeQueryFromUrl();
        setUser(null);
        setCurrentView("landing");
        setLoading(false);
        return;
      }

      const entraToken = getAuthToken();
      const entraUser = getStoredEntraUser();
      if (entraToken && entraUser && !isTokenExpired(entraToken)) {
        setUser(entraUser);
        const role =
          (entraUser.user_metadata as { role?: string })?.role ?? "candidate";
        setCurrentView(initialViewFromUrl() ?? viewFromEntraRole(role));
        setLoading(false);
        return;
      }
      if (entraToken && isTokenExpired(entraToken)) {
        clearAuthSession();
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setCurrentView(initialViewFromUrl() ?? "dashboard");
      }
      setLoading(false);
    };

    checkSession();

    // Supabase listener — do not clear Entra session when Supabase has no session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (hasActiveEntraSession()) {
          setLoading(false);
          return;
        }
        if (session?.user) {
          setUser(session.user);
          setCurrentView(initialViewFromUrl() ?? "dashboard");
        } else {
          setUser(null);
          setCurrentView("landing");
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);


  const handleLinkedInMatch = () => {
    setShowLinkedInLoading(true);
    setTimeout(() => setShowLinkedInLoading(false), 3000);
  };

  const handleLocalLogin = (mockUser: any) => {
    setUser(mockUser);
    const role = mockUser.user_metadata?.role;
    if (role === "admin") {
      setCurrentView("admin-portal");
    } else if (role === "employer") {
      setCurrentView("employer-portal");
    } else {
      setCurrentView("dashboard");
      if (pendingPlan && pendingPlan.price !== "Free") {
        setShowPayment(true);
      } else {
        setPendingPlan(null);
      }
    }
  };

  const openAuthPage = (
    mode: "login" | "signup",
    signupRole: SignupRole = "candidate",
    lockSignupRole = mode === "signup"
  ) => {
    setLoginPageConfig({ mode, signupRole, lockSignupRole });
    setCurrentView("login");
  };

  const beginEntraAuth = (mode: EntraAuthMode, signupRole: SignupRole = "candidate") => {
    setUser(null);
    setEntraAuthBridge({ mode, signupRole });
    setLoginSessionRole(signupRole === "employer_user" ? "employer" : "candidate");
    if (mode === "signup") {
      setSignupIntent(signupRole);
    } else {
      clearSignupIntent();
    }
    pushAuthBridgeHistory(mode);
    setCurrentView("entra-auth");
  };

  const handleCandidateLogin = () => beginEntraAuth("login", "candidate");

  const handleEmployerLogin = () => beginEntraAuth("login", "employer_user");

  const handleCandidateSignUp = () => beginEntraAuth("signup", "candidate");

  const handleEmployerSignUp = () => beginEntraAuth("signup", "employer_user");

  const handlePricingGetStarted = (plan: PendingPlan) => {
    setPendingPlan(plan);
    beginEntraAuth("signup", "candidate");
  };

  const handleShowEmployerInfo = () => {
    setCurrentView("employer-info");
  };

  const handleBackToLanding = () => {
    clearAuthBridgeQueryFromUrl();
    setCurrentView("landing");
  };

  const handleLogout = async () => {
    clearAuthSession();
    await supabase.auth.signOut();
    setUser(null);
    setCurrentView("landing");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const linkedInOverlay = showLinkedInLoading ? (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-10 rounded-2xl shadow-2xl bg-white border border-blue-100">
        <div className="relative w-16 h-16">
          <svg className="animate-spin w-16 h-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7 fill-blue-700">
              <path d="M20.447 20.452H16.89v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a1.98 1.98 0 11-.001-3.96 1.98 1.98 0 010 3.96zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-blue-800">Loading from LinkedIn</p>
          <p className="text-sm text-gray-500 mt-1">Importing your professional profile...</p>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
        </div>
      </div>
    </div>
  ) : null;

  if (currentView === "entra-auth") {
    const { mode, signupRole } = entraAuthBridge;
    return (
      <>
        <EntraAuthRedirect
          mode={mode}
          signupRole={signupRole}
          onBack={handleBackToLanding}
          onFallback={() =>
            openAuthPage(mode === "signup" ? "signup" : "login", signupRole, mode === "signup")
          }
        />
        <Toaster />
      </>
    );
  }

  if (currentView === "login") {
    return (
      <>
        {linkedInOverlay}
        <LoginPage
          key={`${loginPageConfig.mode}-${loginPageConfig.signupRole}-${loginPageConfig.lockSignupRole}`}
          onBack={handleBackToLanding}
          onLocalLogin={handleLocalLogin}
          onLinkedInMatch={handleLinkedInMatch}
          initialMode={loginPageConfig.mode}
          initialSignupRole={loginPageConfig.signupRole}
          lockSignupRole={loginPageConfig.lockSignupRole}
        />
        <Toaster />
      </>
    );
  }

  if (currentView === "dashboard" && user) {
    return (
      <>
        {linkedInOverlay}
        <Dashboard user={user} onLogout={handleLogout} />
        {showPayment && pendingPlan && (
          <PaymentModal
            plan={pendingPlan}
            onClose={() => { setShowPayment(false); setPendingPlan(null); }}
            onSuccess={() => {
              // Map Pricing plan names → CandidatePlan type
              const planMap: Record<string, CandidatePlan> = {
                'Professional': 'free',
                'Professional Pro': 'professional',
                'Premium': 'premium',
              };
              const candidatePlan: CandidatePlan = planMap[pendingPlan.name] ?? 'free';
              const billing: BillingCycle = pendingPlan.billing ?? 'monthly';
              if (user?.id) {
                activateSubscription(user.id, candidatePlan, billing);
              }
              setShowPayment(false);
              setPendingPlan(null);
            }}
          />
        )}
        <Toaster />
      </>
    );
  }

  if (currentView === "employer-portal" && user) {
    return (
      <>
        <EmployerPortal user={user} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  if (currentView === "admin-portal" && user) {
    return (
      <>
        <AdminPortal user={user} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  if (currentView === "employer-info") {
    return (
      <>
        <Header
          onLoginClick={handleEmployerLogin}
          onGetStartedClick={handleEmployerSignUp}
          onAboutClick={() => setCurrentView("about")}
        />
        <EmployerInfo
          onGetStartedClick={handleEmployerSignUp}
          onCandidateClick={handleBackToLanding}
        />
        <Footer onPrivacyPolicyClick={() => { setPrivacyScrollTarget(undefined); setCurrentView("privacy-policy"); }} onTermsClick={() => setCurrentView("terms-of-service")} onCookiePolicyClick={() => { setPrivacyScrollTarget("cookies"); setCurrentView("privacy-policy"); }} onAboutClick={() => setCurrentView("about")} />
        <Toaster />
      </>
    );
  }

  if (currentView === "privacy-policy") {
    return (
      <>
        <PrivacyPolicy onBack={handleBackToLanding} scrollToSection={privacyScrollTarget} />
        <Toaster />
      </>
    );
  }

  if (currentView === "terms-of-service") {
    return (
      <>
        <TermsOfService onBack={handleBackToLanding} />
        <Toaster />
      </>
    );
  }

  if (currentView === "about") {
    return (
      <>
        <About onBack={handleBackToLanding} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onLoginClick={handleCandidateLogin}
        onGetStartedClick={handleCandidateSignUp}
        onAboutClick={() => setCurrentView("about")}
      />
      <CookieConsent onPrivacyPolicyClick={() => setCurrentView("privacy-policy")} />
      <Hero onGetStartedClick={handleCandidateSignUp} onEmployersClick={handleShowEmployerInfo} />

      {/* Spacing and Separator */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Separator className="bg-border" />
      </div>

      <HowItWorks onGetStartedClick={handleCandidateSignUp} />
      <Features />
      <Articles />
      <Pricing onGetStarted={handlePricingGetStarted} />
      <Testimonials />
      <Footer onPrivacyPolicyClick={() => { setPrivacyScrollTarget(undefined); setCurrentView("privacy-policy"); }} onTermsClick={() => setCurrentView("terms-of-service")} onCookiePolicyClick={() => { setPrivacyScrollTarget("cookies"); setCurrentView("privacy-policy"); }} onAboutClick={() => setCurrentView("about")} />
      <Toaster />
    </div>
  );
}