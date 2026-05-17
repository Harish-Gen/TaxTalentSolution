import { setSessionRole } from "../sessionRole";

const SIGNUP_INTENT_KEY = "tts_signup_role";

export type SignupIntentRole = "candidate" | "employer_user";

export function setSignupIntent(role: SignupIntentRole): void {
  sessionStorage.setItem(SIGNUP_INTENT_KEY, role);
  setSessionRole({
    roleName: role === "employer_user" ? "Employer" : "Candidate",
  });
}
export function clearSignupIntent(): void {
  sessionStorage.removeItem(SIGNUP_INTENT_KEY);
}

/** Read signup role without removing (e.g. before Entra redirect completes). */
export function getSignupIntent(): SignupIntentRole | null {
  const value = sessionStorage.getItem(SIGNUP_INTENT_KEY);
  if (value === "candidate" || value === "employer_user") {
    return value;
  }
  return null;
}

/** Read and remove stored signup role (used once after Entra callback). */
export function consumeSignupIntent(): SignupIntentRole | null {
  const value = sessionStorage.getItem(SIGNUP_INTENT_KEY);
  sessionStorage.removeItem(SIGNUP_INTENT_KEY);
  if (value === "candidate" || value === "employer_user") {
    return value;
  }
  return null;
}

export function signupIntentToApiRole(role: SignupIntentRole): "candidate" | "employer" {
  return role === "employer_user" ? "employer" : "candidate";
}
