const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "entraUser";

export interface EntraIdTokenClaims {
  sub?: string;
  oid?: string;
  email?: string;
  preferred_username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  exp?: number;
  [key: string]: unknown;
}

export function decodeJwtPayload(token: string): EntraIdTokenClaims | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const padded =
      payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as EntraIdTokenClaims;
  } catch {
    return null;
  }
}

export function getEmailFromClaims(claims: EntraIdTokenClaims): string {
  return (
    (claims.email as string) ||
    (claims.preferred_username as string) ||
    ""
  );
}

export function getDisplayNameFromClaims(claims: EntraIdTokenClaims): string {
  if (claims.name) return String(claims.name);
  const parts = [claims.given_name, claims.family_name].filter(Boolean);
  if (parts.length) return parts.join(" ");
  const email = getEmailFromClaims(claims);
  return email ? email.split("@")[0] : "User";
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp < Math.floor(Date.now() / 1000);
}

export function getAuthToken(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredEntraUser(): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredEntraUser(user: Record<string, unknown>): void {
  sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function hasActiveEntraSession(): boolean {
  const token = getAuthToken();
  const user = getStoredEntraUser();
  return Boolean(token && user && !isTokenExpired(token));
}

export function getEntraSessionView(): string | null {
  if (!hasActiveEntraSession()) return null;
  const user = getStoredEntraUser();
  const role =
    (user?.user_metadata as { role?: string } | undefined)?.role ?? "candidate";
  if (role === "admin") return "admin-portal";
  if (role === "employer") return "employer-portal";
  return "dashboard";
}

/** App user shape used by App.tsx / dashboards (Supabase-compatible). */
export function buildAppUserFromClaims(
  claims: EntraIdTokenClaims,
  role: string = "candidate"
) {
  const email = getEmailFromClaims(claims);
  return {
    id: (claims.oid as string) || (claims.sub as string) || email,
    email,
    user_metadata: {
      name: getDisplayNameFromClaims(claims),
      role,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export { getPhoneFromClaims } from "./claims";
