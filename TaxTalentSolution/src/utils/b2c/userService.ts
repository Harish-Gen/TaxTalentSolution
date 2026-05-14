// =====================================================
// Azure AD B2C User Management Service
// Tax Talent Solution
// Responsibilities:
//   1. Create / upsert a user in the app DB after B2C sign-up
//   2. Authenticate (verify B2C token) on sign-in
//   3. Fetch & update extended profile attributes via Microsoft Graph
// =====================================================
import { getAccessToken }      from "./authService";
import type { B2CUser }        from "./authService";
import { B2C_TENANT_DOMAIN, B2C_CLIENT_ID } from "./config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppUser {
  id:             string;   // UUID in our DB (= B2C objectId)
  b2c_object_id:  string;
  email:          string;
  name:           string;
  phone?:         string;
  country?:       string;
  role:           "candidate" | "employer_user" | "admin";
  status:         "active" | "pending" | "suspended";
  email_verified: boolean;
  phone_verified: boolean;
  created_at:     string;
  updated_at:     string;
  last_login:     string;
}

export interface CreateUserPayload {
  b2cUser:  B2CUser;
  role?:    "candidate" | "employer_user";
  country?: string;
  phone?:   string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Derives the app-DB API base URL.  Replace with your actual backend URL when
 * you have one; for now it calls the existing Supabase Edge Function server.
 */
const API_BASE = (() => {
  // Import values already available in the project
  // (avoids a circular import through utils/supabase/info)
  const projectId = (import.meta as Record<string, unknown>).env?.["VITE_SUPABASE_PROJECT_ID"] as string
    ?? "tajwgghfoqlsykteyagd";
  return `https://${projectId}.supabase.co/functions/v1/make-server-aefcc52e`;
})();

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Called after a successful B2C sign-UP.
 * Creates the user record in the application database and returns the AppUser.
 */
export async function createUserAfterSignUp(payload: CreateUserPayload): Promise<AppUser> {
  const { b2cUser, role = "candidate", country, phone } = payload;

  const appUser = await apiPost<AppUser>("/users", {
    b2c_object_id:  b2cUser.objectId,
    email:          b2cUser.email,
    name:           b2cUser.name,
    phone:          phone ?? b2cUser.phone,
    country:        country ?? b2cUser.country ?? "IN",
    role,
    status:         "pending",     // pending until phone OTP is verified
    email_verified: false,
    phone_verified: false,
    oauth_provider: "azure_b2c",
  });

  return appUser;
}

/**
 * Called after a successful B2C sign-IN.
 * Upserts last_login and returns the AppUser from the database.
 */
export async function syncUserOnSignIn(b2cUser: B2CUser): Promise<AppUser> {
  const appUser = await apiPost<AppUser>("/users/sync", {
    b2c_object_id:  b2cUser.objectId,
    email:          b2cUser.email,
    name:           b2cUser.name,
    last_login:     new Date().toISOString(),
  });

  return appUser;
}

/**
 * Fetch the current user's profile from the app database.
 */
export async function fetchAppUser(b2cObjectId: string): Promise<AppUser | null> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/users/${b2cObjectId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<AppUser>;
}

/**
 * Update extended profile attributes in Azure AD B2C via Microsoft Graph API.
 * Requires the app to have User.ReadWrite.All permission in Graph.
 *
 * NOTE: This runs server-side; do NOT call Graph directly from the browser SPA
 * with a client secret.  Wire this up in your backend (Azure Function / Node).
 */
export async function updateB2CUserAttributes(
  b2cObjectId: string,
  attrs: { displayName?: string; mobilePhone?: string; country?: string }
): Promise<void> {
  await apiPost<void>("/users/b2c-attributes", {
    b2c_object_id: b2cObjectId,
    ...attrs,
  });
}

// ─── Role helpers ─────────────────────────────────────────────────────────────

export function getRoleFromB2CToken(b2cUser: B2CUser): "candidate" | "employer_user" | "admin" {
  const roles = b2cUser.roles.map((r) => r.toLowerCase().trim());
  if (roles.includes("admin"))         return "admin";
  if (roles.includes("employer_user")) return "employer_user";
  return "candidate";
}

// ─── Graph API helpers (server-side use) ─────────────────────────────────────

/**
 * Returns the Microsoft Graph URL for a B2C user by objectId.
 * Use this in your Azure Functions / backend to call Graph with a client credential.
 */
export function graphUserUrl(b2cObjectId: string): string {
  return `https://graph.microsoft.com/v1.0/users/${b2cObjectId}`;
}

export const GRAPH_SCOPES = ["https://graph.microsoft.com/.default"];

// Custom attributes registered in your B2C tenant
// The extension app client ID is usually the B2C App Registration where you defined them.
// Replace EXTENSION_APP_ID with the app-ID you registered for custom attributes.
export const EXTENSION_APP_ID = "YOUR_B2C_EXTENSION_APP_CLIENT_ID";

export function customAttrName(attr: string): string {
  const sanitised = EXTENSION_APP_ID.replace(/-/g, "");
  return `extension_${sanitised}_${attr}`;
}

// Pre-built attribute names (ready to use in Graph PATCH calls)
export const GRAPH_ATTRIBUTES = {
  phoneNumber: customAttrName("PhoneNumber"),
  country:     customAttrName("Country"),
  role:        customAttrName("Role"),
  appUserId:   customAttrName("AppUserId"),
};

// Tenant info (useful for Graph calls from your backend)
export const TENANT_INFO = {
  domain:   B2C_TENANT_DOMAIN,
  clientId: B2C_CLIENT_ID,
};
