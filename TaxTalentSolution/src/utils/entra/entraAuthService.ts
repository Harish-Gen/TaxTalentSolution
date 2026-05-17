import {
  fetchEntraConfig,
  fetchEntraLoginUrl,
  isEntraEnabled,
} from "../../api/entraConfigService";
import { appRootUrl } from "../appPaths";
import { getEntraRedirectUri } from "./config";
import {
  clearSignupIntent,
  setSignupIntent,
  type SignupIntentRole,
} from "./signupIntent";

export async function redirectToEntraSignIn(
  signupRole?: SignupIntentRole
): Promise<void> {
  if (signupRole) {
    setSignupIntent(signupRole);
  } else {
    clearSignupIntent();
  }

  const config = await fetchEntraConfig();
  if (!config.Enabled) {
    throw new Error(
      "Entra sign-in is not enabled. Set Entra:Enabled in API appsettings.Development.json."
    );
  }
  const { AuthorizeUrl } = await fetchEntraLoginUrl(getEntraRedirectUri());
  window.location.href = AuthorizeUrl;
}

/** Header / Get Started / Login — Entra when enabled, otherwise caller shows login page. */
export async function startSignInFlow(options?: {
  signupRole?: SignupIntentRole;
}): Promise<"entra" | "local"> {
  try {
    if (!(await isEntraEnabled())) {
      return "local";
    }
    await redirectToEntraSignIn(options?.signupRole);
    return "entra";
  } catch {
    return "local";
  }
}

export function redirectToLandingAfterCancel(): void {
  window.location.href = appRootUrl();
}
