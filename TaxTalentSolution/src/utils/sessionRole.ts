/** Normalized portal role used by App routing. */
export type AppRole = "candidate" | "employer" | "admin";

const ROLE_NAME_KEY = "roleName";
const ROLE_ID_KEY = "roleId";
const USER_ID_KEY = "userId";

export function normalizeAppRole(roleName?: string | null): AppRole {
  if (!roleName) return "candidate";
  const normalized = roleName.toLowerCase();
  if (normalized.includes("admin")) return "admin";
  if (normalized.includes("employer")) return "employer";
  return "candidate";
}

/** Set role when user clicks Login from candidate or employer landing. */
export function setLoginSessionRole(role: "candidate" | "employer"): void {
  setSessionRole({
    roleName: role === "employer" ? "Employer" : "Candidate",
  });
}

export function setSessionRole(params: {
  roleName?: string;
  roleId?: string;
  userId?: string;
}): void {
  if (params.userId) {
    sessionStorage.setItem(USER_ID_KEY, params.userId);
  }
  if (params.roleId) {
    sessionStorage.setItem(ROLE_ID_KEY, params.roleId);
  }
  if (params.roleName) {
    sessionStorage.setItem(ROLE_NAME_KEY, params.roleName);
  }
}

/** Role name from session (e.g. "Employer", "Candidate"). */
export function getSessionRoleName(): string | null {
  return sessionStorage.getItem(ROLE_NAME_KEY);
}

export function getSessionRoleId(): string | null {
  return sessionStorage.getItem(ROLE_ID_KEY);
}

export function getSessionUserId(): string | null {
  return sessionStorage.getItem(USER_ID_KEY);
}

/** Normalized app role from sessionStorage (`candidate` | `employer` | `admin`). */
export function getSessionRole(): AppRole {
  return normalizeAppRole(getSessionRoleName());
}

export function clearSessionRole(): void {
  sessionStorage.removeItem(ROLE_NAME_KEY);
  sessionStorage.removeItem(ROLE_ID_KEY);
  sessionStorage.removeItem(USER_ID_KEY);
}
