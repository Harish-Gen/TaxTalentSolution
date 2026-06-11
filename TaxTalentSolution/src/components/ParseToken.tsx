import { useEffect, useState, type ReactNode } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { signUpOrSignIn, loginByEmailFallback } from "../api/accountService";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { candidateService, matchCandidateByLinkedInUrl } from "../api/candidateService";
import { employerService } from "../api/employerService";
import { saveProfile } from "../database/profileStore";
import { LocalDatabase } from "../database/localDb";
import {
  buildAppUserFromClaims,
  decodeJwtPayload,
  getDisplayNameFromClaims,
  getEmailFromClaims,
  getPhoneFromClaims,
  getLinkedInFromClaims,
  getCityFromClaims,
  getStateFromClaims,
  getCountryFromClaims,
  setAuthToken,
  setStoredEntraUser,
} from "../utils/entra/tokenUtils";
import { redirectToLandingAfterCancel } from "../utils/entra/entraAuthService";
import {
  consumeSignupIntent,
  signupIntentToApiRole,
} from "../utils/entra/signupIntent";
import {
  normalizeAppRole,
  setSessionRole,
} from "../utils/sessionRole";
import { appRootUrl } from "../utils/appPaths";

function navigateAfterAuth(role: string): void {
  let target = appRootUrl("view=dashboard");
  if (role === "admin") {
    target = appRootUrl("view=admin-portal");
  } else if (role === "employer") {
    target = appRootUrl("view=employer-portal");
  }
  window.location.replace(target);
}

function CenteredLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-center w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

export function ParseToken() {
  const [error, setError] = useState<string | null>(null);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string>("candidate");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [country, setCountry] = useState("IN");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [saving, setSaving] = useState(false);

  const COUNTRIES = [
    { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
    { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
    { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
    { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
    { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
    { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
    { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
    { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
    { code: "AE", name: "UAE", dial: "+971", flag: "🇦🇪" },
    { code: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
    { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
    { code: "PH", name: "Philippines", dial: "+63", flag: "🇵🇭" },
    { code: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽" },
    { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷" },
    { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
    { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
    { code: "KR", name: "South Korea", dial: "+82", flag: "🇰🇷" },
    { code: "PK", name: "Pakistan", dial: "+92", flag: "🇵🇰" },
    { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
    { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪" },
  ];

  useEffect(() => {
    void processEntraCallback();
  }, []);

  const processEntraCallback = async () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, "")
      );

      const queryError = searchParams.get("error");
      const hashError = hashParams.get("error");
      const errorDescription = hashParams.get("error_description");

      if (
        window.location.href.includes("AADB2C90091") ||
        errorDescription?.toLowerCase().includes("cancelled")
      ) {
        redirectToLandingAfterCancel();
        return;
      }

      if (queryError || hashError) {
        setError(
          errorDescription ||
            `Authentication failed: ${queryError || hashError}`
        );
        return;
      }

      const idToken =
        hashParams.get("id_token") ||
        searchParams.get("id_token") ||
        hashParams.get("access_token") ||
        searchParams.get("access_token");

      if (!idToken) {
        setError("No authentication token found in the redirect URL.");
        return;
      }

      const claims = decodeJwtPayload(idToken);
      if (!claims) {
        setError("Could not read the identity token.");
        return;
      }
      console.log("decodeJwtPayload claims:", claims);

      setAuthToken(idToken);

      let portalToken = idToken;
      let role = "candidate";
      let isNewUser = false;
      let apiUser: { id?: string; email?: string; name?: string; role?: string } | undefined;

      const signupIntent = consumeSignupIntent();

      try {
        const apiResponse = await signUpOrSignIn(
          idToken,
          signupIntent ? signupIntentToApiRole(signupIntent) : undefined
        );
        portalToken =
          apiResponse.Token ||
          apiResponse.token ||
          idToken;
        isNewUser =
          apiResponse.IsNewUser === true || apiResponse.isNewUser === true;
        apiUser = apiResponse.user;
        if (apiResponse.user?.role) {
          role = normalizeAppRole(apiResponse.user.role);
        }
        setAuthToken(portalToken);
      } catch (apiErr) {
        const email = getEmailFromClaims(claims);
        if (email) {
          try {
            const loginResponse = await loginByEmailFallback(email);
            role = normalizeAppRole(loginResponse.user?.role?.name);
            setAuthToken(idToken);
          } catch {
            const message =
              apiErr instanceof Error
                ? apiErr.message
                : "Sign-in API failed. Check that the TTS API is running on port 8000.";
            setError(message);
            return;
          }
        } else {
          setError(
            apiErr instanceof Error
              ? apiErr.message
              : "Sign-in API failed."
          );
          return;
        }
      }

      const appUser = buildAppUserFromClaims(claims, role);
      if (apiUser?.id) {
        appUser.id = apiUser.id;
      }
      if (apiUser?.email) {
        appUser.email = apiUser.email;
      }
      if (apiUser?.name) {
        appUser.user_metadata.name = apiUser.name;
      }
      setSessionRole({
        userId: apiUser?.id ?? appUser.id,
        roleName: apiUser?.role ?? role,
        roleId: apiUser?.roleid,
      });

      const phoneFromToken = getPhoneFromClaims(claims);
      setStoredEntraUser({
        ...appUser,
        isNewUser,
        entraObjectId: claims.oid || claims.sub,
        displayName: apiUser?.name ?? getDisplayNameFromClaims(claims),
        backendUserId: apiUser?.id,
        phone: phoneFromToken || undefined,
      });

      if (isNewUser) {
        setUserId(apiUser?.id ?? appUser.id);
        setRole(role);
        setEmail(apiUser?.email ?? appUser.email);
        setName(apiUser?.name ?? getDisplayNameFromClaims(claims));
        setPhone(phoneFromToken || "");

        const linkedInFromToken = getLinkedInFromClaims(claims);
        const cityFromToken = getCityFromClaims(claims);
        const stateFromToken = getStateFromClaims(claims);
        const countryFromToken = getCountryFromClaims(claims);

        if (linkedInFromToken) setLinkedIn(linkedInFromToken);
        if (cityFromToken) setCity(cityFromToken);
        if (stateFromToken) setState(stateFromToken);
        if (countryFromToken) {
          let resolvedCountry = countryFromToken.trim();
          const matched = COUNTRIES.find(
            (c) =>
              c.code.toLowerCase() === resolvedCountry.toLowerCase() ||
              c.name.toLowerCase() === resolvedCountry.toLowerCase() ||
              resolvedCountry.toLowerCase().includes(c.name.toLowerCase()) ||
              c.name.toLowerCase().includes(resolvedCountry.toLowerCase())
          );
          if (matched) {
            setCountry(matched.code);
          } else if (resolvedCountry.length === 2) {
            setCountry(resolvedCountry.toUpperCase());
          }
        }

        setShowCompletionForm(true);
      } else {
        navigateAfterAuth(role);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete sign-in."
      );
    }
  };

  const handleCompleteProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);

    try {
      const dialCode = COUNTRIES.find(c => c.code === country)?.dial ?? "";
      const formattedPhone = phone.startsWith("+") ? phone : `${dialCode}${phone}`;

      let linkedInMatch: any = null;
      if (role === "candidate" && linkedIn) {
        linkedInMatch = await matchCandidateByLinkedInUrl(linkedIn);
      }

      if (role === "candidate") {
        await candidateService.upsertCandidate({
          user_id: userId,
          name: name,
          phone: formattedPhone,
          location_city: city,
          location_state: state,
          location_country: country,
          linkedin_url: linkedIn,
          headline: linkedInMatch?.title || "",
        });
      } else if (role === "employer") {
        const employers = await employerService.getEmployers();
        const existing = employers.find(emp => emp.user_id === userId);
        
        await employerService.upsertEmployer({
          id: existing?.id,
          user_id: userId,
          company_name: name + " Org",
          contact_person: name,
          phone: formattedPhone,
          headquarters_city: city,
          headquarters_state: state,
          headquarters_country: country,
          website: linkedIn,
        });
      }

      const stored = localStorage.getItem("tts_entra_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.user_metadata = parsed.user_metadata || {};
          parsed.user_metadata.name = name;
          parsed.displayName = name;
          parsed.phone = formattedPhone;
          localStorage.setItem("tts_entra_user", JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }

      if (role === "candidate") {
        saveProfile(userId, {
          name: linkedInMatch?.name || name,
          title: linkedInMatch?.title || "",
          location: linkedInMatch?.location || (city && state ? `${city}, ${state}` : city || state || ""),
          summary: linkedInMatch?.summary || "",
          email: email,
          phone: formattedPhone,
          website: linkedInMatch?.website || linkedIn,
          availability: "Actively Looking",
          preferredLocation: "",
          experience: linkedInMatch?.experience || [],
          education: linkedInMatch?.education || [],
          skills: linkedInMatch?.skills || [],
          certifications: linkedInMatch?.certifications || [],
        });
      }

      navigateAfterAuth(role);
    } catch (err) {
      console.error("Failed to save profile completion details:", err);
      import("sonner").then(({ toast }) => {
        toast.error("Failed to save your profile details. Please try again.");
      });
    } finally {
      setSaving(false);
    }
  };

  if (showCompletionForm) {
    return (
      <CenteredLayout>
        <Card className="w-full max-w-md shadow-2xl text-left border-0 bg-white">
          <CardHeader className="space-y-2 text-center pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Complete Your Profile
            </CardTitle>
            <p className="text-slate-500 text-sm">
              Please provide a few more details to set up your account on TaxTalent Solution.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCompleteProfileSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                <div className="relative">
                  <svg className="absolute left-3 top-3 h-4 w-4 text-[#0077B5]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <Input
                    id="linkedin"
                    type="url"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    className="pl-10"
                    placeholder="https://www.linkedin.com/in/YourName"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.dial})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bangalore"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center h-10 px-3 rounded-md border border-input bg-muted text-sm font-medium min-w-[64px]">
                    {COUNTRIES.find(c => c.code === country)?.dial}
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    required
                    className="flex-1"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 mt-2" disabled={saving}>
                {saving ? "Saving Details..." : "Save and Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </CenteredLayout>
    );
  }

  if (error) {
    return (
      <CenteredLayout>
        <Card className="w-full max-w-md shadow-lg text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Sign-in failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => void processEntraCallback()}>
                Retry
              </Button>
              <Button onClick={redirectToLandingAfterCancel}>Back to home</Button>
            </div>
          </CardContent>
        </Card>
      </CenteredLayout>
    );
  }

  return (
    <CenteredLayout>
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      <p className="text-muted-foreground text-sm">Completing sign-in…</p>
    </CenteredLayout>
  );
}
