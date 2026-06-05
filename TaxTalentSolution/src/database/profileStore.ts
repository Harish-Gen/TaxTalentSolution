// =====================================================
// Tax Talent Solution — Profile Persistence Store
// Uses localStorage to persist candidate profile data
// per user ID across page refreshes.
// =====================================================

const STORE_KEY_PREFIX = 'tts_profile_';
const IMAGE_KEY_PREFIX = 'tts_profile_img_';
const RESUME_KEY_PREFIX = 'tts_profile_resume_';

export interface StoredProfile {
  name: string;
  title: string;
  location: string;
  summary: string;
  email: string;
  phone: string;
  website: string;
  availability: string;
  preferredLocation: string;
  experience: Array<{
    id: number;
    company: string;
    position: string;
    duration: string;
    location: string;
    description: string;
  }>;
  education: Array<{
    id: number;
    institution: string;
    degree: string;
    field: string;
    duration: string;
    description: string;
  }>;
  skills: string[];
  certifications: string[];
  savedAt?: string;
}

function storeKey(userId: string) {
  return `${STORE_KEY_PREFIX}${userId}`;
}

function imageKey(userId: string) {
  return `${IMAGE_KEY_PREFIX}${userId}`;
}

function resumeKey(userId: string) {
  return `${RESUME_KEY_PREFIX}${userId}`;
}

export interface StoredResume {
  blobName: string;
  displayName: string;
  size: number;
  savedAt?: string;
}

/** Blank profile seeded from signup / auth user fields only. */
export function createEmptyProfileFromUser(user: {
  email?: string;
  phone?: string;
  displayName?: string;
  user_metadata?: { name?: string; phone?: string };
} | null | undefined): StoredProfile {
  return {
    name: user?.user_metadata?.name || user?.displayName || "",
    title: "",
    location: "",
    summary: "",
    email: user?.email ?? "",
    phone: user?.user_metadata?.phone || user?.phone || "",
    website: "",
    availability: "Actively Looking",
    preferredLocation: "",
    experience: [],
    education: [],
    skills: [],
    certifications: [],
  };
}

/** Display name for certificates and similar UI (profile first, then auth metadata). */
export function getProfileDisplayName(
  userId: string,
  user?: {
    email?: string;
    user_metadata?: { name?: string };
  } | null
): string {
  const saved = loadProfile(userId);
  if (saved?.name?.trim()) return saved.name.trim();

  const metaName = user?.user_metadata?.name;
  if (typeof metaName === "string" && metaName.trim()) return metaName.trim();

  try {
    const sessionName = sessionStorage.getItem("userName");
    if (sessionName?.trim()) return sessionName.trim();
  } catch {
    // sessionStorage unavailable
  }

  if (user?.email) {
    const localPart = user.email.split("@")[0]?.trim();
    if (localPart) return localPart;
  }

  return "Certificate Recipient";
}

/** Load a saved profile for a user. Returns null if none saved yet. */
export function loadProfile(userId: string): StoredProfile | null {
  try {
    const raw = localStorage.getItem(storeKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredProfile;
  } catch {
    return null;
  }
}

/** Persist the full profile for a user. */
export function saveProfile(userId: string, profile: StoredProfile): void {
  try {
    const data: StoredProfile = { ...profile, savedAt: new Date().toISOString() };
    localStorage.setItem(storeKey(userId), JSON.stringify(data));
  } catch {
    // localStorage may be full – silently ignore
  }
}

/** Load saved profile image (base64 data URL). Returns null if none. */
export function loadProfileImage(userId: string): string | null {
  try {
    return localStorage.getItem(imageKey(userId));
  } catch {
    return null;
  }
}

/** Persist profile image as base64 data URL. */
export function saveProfileImage(userId: string, dataUrl: string): void {
  try {
    localStorage.setItem(imageKey(userId), dataUrl);
  } catch {
    // Image storage may exceed quota – silently ignore
  }
}

/** Load saved resume metadata for a user. */
export function loadResume(userId: string): StoredResume | null {
  try {
    const raw = localStorage.getItem(resumeKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredResume;
  } catch {
    return null;
  }
}

/** Persist resume metadata (blob path in cloud storage). */
export function saveResume(userId: string, resume: StoredResume): void {
  try {
    const data: StoredResume = { ...resume, savedAt: new Date().toISOString() };
    localStorage.setItem(resumeKey(userId), JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function clearResume(userId: string): void {
  try {
    localStorage.removeItem(resumeKey(userId));
  } catch {
    // ignore
  }
}

/** Clear all stored data for a user (e.g., on logout). */
export function clearProfile(userId: string): void {
  try {
    localStorage.removeItem(storeKey(userId));
    localStorage.removeItem(imageKey(userId));
    localStorage.removeItem(resumeKey(userId));
  } catch {
    // ignore
  }
}
