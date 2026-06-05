import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Star,
  CheckCircle,
  AlertCircle,
  Phone,
} from "lucide-react";
import { supabase } from "../utils/supabase/client";
import { appRootUrl, assetUrl } from "../utils/appPaths";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { registerUser, authenticateStoredUser, buildUserFromStored } from "../database/userStore";
import { redirectToEntraSignIn } from "../utils/entra/entraAuthService";
import { fetchEntraConfig } from "../api/entraConfigService";
import { userService } from "../api/userService";
import { setSessionRole } from "../utils/sessionRole";

export type SignupRole = "candidate" | "employer_user";

interface LoginPageProps {
  onBack: () => void;
  onLocalLogin?: (user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) => void;
  onLinkedInMatch?: () => void;
  initialMode?: "login" | "signup";
  initialSignupRole?: SignupRole;
  lockSignupRole?: boolean;
}

export function LoginPage({
  onBack,
  onLocalLogin,
  onLinkedInMatch,
  initialMode = "login",
  initialSignupRole = "candidate",
  lockSignupRole = false,
}: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("IN");
  const [signupRole, setSignupRole] = useState<SignupRole>(initialSignupRole);
  const [loading, setLoading] = useState(false);

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
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [entraEnabled, setEntraEnabled] = useState(false);

  useEffect(() => {
    fetchEntraConfig()
      .then((config) => setEntraEnabled(config.Enabled))
      .catch(() => setEntraEnabled(false));
  }, []);

  useEffect(() => {
    if (!isLogin && lockSignupRole) {
      setSignupRole(initialSignupRole);
    }
  }, [isLogin, lockSignupRole, initialSignupRole]);



  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleEntraAuth = async () => {
    if (!entraEnabled) return;
    setLoading(true);
    try {
      const config = await fetchEntraConfig();
      if (!config.Enabled) {
        showMessage(
          "Microsoft sign-in is not enabled in API appsettings (Entra:Enabled).",
          "error"
        );
        setLoading(false);
        return;
      }
      await redirectToEntraSignIn({
        signupRole,
        forSignup: !isLogin,
      });
    } catch {
      showMessage("Microsoft sign-in failed. Please try again.", "error");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: appRootUrl()
        }
      });
      
      if (error) {
        showMessage(`Google login error: ${error.message}`, "error");
      }
    } catch (error) {
      showMessage("Google login failed. Please try again.", "error");
    }
    setLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin && entraEnabled) {
      await handleEntraAuth();
      return;
    }
    
    // For login, only email is required now. For signup, all fields are required.
    if (!email || (!isLogin && (!password || !name || !phone))) {
      showMessage("Please fill in all required fields.", "error");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        try {
          const response = await userService.login(email);
          if (response && response.user) {
            const { user } = response;
            setSessionRole({
              userId: user.id,
              roleId: user.roleid || "",
              roleName: user.role?.name || "",
            });
            sessionStorage.setItem("userName", user.name || "");

            if (user.candidate?.currenttitle) {
              sessionStorage.setItem("currentTitle", user.candidate.currenttitle);
            }
            
            showMessage(`Welcome back, ${user.name}!`, "success");
            
            setTimeout(() => {
              // Create a user object compatible with App.tsx's handleLocalLogin
              const mappedUser = {
                id: user.id,
                email: user.email,
                user_metadata: {
                  name: user.name,
                  role: user.role?.name.toLowerCase() === 'admin' ? 'admin' : (user.role?.name.toLowerCase() === 'employer' ? 'employer' : 'candidate')
                }
              };
              onLocalLogin?.(mappedUser as any);
            }, 600);
            setLoading(false);
            return;
          }
        } catch (err: any) {
          console.error("Backend login failed, falling back to local auth", err);
          if (password) {
            const storedUser = await authenticateStoredUser(email, password);
            if (storedUser) {
              setSessionRole({
                userId: storedUser.id,
                roleName:
                  storedUser.role === "employer_user" ? "Employer" : "Candidate",
              });
              showMessage(`Welcome back, ${storedUser.name}!`, "success");
              setTimeout(() => {
                onLocalLogin?.(buildUserFromStored(storedUser));
              }, 600);
              setLoading(false);
              return;
            }

            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
              showMessage(`Login failed: ${error.message}`, "error");
            } else {
              showMessage("Login successful! Welcome back.", "success");
            }
          } else {
            showMessage("Login failed. Please check your email or provide a password.", "error");
          }
        }
      } else {
        // Sign up — register account locally (localStorage)
        const fullPhone = `${COUNTRIES.find(c => c.code === country)?.dial ?? ""}${phone}`;
        const result = await registerUser({
          email,
          password,
          name,
          phone: fullPhone,
          country,
          role: signupRole,
          linkedInUrl: linkedIn.trim() || undefined,
        });

        if (result.success && result.user) {
          if (result.linkedInLoaded) {
            onLinkedInMatch?.();
          }
          setSessionRole({
            userId: result.user.id,
            roleName:
              result.user.role === "employer_user" ? "Employer" : "Candidate",
          });
          showMessage(`Welcome, ${name}! Your account has been created.`, "success");
          setTimeout(() => {
            onLocalLogin?.(buildUserFromStored(result.user!));
          }, 600);
          setLoading(false);
          return;
        } else {
          showMessage(result.error ?? 'Signup failed. Please try again.', "error");
        }
      }
    } catch (error) {
      showMessage("Authentication failed. Please try again.", "error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block">
          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1601509876296-aba16d4c10a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc1NzgzNDA4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Professional collaboration"
              className="w-full h-[600px] object-cover rounded-2xl"
            />
            <div className="absolute inset-0 bg-primary/20 rounded-2xl flex items-end p-8">
              <div className="text-white">
                <h2 className="text-3xl mb-4">Join 5,000+ Tax Professionals</h2>
                <p className="text-lg opacity-90">
                  Connect with top employers and advance your US tax career with Tax Talent Solution.
                </p>
                <div className="flex items-center mt-4 space-x-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Verified Skills</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Top Salaries</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <img src={assetUrl("images/logo.png")} alt="Tax Talent Solution" className="h-8 w-8 rounded-full" />
                  <div className="text-right">
                    <h1 className="text-lg font-bold text-primary">Tax Talent Solution</h1>
                    <p className="text-xs text-muted-foreground">US Tax Professionals</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <CardTitle className="text-2xl">
                  {isLogin ? "Welcome Back" : "Create Your Account"}
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  {isLogin
                    ? "Sign in to access your professional dashboard"
                    : signupRole === "employer_user"
                      ? "Create your employer account to hire US tax professionals"
                      : "Join tax professionals on Tax Talent Solution"}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Message Alert */}
              {message && (
                <Alert className={messageType === "error" ? "border-destructive" : "border-green-500"}>
                  {messageType === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertDescription className={messageType === "error" ? "text-destructive" : "text-green-600"}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Social Login Options */}
              <div className="space-y-3">
                {entraEnabled && (
                <div className="relative">
                  <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white z-10">
                    <Star className="w-3 h-3 mr-1" />
                    {isLogin ? "Sign In" : "Sign Up"}
                  </Badge>
                  <Button
                    variant="outline"
                    className="w-full h-12 border-[#0078D4] text-[#0078D4] hover:bg-[#0078D4] hover:text-white transition-colors"
                    onClick={handleEntraAuth}
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                      <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
                      <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
                      <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
                    </svg>
                    {isLogin ? "Sign in with Microsoft" : "Sign up with Microsoft"}
                  </Button>
                </div>
                )}

                {/* Google */}
                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {!isLogin && (
                  <>
                    {!lockSignupRole && (
                    <div className="space-y-2">
                      <Label>I am a...</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSignupRole('candidate')}
                          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                            signupRole === 'candidate'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm font-medium">Tax Professional</span>
                          <span className="text-xs text-muted-foreground mt-0.5">Looking for work</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignupRole('employer_user')}
                          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                            signupRole === 'employer_user'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-sm font-medium">Employer</span>
                          <span className="text-xs text-muted-foreground mt-0.5">Hiring talent</span>
                        </button>
                      </div>
                    </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        required={!isLogin}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn Profile</Label>
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
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
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
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <div className="flex items-center justify-center h-10 px-3 rounded-md border border-input bg-muted text-sm font-medium min-w-[64px]">
                          <Phone className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                          {COUNTRIES.find(c => c.code === country)?.dial}
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter your phone number"
                          required={!isLogin}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                      required={!isLogin}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={loading}
                >
                  {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
                </Button>
              </form>

              {/* Toggle between login/signup */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </Button>
                </p>
              </div>

              {/* Privacy notice */}
              <div className="text-xs text-muted-foreground text-center">
                By continuing, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}