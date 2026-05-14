import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import {
  Shield,
  ArrowLeft,
  Cookie,
  Lock,
  Eye,
  UserCheck,
  Globe,
  Mail,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import { resetConsent } from "./CookieConsent";

interface PrivacyPolicyProps {
  onBack: () => void;
  scrollToSection?: string;
}

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

function getCurrentConsent(): ConsentState | null {
  const stored = localStorage.getItem("tts_consent");
  return stored ? JSON.parse(stored) : null;
}

export function PrivacyPolicy({ onBack, scrollToSection }: PrivacyPolicyProps) {
  useEffect(() => {
    if (scrollToSection) {
      // Small delay to allow render before scrolling
      setTimeout(() => {
        const el = document.getElementById(scrollToSection);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [scrollToSection]);

  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(() => getCurrentConsent()?.analytics ?? false);
  const [marketing, setMarketing] = useState(() => getCurrentConsent()?.marketing ?? false);
  const [savedMsg, setSavedMsg] = useState(false);

  const savePreferences = () => {
    const consent: ConsentState = {
      necessary: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("tts_consent", JSON.stringify(consent));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "data-we-collect", label: "Data We Collect" },
    { id: "how-we-use", label: "How We Use Data" },
    { id: "sharing", label: "Data Sharing" },
    { id: "retention", label: "Data Retention" },
    { id: "your-rights", label: "Your Rights" },
    { id: "cookies", label: "Cookies & Tracking" },
    { id: "security", label: "Security" },
    { id: "contact", label: "Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">Privacy Policy</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
              GDPR Compliant
            </Badge>
            <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
              DPDP Compliant
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tax Talent Solution is committed to protecting your personal data. This policy
            explains what we collect, why we collect it, and how you can control it — in
            compliance with the <strong>EU General Data Protection Regulation (GDPR)</strong> and
            India's <strong>Digital Personal Data Protection Act, 2023 (DPDP)</strong>.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Last updated: <strong>April 30, 2026</strong> &nbsp;|&nbsp; Effective: April 30, 2026
          </p>
        </div>

        {/* Quick Nav */}
        <div className="bg-muted/40 rounded-xl p-6 mb-10">
          <p className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Jump to Section
          </p>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-sm px-3 py-1.5 rounded-md bg-white border hover:bg-primary hover:text-white hover:border-primary transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          {/* 1. Overview */}
          <section id="overview">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
              <h2 className="text-2xl font-bold">Overview</h2>
            </div>
            <div className="prose prose-sm max-w-none space-y-3 text-muted-foreground">
              <p>
                Tax Talent Solution ("<strong>TTS</strong>", "we", "our", "us") operates the platform at{" "}
                <strong>taxtalentsolution.com</strong> — a marketplace connecting US tax professionals
                (candidates) in India with accounting firms, CPA practices, and tax departments
                (employers) seeking their expertise.
              </p>
              <p>
                As the <strong>Data Controller</strong> under GDPR and <strong>Data Fiduciary</strong>{" "}
                under DPDP, we are responsible for how your personal data is processed. This policy
                applies to all users of our platform, including job seekers, employers, and visitors.
              </p>
              <p>
                By using Tax Talent Solution you agree to the collection and use of information as
                described in this policy. If you do not agree, please discontinue use of the platform.
              </p>
            </div>
          </section>

          <Separator />

          {/* 2. Data We Collect */}
          <section id="data-we-collect">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
              <h2 className="text-2xl font-bold">Data We Collect</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: <UserCheck className="w-5 h-5 text-blue-600" />,
                  title: "Account & Profile Data",
                  items: [
                    "Full name, email address, phone number",
                    "LinkedIn profile URL",
                    "Country of residence",
                    "Professional credentials and certifications",
                    "Work experience and educational background",
                    "Tax specialisation areas (e.g. 1040, 1065, 1120)",
                  ],
                },
                {
                  icon: <Eye className="w-5 h-5 text-purple-600" />,
                  title: "Usage & Behavioural Data",
                  items: [
                    "Pages visited and time spent",
                    "Job searches and application history",
                    "Assessment results and completion data",
                    "Device type, browser, IP address",
                    "Referral source and UTM parameters",
                  ],
                },
                {
                  icon: <Lock className="w-5 h-5 text-green-600" />,
                  title: "Authentication Data",
                  items: [
                    "Encrypted password (never stored in plain text)",
                    "OAuth tokens (Google, Microsoft/Azure AD B2C)",
                    "Session tokens and refresh tokens",
                    "Multi-factor authentication records",
                  ],
                },
                {
                  icon: <Globe className="w-5 h-5 text-orange-600" />,
                  title: "Communications Data",
                  items: [
                    "Messages sent via in-platform messaging",
                    "Support tickets and chat logs",
                    "Email correspondence with our team",
                    "Interview scheduling data",
                  ],
                },
              ].map((card) => (
                <div key={card.title} className="border rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {card.icon}
                    <h3 className="font-semibold">{card.title}</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* 3. How We Use Data */}
          <section id="how-we-use">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">3</div>
              <h2 className="text-2xl font-bold">How We Use Your Data</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 border rounded-tl-md font-semibold">Purpose</th>
                    <th className="text-left p-3 border font-semibold">Data Used</th>
                    <th className="text-left p-3 border rounded-tr-md font-semibold">Legal Basis (GDPR / DPDP)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Provide platform services (job matching, assessments)", "Profile, usage data", "Contract performance"],
                    ["Authenticate and secure your account", "Auth data, IP address", "Contract / Legitimate interest"],
                    ["Match candidates with relevant employers", "Skills, certifications, preferences", "Consent / Contract"],
                    ["Send job alerts and platform notifications", "Email, phone", "Consent"],
                    ["Improve platform features and UX", "Usage / behavioural data", "Legitimate interest"],
                    ["Fraud prevention and security monitoring", "IP address, device data", "Legitimate interest / Legal obligation"],
                    ["Comply with legal obligations", "Any data as required", "Legal obligation"],
                    ["Marketing communications (only if opted in)", "Email, name", "Consent"],
                  ].map(([purpose, data, basis], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                      <td className="p-3 border">{purpose}</td>
                      <td className="p-3 border text-muted-foreground">{data}</td>
                      <td className="p-3 border">
                        <Badge variant="outline" className="text-xs">{basis}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <Separator />

          {/* 4. Data Sharing */}
          <section id="sharing">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">4</div>
              <h2 className="text-2xl font-bold">Data Sharing & Third Parties</h2>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>We never sell your personal data.</strong> We only share data with third
                parties where necessary to provide the service, under strict data processing
                agreements.
              </p>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              {[
                { party: "Employers (Data Recipients)", detail: "Your profile, skills, and assessment results are shared with employers only when you apply for a job or give explicit consent for your profile to be searchable." },
                { party: "Supabase (Database & Auth)", detail: "Our database infrastructure provider processes data on our behalf under a Data Processing Agreement. Data is stored on secure servers in compliance with GDPR." },
                { party: "Microsoft Azure AD B2C (Auth)", detail: "Used for secure authentication. Microsoft processes authentication tokens as a data processor under GDPR-compliant terms." },
                { party: "Google Analytics (optional, consent-based)", detail: "If you accept analytics cookies, anonymised usage data may be processed by Google to help us improve the platform." },
                { party: "Legal Authorities", detail: "We may disclose data if required by law, court order, or to protect the rights and safety of our users or the public." },
              ].map(({ party, detail }) => (
                <div key={party} className="border rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-1">{party}</p>
                  <p>{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* 5. Data Retention */}
          <section id="retention">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">5</div>
              <h2 className="text-2xl font-bold">Data Retention</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>We retain personal data only as long as necessary for the purpose it was collected, or as required by applicable law.</p>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                {[
                  { period: "Duration of account", label: "Active Account Data", desc: "Profile, job history, and assessment records are retained for as long as your account is active." },
                  { period: "90 days", label: "Deleted Account Data", desc: "After account deletion, your data is anonymised and purged within 90 days, except where required by law." },
                  { period: "7 years", label: "Financial & Legal Records", desc: "Billing, payment, and compliance-related records are retained for 7 years per applicable tax and legal requirements." },
                ].map((item) => (
                  <div key={item.label} className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{item.period}</div>
                    <div className="font-semibold text-foreground mb-2">{item.label}</div>
                    <p className="text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Separator />

          {/* 6. Your Rights */}
          <section id="your-rights">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">6</div>
              <h2 className="text-2xl font-bold">Your Rights</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Under GDPR and India's DPDP Act you have the following rights over your personal data.
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@taxtalentsolution.com" className="text-primary underline">
                privacy@taxtalentsolution.com
              </a>
              . We will respond within <strong>30 days</strong>.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { right: "Right of Access", desc: "Request a copy of all personal data we hold about you." },
                { right: "Right to Rectification", desc: "Correct inaccurate or incomplete personal data." },
                { right: "Right to Erasure", desc: "Request deletion of your personal data ('right to be forgotten')." },
                { right: "Right to Data Portability", desc: "Receive your data in a machine-readable format (JSON/CSV)." },
                { right: "Right to Restrict Processing", desc: "Ask us to limit how we use your data while a dispute is resolved." },
                { right: "Right to Object", desc: "Object to processing based on legitimate interests or for direct marketing." },
                { right: "Right to Withdraw Consent", desc: "Withdraw cookie or marketing consent at any time without penalty." },
                { right: "Right to Lodge a Complaint", desc: "File a complaint with your national Data Protection Authority." },
              ].map(({ right, desc }) => (
                <div key={right} className="flex gap-3 border rounded-lg p-4">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{right}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* 7. Cookies */}
          <section id="cookies">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">7</div>
              <h2 className="text-2xl font-bold">Cookies &amp; Tracking</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              We use cookies and similar tracking technologies as described below. You can change
              your preferences at any time using the panel below.
            </p>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 border rounded-tl-md font-semibold">Category</th>
                    <th className="text-left p-3 border font-semibold">Examples</th>
                    <th className="text-left p-3 border font-semibold">Purpose</th>
                    <th className="text-left p-3 border rounded-tr-md font-semibold">Consent Required</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Necessary", "Session cookie, CSRF token, auth token", "Login, security, platform function", "No (always active)"],
                    ["Analytics", "Google Analytics (_ga, _gid)", "Understand page usage and improve UX", "Yes"],
                    ["Marketing", "Advertising pixels, remarketing tags", "Show relevant job or employer ads", "Yes"],
                  ].map(([cat, ex, purpose, consent], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                      <td className="p-3 border font-medium">{cat}</td>
                      <td className="p-3 border text-muted-foreground text-xs">{ex}</td>
                      <td className="p-3 border text-muted-foreground">{purpose}</td>
                      <td className="p-3 border">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            consent === "No (always active)"
                              ? "text-gray-500"
                              : "text-amber-700 border-amber-400"
                          }`}
                        >
                          {consent}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cookie Preferences Panel */}
            <div className="bg-muted/30 border-2 border-dashed border-muted-foreground/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Cookie className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Manage Your Cookie Preferences</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Your current consent choices are stored locally on this device. You can update them
                below at any time.
              </p>

              {!showPreferences ? (
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setShowPreferences(true)}
                    className="bg-[#0A3D62] hover:bg-[#0A3D62]/90 text-white"
                  >
                    <Cookie className="w-4 h-4 mr-2" />
                    Open Preferences
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetConsent}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset All Consent
                  </Button>
                </div>
              ) : (
                <div className="bg-white rounded-lg border p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Label className="font-medium">Necessary Cookies</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Always active — required for core platform function.</p>
                    </div>
                    <Checkbox checked disabled />
                  </div>
                  <Separator />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Label htmlFor="pp-analytics" className="font-medium">Analytics Cookies</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Help us understand platform usage (e.g. Google Analytics).</p>
                    </div>
                    <Checkbox
                      id="pp-analytics"
                      checked={analytics}
                      onCheckedChange={(v) => setAnalytics(v === true)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Label htmlFor="pp-marketing" className="font-medium">Marketing Cookies</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Used to show relevant job and employer ads.</p>
                    </div>
                    <Checkbox
                      id="pp-marketing"
                      checked={marketing}
                      onCheckedChange={(v) => setMarketing(v === true)}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setShowPreferences(false)}>
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" className="bg-[#0A3D62] hover:bg-[#0A3D62]/90 text-white" onClick={savePreferences}>
                      Save Preferences
                    </Button>
                  </div>
                  {savedMsg && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Preferences saved successfully.
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* 8. Security */}
          <section id="security">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">8</div>
              <h2 className="text-2xl font-bold">Security</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                We implement industry-standard security measures to protect your personal data
                against unauthorised access, alteration, disclosure, or destruction:
              </p>
              <ul className="space-y-2">
                {[
                  "TLS 1.3 encryption for all data in transit",
                  "AES-256 encryption for data at rest in our database",
                  "Passwords hashed using bcrypt with salt",
                  "Role-based access control (RBAC) for all internal data access",
                  "Regular security audits and penetration testing",
                  "Azure AD B2C for enterprise-grade identity management",
                  "Automated anomaly detection and real-time alerting",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Despite our efforts, no method of transmission over the internet is 100% secure.
                If you discover a security vulnerability, please report it responsibly to{" "}
                <a href="mailto:security@taxtalentsolution.com" className="text-primary underline">
                  security@taxtalentsolution.com
                </a>
                .
              </p>
            </div>
          </section>

          <Separator />

          {/* 9. Contact */}
          <section id="contact">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">9</div>
              <h2 className="text-2xl font-bold">Contact Us</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              For any privacy-related queries, data requests, or to exercise your rights, please
              contact our Data Protection Officer:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Data Protection Officer</h3>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong className="text-foreground">Tax Talent Solution</strong></p>
                  <p>Bengaluru, KA, India</p>
                  <p>
                    <a href="mailto:privacy@taxtalentsolution.com" className="text-primary underline">
                      privacy@taxtalentsolution.com
                    </a>
                  </p>
                  <p>Response time: within 30 days</p>
                </div>
              </div>
              <div className="border rounded-lg p-5 space-y-3 bg-blue-50/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">Regulatory Authority</h3>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong className="text-foreground">India (DPDP):</strong> Data Protection
                    Board of India
                  </p>
                  <p>
                    <strong className="text-foreground">EU (GDPR):</strong> Your local supervisory
                    authority (e.g. ICO for UK, CNIL for France)
                  </p>
                  <p className="pt-1">
                    You have the right to lodge a complaint with the relevant authority if you
                    believe we have not handled your data lawfully.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer note */}
          <div className="bg-muted/40 rounded-xl p-6 text-center text-sm text-muted-foreground">
            <p>
              This Privacy Policy may be updated periodically. We will notify registered users of
              material changes via email or an in-platform notice. Continued use of the platform
              after changes constitutes acceptance of the updated policy.
            </p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
