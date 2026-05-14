// =====================================================
// Tax Talent Solution — Profile Persistence Store
// Uses localStorage to persist candidate profile data
// per user ID across page refreshes.
// =====================================================

const STORE_KEY_PREFIX = 'tts_profile_';
const IMAGE_KEY_PREFIX = 'tts_profile_img_';

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

/** Clear all stored data for a user (e.g., on logout). */
export function clearProfile(userId: string): void {
  try {
    localStorage.removeItem(storeKey(userId));
    localStorage.removeItem(imageKey(userId));
  } catch {
    // ignore
  }
}
