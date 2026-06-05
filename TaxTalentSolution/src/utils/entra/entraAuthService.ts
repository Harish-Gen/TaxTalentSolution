import {
  fetchEntraConfig,
  fetchEntraLoginUrl,
  isEntraEnabled,
} from "../../api/entraConfigService";
import { appRootPath, appRootUrl } from "../appPaths";
import { getEntraRedirectUri } from "./config";
import {
  clearSignupIntent,
  setSignupIntent,
  type SignupIntentRole,
} from "./signupIntent";
import { clearAuthSession } from "./tokenUtils";

export type EntraAuthMode = "login" | "signup";

function withCreateAccountPrompt(authorizeUrl: string): string {
  const url = new URL(authorizeUrl);
  url.searchParams.set("prompt", "create");
  return url.toString();
}

export function isAuthBridgeReturnUrl(): boolean {
  const auth = new URLSearchParams(window.location.search).get("auth");
  return auth === "login" || auth === "signup";
}

export function clearAuthBridgeQueryFromUrl(): void {
  if (window.location.search.includes("auth=")) {
    window.history.replaceState({}, "", appRootPath());
  }
}

export function pushAuthBridgeHistory(mode: EntraAuthMode): void {
  const query = mode === "signup" ? "auth=signup" : "auth=login";
  window.history.pushState({ ttsAuthBridge: mode }, "", appRootUrl(query));
}

export async function redirectToEntraSignIn(options?: {
  signupRole?: SignupIntentRole;
  forSignup?: boolean;
}): Promise<void> {
  const forSignup = options?.forSignup === true;

  if (forSignup) {
    clearAuthSession();
  }

  if (options?.signupRole) {
    setSignupIntent(options.signupRole);
  } else if (!forSignup) {
    clearSignupIntent();
  }

  const config = await fetchEntraConfig();
  if (!config.Enabled) {
    throw new Error(
      "Entra sign-in is not enabled. Set Entra:Enabled in API appsettings.Development.json."
    );
  }

  const { AuthorizeUrl } = await fetchEntraLoginUrl(
    getEntraRedirectUri(),
    forSignup
  );
  const authorizeUrl = forSignup
    ? withCreateAccountPrompt(AuthorizeUrl)
    : AuthorizeUrl;
  window.location.assign(authorizeUrl);
}

export async function startSignInFlow(options?: {
  signupRole?: SignupIntentRole;
  forSignup?: boolean;
}): Promise<"entra" | "local"> {
  try {
    if (!(await isEntraEnabled())) {
      return "local";
    }
    await redirectToEntraSignIn(options);
    return "entra";
  } catch {
    return "local";
  }
}

export function redirectToLandingAfterCancel(): void {
  window.location.href = appRootUrl();
}
