// =====================================================
// Azure AD B2C Authentication Service
// Tax Talent Solution – sign-up, sign-in, sign-out,
// token acquisition and account helpers
// =====================================================
import {
  InteractionRequiredAuthError,
  type AccountInfo,
  type AuthenticationResult,
  type SilentRequest,
} from "@azure/msal-browser";
import { msalInstance } from "./msalInstance";
import { B2C_AUTHORITIES, B2C_SCOPES, loginRequest, silentRequest } from "./config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface B2CUser {
  objectId:    string;       // B2C's unique identifier (oid claim)
  email:       string;
  name:        string;
  phone?:      string;
  country?:    string;
  idToken:     string;
  accessToken: string;
  roles:       string[];
  isNew:       boolean;      // true when B2C fires the sign-UP event
}

export interface B2CAuthResult {
  success:      boolean;
  user?:        B2CUser;
  error?:       string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function accountToB2CUser(result: AuthenticationResult, isNew = false): B2CUser {
  const claims = result.idTokenClaims as Record<string, unknown>;
  return {
    objectId:    (claims["oid"] as string)   ?? result.account!.localAccountId,
    email:       (claims["emails"] as string[])?.[0] ?? result.account!.username,
    name:        (claims["name"]   as string) ?? result.account!.name ?? "",
    phone:       claims["extension_PhoneNumber"] as string | undefined,
    country:     claims["country"]             as string | undefined,
    idToken:     result.idToken,
    accessToken: result.accessToken,
    roles:       (claims["extension_Roles"] as string ?? "candidate").split(","),
    isNew,
  };
}

// ─── Sign-up / Sign-in (redirect) ─────────────────────────────────────────────

/**
 * Trigger the B2C sign-up-and-sign-in user flow via redirect.
 * The result is handled in initialiseMsal() on the next page load.
 */
export async function signInWithB2C(): Promise<void> {
  await msalInstance.loginRedirect(loginRequest);
}

/**
 * Trigger B2C sign-up with pre-filled hint fields.
 */
export async function signUpWithB2C(opts?: {
  loginHint?: string;
  extraQueryParameters?: Record<string, string>;
}): Promise<void> {
  await msalInstance.loginRedirect({
    ...loginRequest,
    authority:           B2C_AUTHORITIES.signUpSignIn.authority,
    loginHint:           opts?.loginHint,
    extraQueryParameters: {
      option: "signup",          // tells B2C to open the Sign-Up tab
      ...(opts?.extraQueryParameters ?? {}),
    },
  });
}

/**
 * Trigger password-reset user flow via redirect.
 */
export async function resetPasswordWithB2C(): Promise<void> {
  await msalInstance.loginRedirect({
    scopes:    B2C_SCOPES.signIn,
    authority: B2C_AUTHORITIES.passwordReset.authority,
  });
}

// ─── Popup variants (used when redirect is blocked) ───────────────────────────

export async function signInPopup(): Promise<B2CAuthResult> {
  try {
    const result = await msalInstance.loginPopup(loginRequest);
    const isNew  = !!(result.idTokenClaims as Record<string, unknown>)["newUser"];
    return { success: true, user: accountToB2CUser(result, isNew) };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function signUpPopup(loginHint?: string): Promise<B2CAuthResult> {
  try {
    const result = await msalInstance.loginPopup({
      ...loginRequest,
      authority:           B2C_AUTHORITIES.signUpSignIn.authority,
      loginHint,
      extraQueryParameters: { option: "signup" },
    });
    return { success: true, user: accountToB2CUser(result, true) };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

// ─── Sign-out ──────────────────────────────────────────────────────────────────

export async function signOutB2C(): Promise<void> {
  const account = msalInstance.getActiveAccount();
  if (account) {
    await msalInstance.logoutRedirect({ account });
  }
}

// ─── Token acquisition ─────────────────────────────────────────────────────────

/**
 * Returns a valid access token silently; falls back to interactive redirect.
 */
export async function getAccessToken(): Promise<string | null> {
  const account = msalInstance.getActiveAccount();
  if (!account) return null;

  const request: SilentRequest = { ...silentRequest, account };
  try {
    const result = await msalInstance.acquireTokenSilent(request);
    return result.accessToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      // Refresh failed – re-prompt the user
      await msalInstance.acquireTokenRedirect(request);
    }
    return null;
  }
}

// ─── Account helpers ───────────────────────────────────────────────────────────

export function getActiveB2CAccount(): AccountInfo | null {
  return msalInstance.getActiveAccount();
}

export function isSignedIn(): boolean {
  return !!msalInstance.getActiveAccount();
}

/**
 * Returns a B2CUser from the currently cached account (no network call).
 */
export function getB2CUserFromCache(): B2CUser | null {
  const account = msalInstance.getActiveAccount();
  if (!account) return null;
  const claims = (account.idTokenClaims ?? {}) as Record<string, unknown>;
  return {
    objectId:    account.localAccountId,
    email:       (claims["emails"] as string[])?.[0] ?? account.username,
    name:        (claims["name"] as string) ?? account.name ?? "",
    phone:       claims["extension_PhoneNumber"] as string | undefined,
    country:     claims["country"]             as string | undefined,
    idToken:     "",   // not available from cache alone
    accessToken: "",
    roles:       (claims["extension_Roles"] as string ?? "candidate").split(","),
    isNew:       false,
  };
}
