import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
// YesNoToggle — rectangular Yes/No toggle replacing Switch
function YesNoToggle({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (val: boolean) => void }) {
  return (
    <div className="flex rounded-md border border-border overflow-hidden text-xs font-semibold select-none">
      <button
        type="button"
        onClick={() => onCheckedChange(true)}
        className={`px-3 py-1.5 transition-colors duration-150 ${
          checked
            ? "bg-primary text-primary-foreground"
            : "bg-background text-muted-foreground hover:bg-secondary"
        }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onCheckedChange(false)}
        className={`px-3 py-1.5 transition-colors duration-150 ${
          !checked
            ? "bg-destructive text-destructive-foreground"
            : "bg-background text-muted-foreground hover:bg-secondary"
        }`}
      >
        No
      </button>
    </div>
  );
}
import { Badge } from "../ui/badge";
import {
  User,
  Mail,
  CreditCard,
  Shield,
  Bell,
  Lock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  ChevronRight,
  Star,
  Zap,
  Crown,
} from "lucide-react";
import { getSubscription, saveSubscription, activateSubscription, PLAN_PRICING, PLAN_LABELS } from "../../database/userStore";
import type { UserSubscription, CandidatePlan, BillingCycle } from "../../database/types";
import { PaymentModal } from "../PaymentModal";
import type { PendingPlan } from "../PaymentModal";

interface SettingsProps {
  user: any;
}

type SettingsTab = "account" | "email" | "billing" | "privacy" | "notifications" | "security";

const tabs: { id: SettingsTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: "account",       label: "Account Info",    icon: User,       description: "Manage your personal account details" },
  { id: "email",         label: "Email",           icon: Mail,       description: "Update your email address and preferences" },
  { id: "billing",       label: "Billing",         icon: CreditCard, description: "Subscription, payments, and invoices" },
  { id: "notifications", label: "Notifications",   icon: Bell,       description: "Choose what you want to be notified about" },
  { id: "privacy",       label: "Privacy",         icon: Shield,     description: "Control your data and visibility settings" },
  { id: "security",      label: "Security",        icon: Lock,       description: "Password, 2FA, and session management" },
];

export function Settings({ user }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ── Subscription state ─────────────────────────────────────────────────
  const userId = user?.id ?? 'guest';
  const [subscription, setSubscription] = useState<UserSubscription>(() => getSubscription(userId));
  const [showPlanChooser, setShowPlanChooser] = useState(false);
  const [choosingPlan, setChoosingPlan] = useState<CandidatePlan>(subscription.plan);
  const [choosingCycle, setChoosingCycle] = useState<BillingCycle>(subscription.billing_cycle);
  const [pendingPaymentPlan, setPendingPaymentPlan] = useState<PendingPlan | null>(null);

  // Account Info state
  const [accountForm, setAccountForm] = useState({
    fullName: user?.user_metadata?.name || "",
    phone: user?.user_metadata?.phone || "",
    location: user?.user_metadata?.location || "",
    jobTitle: user?.user_metadata?.job_title || "",
  });

  // Email state
  const [emailForm, setEmailForm] = useState({
    email: user?.email || "",
    newEmail: "",
    confirmEmail: "",
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    applicationUpdates: true,
    interviewReminders: true,
    salaryInsights: false,
    newsletter: false,
    productUpdates: true,
  });

  // Privacy state
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowRecruiterContact: true,
    dataAnalytics: true,
    thirdPartySharing: false,
  });

  // Security state
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  // Email preferences state
  const [emailPrefs, setEmailPrefs] = useState({
    htmlFormat: true,
    employerEmail: true,
    weeklyDigest: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const renderAccount = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Personal Information</h3>
        <p className="text-sm text-muted-foreground mb-4">Update your name, phone number, and location.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={accountForm.fullName}
              onChange={(e) => setAccountForm({ ...accountForm, fullName: e.target.value })}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={accountForm.jobTitle}
              onChange={(e) => setAccountForm({ ...accountForm, jobTitle: e.target.value })}
              placeholder="e.g. Senior Tax Analyst"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={accountForm.phone}
              onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={accountForm.location}
              onChange={(e) => setAccountForm({ ...accountForm, location: e.target.value })}
              placeholder="City, State"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Account Status</h3>
        <div className="flex items-center justify-between py-3 px-4 bg-secondary/40 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
              {(user?.user_metadata?.name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.user_metadata?.name || user?.email?.split("@")[0]}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Active</Badge>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold text-destructive mb-1">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-3">Permanently delete your account and all associated data.</p>
        <Button variant="destructive" size="sm" className="flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Delete Account
        </Button>
      </div>
    </div>
  );

  const renderEmail = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Current Email</h3>
        <p className="text-sm text-muted-foreground mb-4">Your verified email address used to sign in.</p>
        <div className="flex items-center gap-3 py-3 px-4 bg-secondary/40 rounded-lg">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{user?.email}</span>
          <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700 border-blue-200 text-xs">Verified</Badge>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Change Email Address</h3>
        <p className="text-sm text-muted-foreground mb-4">A verification link will be sent to your new email.</p>
        <div className="space-y-3 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="newEmail">New Email Address</Label>
            <Input
              id="newEmail"
              type="email"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
              placeholder="new@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmEmail">Confirm New Email</Label>
            <Input
              id="confirmEmail"
              type="email"
              value={emailForm.confirmEmail}
              onChange={(e) => setEmailForm({ ...emailForm, confirmEmail: e.target.value })}
              placeholder="new@example.com"
            />
          </div>
          <Button size="sm" variant="outline" disabled={!emailForm.newEmail || emailForm.newEmail !== emailForm.confirmEmail}>
            Send Verification Email
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold text-foreground mb-3">Email Preferences</h3>
        <div className="space-y-3">
          {[
            { label: "Receive emails in HTML format", key: "htmlFormat" },
            { label: "Allow employers to email me directly", key: "employerEmail" },
            { label: "Weekly digest of new job matches", key: "weeklyDigest" },
          ].map((pref) => (
            <div key={pref.key} className="flex items-center justify-between py-2">
              <span className="text-sm">{pref.label}</span>
              <YesNoToggle
                checked={emailPrefs[pref.key as keyof typeof emailPrefs]}
                onCheckedChange={(val) => setEmailPrefs({ ...emailPrefs, [pref.key]: val })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBilling = () => {
    const isFree = subscription.plan === 'free';
    const expiry = new Date(subscription.expires_at);
    const expiryDisplay = isFree ? 'Never' : expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const pricing = PLAN_PRICING[subscription.plan][subscription.billing_cycle];
    const priceDisplay = isFree ? '₹0 / Forever' : `${pricing.display} / ${subscription.billing_cycle === 'monthly' ? 'month' : 'year'}`;
    const isExpired = !isFree && subscription.status === 'expired';
    const isCancelled = subscription.status === 'cancelled';

    const planIcon = subscription.plan === 'premium' ? Crown : subscription.plan === 'professional' ? Star : Zap;
    const PlanIcon = planIcon;

    const planGradient =
      subscription.plan === 'premium'     ? 'from-yellow-500/10 to-orange-500/10 border-yellow-400/40' :
      subscription.plan === 'professional' ? 'from-primary/5 to-primary/15 border-primary/30' :
                                             'from-muted/40 to-muted/20 border-border';

    const planFeatures: Record<CandidatePlan, string[]> = {
      free:         ['Complete profile creation', 'Basic job search & applications', 'Profile visibility to employers', 'Email job alerts', 'Basic support'],
      professional: ['Everything in Free', 'Priority job matching', 'Personalized job recommendations', 'Unlimited assessment retakes', 'Profile badge & verification', 'Resume Enhancer', 'Mock Interview'],
      premium:      ['Everything in Professional', 'Session with Technical Mentor', 'Goal Setting & Career Counseling', 'Leadership roles guidance', 'Coaching & Mentorship sessions', 'EA / CPA recommendations'],
    };

    const handleApplyPlan = () => {
      if (choosingPlan === 'free') {
        // Free plan — no payment needed
        const updated = activateSubscription(userId, choosingPlan, choosingCycle);
        setSubscription(updated);
        setShowPlanChooser(false);
        return;
      }
      // Paid plan — open payment modal
      const pricing = PLAN_PRICING[choosingPlan][choosingCycle];
      setPendingPaymentPlan({
        name: PLAN_LABELS[choosingPlan],
        price: pricing.display,
        period: choosingCycle === 'annual' ? '/ year' : '/ month',
        billing: choosingCycle === 'annual' ? 'annual' : 'monthly',
      });
    };

    const handleCancelSubscription = () => {
      const updated = saveSubscription(userId, {
        plan: subscription.plan,
        billing_cycle: subscription.billing_cycle,
        status: 'cancelled',
        start_date: subscription.start_date,
        expires_at: subscription.expires_at,
      });
      setSubscription(updated);
    };

    return (
      <div className="space-y-6">
        {/* Current Plan Card */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-2">Current Plan</h3>
          <div className={`border rounded-xl p-5 bg-gradient-to-r ${planGradient}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border">
                  <PlanIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-base">{PLAN_LABELS[subscription.plan]} Plan</p>
                  <p className="text-sm text-muted-foreground capitalize">{subscription.billing_cycle} billing</p>
                </div>
              </div>
              <Badge className={
                isCancelled ? 'bg-red-100 text-red-700' :
                isExpired   ? 'bg-orange-100 text-orange-700' :
                              'bg-green-100 text-green-700'
              }>
                {isCancelled ? 'Cancelled' : isExpired ? 'Expired' : 'Active'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mt-4">
              <div className="bg-background/60 rounded-lg px-3 py-2">
                <p className="text-muted-foreground text-xs mb-0.5">Price</p>
                <p className="font-semibold text-foreground">{priceDisplay}</p>
              </div>
              <div className="bg-background/60 rounded-lg px-3 py-2">
                <p className="text-muted-foreground text-xs mb-0.5">{isFree ? 'Expires' : isCancelled ? 'Access until' : 'Renews on'}</p>
                <p className="font-semibold text-foreground">{expiryDisplay}</p>
              </div>
              <div className="bg-background/60 rounded-lg px-3 py-2">
                <p className="text-muted-foreground text-xs mb-0.5">Member since</p>
                <p className="font-medium">{new Date(subscription.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="bg-background/60 rounded-lg px-3 py-2">
                <p className="text-muted-foreground text-xs mb-0.5">Billing cycle</p>
                <p className="font-medium capitalize">{isFree ? '—' : subscription.billing_cycle}</p>
              </div>
            </div>

            {/* Plan features */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Included in your plan</p>
              <ul className="space-y-1">
                {planFeatures[subscription.plan].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => { setChoosingPlan(subscription.plan); setChoosingCycle(subscription.billing_cycle); setShowPlanChooser(v => !v); }}>
              Change Plan
            </Button>
            {!isFree && subscription.status === 'active' && (
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={handleCancelSubscription}>
                Cancel Subscription
              </Button>
            )}
          </div>
        </div>

        {/* Inline Plan Chooser */}
        {showPlanChooser && (
          <div className="border rounded-xl p-5 bg-muted/30 space-y-4">
            <h4 className="font-semibold text-foreground">Select a Plan</h4>

            {/* Billing cycle toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Billing:</span>
              <div className="flex rounded-md border overflow-hidden text-xs font-semibold">
                {(['monthly', 'annual'] as BillingCycle[]).map(cycle => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setChoosingCycle(cycle)}
                    className={`px-4 py-1.5 capitalize transition-colors ${choosingCycle === cycle ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-secondary'}`}
                  >
                    {cycle}{cycle === 'annual' ? ' (save ~50%)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-3 gap-3">
              {(['free', 'professional', 'premium'] as CandidatePlan[]).map(plan => {
                const p = PLAN_PRICING[plan][plan === 'free' ? 'monthly' : choosingCycle];
                const selected = choosingPlan === plan;
                return (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setChoosingPlan(plan)}
                    className={`rounded-lg border p-3 text-left transition-all ${selected ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-border hover:border-primary/50 bg-background'}`}
                  >
                    <p className="font-semibold text-sm mb-0.5">{PLAN_LABELS[plan]}</p>
                    <p className="text-xs text-muted-foreground">{plan === 'free' ? '₹0 forever' : `${p.display}/${plan === 'free' ? '' : choosingCycle === 'annual' ? 'yr' : 'mo'}`}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleApplyPlan}>Apply Plan</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowPlanChooser(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <Separator />

        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">Payment Method</h3>
          <div className="flex items-center gap-3 py-3 px-4 bg-secondary/40 rounded-lg max-w-sm">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Visa ending in 4242</p>
              <p className="text-xs text-muted-foreground">Expires 08/2027</p>
            </div>
            <Button size="sm" variant="ghost" className="ml-auto text-xs">Update</Button>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-base font-semibold text-foreground mb-3">Billing History</h3>
          {isFree ? (
            <p className="text-sm text-muted-foreground">No billing history — you are on the Free plan.</p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Description</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(() => {
                    const rows = [];
                    const start = new Date(subscription.start_date);
                    const price = PLAN_PRICING[subscription.plan][subscription.billing_cycle];
                    const label = `${PLAN_LABELS[subscription.plan]} Plan (${subscription.billing_cycle})`;
                    const months = subscription.billing_cycle === 'annual' ? 1 : 3;
                    for (let i = 0; i < months; i++) {
                      const d = new Date(start);
                      d.setMonth(d.getMonth() - i);
                      rows.push({ date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), desc: label, amount: price.display, status: 'Paid' });
                    }
                    return rows;
                  })().map((row, i) => (
                    <tr key={i} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-2.5 text-muted-foreground">{row.date}</td>
                      <td className="px-4 py-2.5">{row.desc}</td>
                      <td className="px-4 py-2.5 font-medium">{row.amount}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Email Notifications</h3>
        <p className="text-sm text-muted-foreground mb-4">Choose which emails you'd like to receive.</p>
        <div className="space-y-1">
          {(
            [
              { key: "jobAlerts",            label: "New Job Alerts",            description: "Get notified when new matching jobs are posted" },
              { key: "applicationUpdates",   label: "Application Updates",       description: "Status changes on your job applications" },
              { key: "interviewReminders",   label: "Interview Reminders",       description: "Reminders before scheduled interviews" },
              { key: "salaryInsights",       label: "Salary Insights",           description: "Weekly reports on salary trends in your area" },
              { key: "newsletter",           label: "Newsletter",                description: "Monthly newsletter with tax industry news" },
              { key: "productUpdates",       label: "Product Updates",           description: "New features and improvements to the platform" },
            ] as { key: keyof typeof notifications; label: string; description: string }[]
          ).map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 px-1 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <YesNoToggle
                checked={notifications[item.key]}
                onCheckedChange={(val) => setNotifications({ ...notifications, [item.key]: val })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Profile Visibility</h3>
        <p className="text-sm text-muted-foreground mb-4">Control who can see your profile information.</p>
        <div className="space-y-1">
          {(
            [
              { key: "profileVisible",        label: "Public Profile",             description: "Allow employers and recruiters to find your profile" },
              { key: "showEmail",              label: "Show Email Address",         description: "Display your email on your public profile" },
              { key: "showPhone",              label: "Show Phone Number",          description: "Display your phone number on your public profile" },
              { key: "allowRecruiterContact", label: "Allow Recruiter Contact",    description: "Let verified recruiters message you directly" },
            ] as { key: keyof typeof privacy; label: string; description: string }[]
          ).map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 px-1 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <YesNoToggle
                checked={privacy[item.key]}
                onCheckedChange={(val) => setPrivacy({ ...privacy, [item.key]: val })}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Data & Analytics</h3>
        <p className="text-sm text-muted-foreground mb-4">Manage how your data is used.</p>
        <div className="space-y-1">
          {(
            [
              { key: "dataAnalytics",    label: "Usage Analytics",      description: "Help improve the platform by sharing anonymized usage data" },
              { key: "thirdPartySharing", label: "Third-Party Sharing", description: "Share data with trusted partners for better job matching" },
            ] as { key: keyof typeof privacy; label: string; description: string }[]
          ).map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 px-1 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <YesNoToggle
                checked={privacy[item.key]}
                onCheckedChange={(val) => setPrivacy({ ...privacy, [item.key]: val })}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Your Data</h3>
        <p className="text-sm text-muted-foreground mb-3">Download or delete your personal data at any time.</p>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline">Download My Data</Button>
          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Request Data Deletion
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Change Password</h3>
        <p className="text-sm text-muted-foreground mb-4">Use a strong password of at least 8 characters.</p>
        <div className="space-y-3 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="currentPass">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPass"
                type={showPassword ? "text" : "password"}
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                placeholder="Current password"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPass">New Password</Label>
            <Input
              id="newPass"
              type="password"
              value={passwordForm.newPass}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
              placeholder="New password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPass">Confirm New Password</Label>
            <Input
              id="confirmPass"
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              placeholder="Confirm new password"
            />
          </div>
          <Button
            size="sm"
            disabled={!passwordForm.current || !passwordForm.newPass || passwordForm.newPass !== passwordForm.confirm}
          >
            Update Password
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground mb-3">Add an extra layer of security to your account.</p>
        <div className="flex items-center justify-between py-3 px-4 bg-secondary/40 rounded-lg max-w-md">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Authenticator App</p>
              <p className="text-xs text-muted-foreground">Not configured</p>
            </div>
          </div>
          <Button size="sm" variant="outline">Set Up</Button>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Active Sessions</h3>
        <p className="text-sm text-muted-foreground mb-3">Devices currently signed in to your account.</p>
        <div className="space-y-2">
          {[
            { device: "Windows PC · Chrome", location: "Current session", current: true },
            { device: "iPhone · Safari",     location: "Last active 2 days ago", current: false },
          ].map((session, i) => (
            <div key={i} className="flex items-center justify-between py-3 px-4 bg-secondary/40 rounded-lg">
              <div>
                <p className="text-sm font-medium">{session.device}</p>
                <p className="text-xs text-muted-foreground">{session.location}</p>
              </div>
              {session.current
                ? <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">This device</Badge>
                : <Button size="sm" variant="ghost" className="text-xs text-destructive hover:text-destructive">Revoke</Button>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "account":       return renderAccount();
      case "email":         return renderEmail();
      case "billing":       return renderBilling();
      case "notifications": return renderNotifications();
      case "privacy":       return renderPrivacy();
      case "security":      return renderSecurity();
      default:              return renderAccount();
    }
  };

  const activeTabMeta = tabs.find((t) => t.id === activeTab)!;

  return (
    <>
      {/* Payment modal for plan upgrades from Billing settings */}
      {pendingPaymentPlan && (
        <PaymentModal
          plan={pendingPaymentPlan}
          onClose={() => setPendingPaymentPlan(null)}
          onSuccess={() => {
            const updated = activateSubscription(userId, choosingPlan, choosingCycle);
            setSubscription(updated);
            setPendingPaymentPlan(null);
            setShowPlanChooser(false);
          }}
        />
      )}
    <div className="flex gap-6 h-full">
      {/* Left Tab List */}
      <div className="w-56 flex-shrink-0">
        <Card className="sticky top-0">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Settings</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <nav className="space-y-0.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{tab.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Right Content Panel */}
      <div className="flex-1 min-w-0">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  {(() => { const Icon = activeTabMeta.icon; return <Icon className="w-5 h-5 text-primary" />; })()}
                  {activeTabMeta.label}
                </CardTitle>
                <CardDescription className="mt-0.5">{activeTabMeta.description}</CardDescription>
              </div>
              {(activeTab === "account" || activeTab === "notifications" || activeTab === "privacy") && (
                <Button size="sm" onClick={handleSave} className="flex items-center gap-1.5">
                  {saved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
