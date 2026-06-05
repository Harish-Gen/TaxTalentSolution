import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import {
  startSignInFlow,
  type EntraAuthMode,
} from "../utils/entra/entraAuthService";
import type { SignupRole } from "./LoginPage";

interface EntraAuthRedirectProps {
  mode: EntraAuthMode;
  signupRole: SignupRole;
  onBack: () => void;
  onFallback: () => void;
}

export function EntraAuthRedirect({
  mode,
  signupRole,
  onBack,
  onFallback,
}: EntraAuthRedirectProps) {
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    void (async () => {
      const result = await startSignInFlow({
        signupRole: signupRole === "employer_user" ? "employer_user" : "candidate",
        forSignup: mode === "signup",
      });
      if (cancelledRef.current) return;
      if (result === "local") {
        setError(
          mode === "signup"
            ? "Microsoft sign-up is not available right now. You can use the form instead."
            : "Microsoft sign-in is not available right now. You can use the form instead."
        );
      }
    })();
    return () => {
      cancelledRef.current = true;
    };
  }, [mode, signupRole]);

  const heading =
    mode === "signup"
      ? "Redirecting to Microsoft to create your account…"
      : "Redirecting to Microsoft to sign in…";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 sm:top-6 sm:left-6"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </Button>

      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        {error ? (
          <>
            <p className="text-sm text-destructive">{error}</p>
            <div className="flex flex-col gap-2 w-full">
              <Button variant="outline" onClick={onBack}>
                Back to home
              </Button>
              <Button onClick={onFallback}>
                {mode === "signup" ? "Continue with email signup" : "Continue with email login"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            <p className="text-muted-foreground text-sm">{heading}</p>
          </>
        )}
      </div>
    </div>
  );
}
