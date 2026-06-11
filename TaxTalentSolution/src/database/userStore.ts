// =====================================================
// Tax Talent Solution — Local User Store
// Persists registered accounts to localStorage.
// Passwords are hashed with SHA-256 (Web Crypto API).
// FOR LOCAL/DEMO USE — not a production auth system.
// =====================================================

import { users, candidates, LocalDatabase } from './localDb';
import { saveProfile } from './profileStore';
import { localCredentials } from './localAuth';
import { CandidatePlan, BillingCycle, UserSubscription } from './types';
import { matchCandidateByLinkedInUrl } from '../api/candidateService';

const STORE_KEY = 'tts_user_accounts';

// ── Types ──────────────────────────────────────────────────────────────────
export interface StoredUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  country: string;
  role: 'candidate' | 'employer_user' | 'admin';
  passwordHash: string; // SHA-256 hex (salted)
  createdAt: string;
  status: 'active' | 'pending' | 'suspended';
}

// ── Password Hashing ───────────────────────────────────────────────────────
const SALT = 'tts_local_salt_2025';

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── Storage Helpers ────────────────────────────────────────────────────────
function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(list: StoredUser[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

// ── Registration ───────────────────────────────────────────────────────────
export async function registerUser(params: {
  email: string;
  password: string;
  name: string;
  phone: string;
  country: string;
  role: 'candidate' | 'employer_user';
  linkedInUrl?: string;
}): Promise<{ success: boolean; error?: string; user?: StoredUser }> {
  const emailLower = params.email.toLowerCase().trim();

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  // Enforce minimum password length
  if (params.password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' };
  }

  // Check duplicate in demo credentials
  if (localCredentials.some((c) => c.loginId.toLowerCase() === emailLower)) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  // Check duplicate in localStorage store
  const stored = getStoredUsers();
  if (stored.some((u) => u.email.toLowerCase() === emailLower)) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const passwordHash = await hashPassword(params.password);
  const now = new Date().toISOString();
  const id = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const newUser: StoredUser = {
    id,
    email: params.email.trim(),
    name: params.name.trim(),
    phone: params.phone.trim(),
    country: params.country,
    role: params.role,
    passwordHash,
    createdAt: now,
    status: 'active',
  };

  // Persist to localStorage
  saveStoredUsers([...stored, newUser]);

  // Push into the in-memory localDb users array so admin panels reflect it
  users.push({
    id,
    email: newUser.email,
    name: newUser.name,
    phone: newUser.phone,
    country: newUser.country,
    role: newUser.role,
    status: 'active',
    email_verified: false,
    phone_verified: false,
    created_at: now,
    updated_at: now,
  });

  // If candidate role → create a skeleton candidate profile
  let linkedInMatch: any = null;

  if (params.role === 'candidate') {
    const candidateId = `cnd-${id}`;

    // Try to find a matching LinkedIn profile to pre-populate
    if (params.linkedInUrl) {
      linkedInMatch = await matchCandidateByLinkedInUrl(params.linkedInUrl, id);
    }

    candidates.push({
      id: candidateId,
      user_id: id,
      headline: linkedInMatch?.title ?? '',
      summary: linkedInMatch?.summary ?? '',
      location_city: '',
      location_state: '',
      location_country: params.country,
      experience_years: 0,
      availability: 'immediate',
      work_mode: 'remote',
      linkedin_url: params.linkedInUrl,
      profile_completeness: linkedInMatch ? 80 : 10,
      status: 'pending',
      is_featured: false,
      profile_views: 0,
      rating: 0,
      created_at: now,
      updated_at: now,
    });

    // If LinkedIn matched, persist full profile so ProfilePage loads it immediately
    if (linkedInMatch) {
      saveProfile(id, {
        name: linkedInMatch.name || params.name,
        title: linkedInMatch.title || '',
        location: linkedInMatch.location || '',
        summary: linkedInMatch.summary || '',
        email: params.email,
        phone: params.phone,
        website: linkedInMatch.website || params.linkedInUrl || '',
        availability: 'Actively Looking',
        preferredLocation: '',
        experience: linkedInMatch.experience,
        education: linkedInMatch.education,
        skills: linkedInMatch.skills,
        certifications: linkedInMatch.certifications,
      });
    }
  }

  return { success: true, user: newUser, linkedInLoaded: !!linkedInMatch };
}

// ── Authentication ─────────────────────────────────────────────────────────
export async function authenticateStoredUser(
  email: string,
  password: string
): Promise<StoredUser | null> {
  const stored = getStoredUsers();
  const user = stored.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) return null;
  if (user.status === 'suspended') return null;

  const hash = await hashPassword(password);
  return hash === user.passwordHash ? user : null;
}

// ── Build Mock Session Object ──────────────────────────────────────────────
export function buildUserFromStored(stored: StoredUser) {
  return {
    id: stored.id,
    email: stored.email,
    user_metadata: {
      name: stored.name,
      role: stored.role === 'employer_user' ? 'employer' : stored.role,
      phone: stored.phone,
    },
    created_at: stored.createdAt,
    updated_at: stored.createdAt,
  };
}

// ── Admin Helpers ──────────────────────────────────────────────────────────
export function getAllStoredUsers(): StoredUser[] {
  return getStoredUsers();
}

export function deleteStoredUser(id: string): void {
  const filtered = getStoredUsers().filter((u) => u.id !== id);
  saveStoredUsers(filtered);
}

export function updateStoredUserStatus(id: string, status: StoredUser['status']): void {
  const list = getStoredUsers().map((u) => (u.id === id ? { ...u, status } : u));
  saveStoredUsers(list);
}

/**
 * Re-hydrate the in-memory localDb arrays from localStorage on every page load.
 * Call this once in App.tsx (useEffect with empty deps).
 */
export function initializeFromStorage(): void {
  const stored = getStoredUsers();
  if (stored.length === 0) return;

  for (const su of stored) {
    // Avoid duplicates in the users array
    if (!users.find(u => u.id === su.id)) {
      users.push({
        id: su.id,
        email: su.email,
        name: su.name,
        phone: su.phone,
        country: su.country,
        role: su.role,
        status: su.status,
        email_verified: false,
        phone_verified: false,
        created_at: su.createdAt,
        updated_at: su.createdAt,
      });
    }

    // If candidate role, ensure a candidate record exists
    if (su.role === 'candidate' && !candidates.find(c => c.user_id === su.id)) {
      candidates.push({
        id: `cnd-${su.id}`,
        user_id: su.id,
        headline: '',
        summary: '',
        location_city: '',
        location_state: '',
        location_country: su.country,
        experience_years: 0,
        availability: 'immediate',
        work_mode: 'remote',
        profile_completeness: 10,
        status: 'pending',
        is_featured: false,
        profile_views: 0,
        rating: 0,
        created_at: su.createdAt,
        updated_at: su.createdAt,
      });
    }
  }
}

// =====================================================
// Subscription Management
// Each user's subscription is stored under:
//   localStorage key: tts_subscription_<userId>
// =====================================================

const SUBSCRIPTION_KEY_PREFIX = 'tts_subscription_';

/** Pricing table — source of truth for prices shown in the UI */
export const PLAN_PRICING: Record<CandidatePlan, Record<BillingCycle, { amount: number; currency: string; display: string }>> = {
  free:         { monthly: { amount: 0,     currency: '₹', display: '₹0'       }, annual: { amount: 0,      currency: '₹', display: '₹0'        } },
  professional: { monthly: { amount: 1000,  currency: '₹', display: '₹1,000'   }, annual: { amount: 6000,   currency: '₹', display: '₹6,000'    } },
  premium:      { monthly: { amount: 10000, currency: '₹', display: '₹10,000'  }, annual: { amount: 60000,  currency: '₹', display: '₹60,000'   } },
};

/** Human-readable plan labels */
export const PLAN_LABELS: Record<CandidatePlan, string> = {
  free: 'Free',
  professional: 'Professional',
  premium: 'Premium',
};

/** Build a default Free subscription for a newly registered user */
function buildFreeSubscription(userId: string): UserSubscription {
  const now = new Date().toISOString();
  // Free plan: expires far in the future (effectively never)
  const farFuture = new Date();
  farFuture.setFullYear(farFuture.getFullYear() + 50);
  return {
    user_id: userId,
    plan: 'free',
    billing_cycle: 'monthly',
    status: 'active',
    start_date: now,
    expires_at: farFuture.toISOString(),
    updated_at: now,
  };
}

/** Load a user's subscription. Returns Free plan object if none saved yet. */
export function getSubscription(userId: string): UserSubscription {
  try {
    const raw = localStorage.getItem(`${SUBSCRIPTION_KEY_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw) as UserSubscription;
      return parsed;
    }
  } catch { /* ignore */ }
  return buildFreeSubscription(userId);
}

/** Persist a subscription to localStorage */
export function saveSubscription(userId: string, sub: Omit<UserSubscription, 'user_id' | 'updated_at'>): UserSubscription {
  const full: UserSubscription = {
    ...sub,
    user_id: userId,
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(`${SUBSCRIPTION_KEY_PREFIX}${userId}`, JSON.stringify(full));
  return full;
}

/**
 * Activate a paid plan for a user.
 * Calculates expires_at from today based on billing_cycle.
 */
export function activateSubscription(userId: string, plan: CandidatePlan, billing_cycle: BillingCycle): UserSubscription {
  const now = new Date();
  const expires = new Date(now);
  if (plan === 'free') {
    expires.setFullYear(expires.getFullYear() + 50);
  } else if (billing_cycle === 'annual') {
    expires.setFullYear(expires.getFullYear() + 1);
  } else {
    expires.setMonth(expires.getMonth() + 1);
  }
  return saveSubscription(userId, {
    plan,
    billing_cycle,
    status: 'active',
    start_date: now.toISOString(),
    expires_at: expires.toISOString(),
  });
}
