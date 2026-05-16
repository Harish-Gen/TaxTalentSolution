import { useEffect, useState, type ReactNode } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { signUpOrSignIn, loginByEmailFallback } from "../api/accountService";
import {
  buildAppUserFromClaims,
  decodeJwtPayload,
  getDisplayNameFromClaims,
  getEmailFromClaims,
  getPhoneFromClaims,
  setAuthToken,
  setStoredEntraUser,
} from "../utils/entra/tokenUtils";
import { redirectToLandingAfterCancel } from "../utils/entra/entraAuthService";
import { appRootUrl } from "../utils/appPaths";

function resolveRoleFromBackend(roleName?: string): string {
  if (!roleName) return "candidate";
  const normalized = roleName.toLowerCase();
  if (normalized.includes("admin")) return "admin";
  if (normalized.includes("employer")) return "employer";
  return "candidate";
}

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

      setAuthToken(idToken);

      let portalToken = idToken;
      let role = "candidate";
      let isNewUser = false;
      let apiUser: { id?: string; email?: string; name?: string; role?: string } | undefined;

      try {
        const apiResponse = await signUpOrSignIn(idToken);
        portalToken =
          apiResponse.Token ||
          apiResponse.token ||
          idToken;
        isNewUser =
          apiResponse.IsNewUser === true || apiResponse.isNewUser === true;
        apiUser = apiResponse.user;
        if (apiResponse.user?.role) {
          role = resolveRoleFromBackend(apiResponse.user.role);
        }
        setAuthToken(portalToken);
      } catch (apiErr) {
        const email = getEmailFromClaims(claims);
        if (email) {
          try {
            const loginResponse = await loginByEmailFallback(email);
            role = resolveRoleFromBackend(loginResponse.user?.role?.name);
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
      const phoneFromToken = getPhoneFromClaims(claims);
      setStoredEntraUser({
        ...appUser,
        isNewUser,
        entraObjectId: claims.oid || claims.sub,
        displayName: apiUser?.name ?? getDisplayNameFromClaims(claims),
        backendUserId: apiUser?.id,
        phone: phoneFromToken || undefined,
      });

      navigateAfterAuth(role);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete sign-in."
      );
    }
  };

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
