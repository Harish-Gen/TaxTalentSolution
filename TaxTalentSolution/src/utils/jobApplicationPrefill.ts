import { competencyService } from "../api/competencyService";
import { candidateService } from "../api/candidateService";
import {
  createEmptyProfileFromUser,
  loadProfile,
  loadResume,
  type StoredProfile,
} from "../database/profileStore";
import type { UploadedStorageFile } from "../components/ui/storage-file-upload";

export type SkillLevel = "basic" | "intermediate" | "expert" | "not-applicable" | "";

export interface SkillRatings {
  [key: string]: SkillLevel;
}

export interface RoleEntry {
  id: string;
  responsibility: string;
  percentage: string;
}

export interface JobApplicationPrefill {
  linkedinProfile: string;
  email: string;
  phone: string;
  skillRatings: SkillRatings;
  whyHireMe: string;
  roleEntries: RoleEntry[];
  currentCompensation: string;
  expectedCompensation: string;
  compensationRevisedDate: string;
  resume: UploadedStorageFile | null;
}

interface CompetenciesJson {
  skillRatings?: SkillRatings;
  whyHireMe?: string;
  roleEntries?: RoleEntry[];
  roleDistribution?: Record<string, string>;
  currentCompensation?: string | number;
  expectedCompensation?: string | number;
  compensationRevisedDate?: string;
  savedAt?: string;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

function formatInrAmount(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "";
  const num = typeof value === "number" ? value : Number(String(value).replace(/\D/g, ""));
  if (!Number.isFinite(num) || num <= 0) return "";
  return num.toLocaleString("en-IN");
}

function isLinkedInUrl(url: string): boolean {
  return /linkedin\.com/i.test(url);
}

function resolveLinkedIn(profile: StoredProfile, candidateLinkedIn?: string): string {
  if (candidateLinkedIn?.trim()) return candidateLinkedIn.trim();
  const website = profile.website?.trim() ?? "";
  if (website && isLinkedInUrl(website)) return website;
  if (website && !/^https?:\/\//i.test(website)) {
    return website.includes("linkedin") ? `https://${website.replace(/^\/+/, "")}` : website;
  }
  return website;
}

function parseRoleEntries(saved: CompetenciesJson): RoleEntry[] | null {
  if (saved.roleEntries?.length) {
    return saved.roleEntries.map((entry) => ({
      id: entry.id || `role-${Math.random().toString(36).slice(2, 9)}`,
      responsibility: entry.responsibility || "",
      percentage: String(entry.percentage ?? ""),
    }));
  }
  if (saved.roleDistribution && Object.keys(saved.roleDistribution).length > 0) {
    return Object.entries(saved.roleDistribution).map(([responsibility, percentage]) => ({
      id: `role-${Math.random().toString(36).slice(2, 9)}`,
      responsibility,
      percentage: String(percentage),
    }));
  }
  return null;
}

function parseCompetenciesJson(raw: CompetenciesJson | null): Partial<JobApplicationPrefill> {
  if (!raw) return {};

  const roleEntries = parseRoleEntries(raw);
  return {
    skillRatings: raw.skillRatings ?? {},
    whyHireMe: raw.whyHireMe?.trim() ?? "",
    roleEntries: roleEntries ?? undefined,
    currentCompensation: formatInrAmount(raw.currentCompensation),
    expectedCompensation: formatInrAmount(raw.expectedCompensation),
    compensationRevisedDate: raw.compensationRevisedDate?.trim() ?? "",
  };
}

async function loadCompetenciesPrefill(targetUserId: string): Promise<Partial<JobApplicationPrefill>> {
  try {
    const data = await competencyService.getCompetencies(targetUserId);
    let result: { competenciesjson?: CompetenciesJson | string } | null = null;

    if (Array.isArray(data) && data.length > 0) {
      result = [...data].sort((a, b) => {
        const jsonA =
          typeof a.competenciesjson === "string"
            ? JSON.parse(a.competenciesjson)
            : a.competenciesjson;
        const jsonB =
          typeof b.competenciesjson === "string"
            ? JSON.parse(b.competenciesjson)
            : b.competenciesjson;
        const dateA = new Date(
          jsonA?.savedAt || (a as { createdon?: string }).createdon || 0
        ).getTime();
        const dateB = new Date(
          jsonB?.savedAt || (b as { createdon?: string }).createdon || 0
        ).getTime();
        return dateB - dateA;
      })[0];
    } else if (data && !Array.isArray(data)) {
      result = data;
    }

    if (result?.competenciesjson) {
      const saved =
        typeof result.competenciesjson === "string"
          ? (JSON.parse(result.competenciesjson) as CompetenciesJson)
          : result.competenciesjson;
      return parseCompetenciesJson(saved);
    }
  } catch {
    // fall through to localStorage
  }

  try {
    const raw = localStorage.getItem(`tts_competencies_${targetUserId}`);
    if (raw) return parseCompetenciesJson(JSON.parse(raw) as CompetenciesJson);
  } catch {
    // ignore
  }

  return {};
}

export async function loadJobApplicationPrefill(
  userId: string,
  user?: {
    id?: string;
    email?: string;
    phone?: string;
    user_metadata?: { name?: string; phone?: string };
  } | null
): Promise<JobApplicationPrefill> {
  const empty = createEmptyProfileFromUser(user);
  const saved = userId !== "guest" ? loadProfile(userId) : null;
  const profile: StoredProfile = saved
    ? { ...empty, ...saved, email: user?.email || saved.email || empty.email }
    : empty;

  const targetUserId =
    (typeof sessionStorage !== "undefined" && sessionStorage.getItem("userId")) ||
    userId;

  const [competenciesPrefill, candidate] = await Promise.all([
    targetUserId && targetUserId !== "guest"
      ? loadCompetenciesPrefill(targetUserId)
      : Promise.resolve({} as Partial<JobApplicationPrefill>),
    targetUserId && targetUserId !== "guest"
      ? candidateService.getCandidateByUserId(targetUserId).catch(() => null)
      : Promise.resolve(null),
  ]);

  const storedResume = userId !== "guest" ? loadResume(userId) : null;
  const resume: UploadedStorageFile | null = storedResume
    ? {
        blobName: storedResume.blobName,
        displayName: storedResume.displayName,
        size: storedResume.size,
      }
    : null;

  const email = profile.email?.trim() || user?.email?.trim() || "";
  const phone = normalizePhone(profile.phone || user?.user_metadata?.phone || user?.phone || "");

  const whyHireMe =
    competenciesPrefill.whyHireMe ||
    profile.summary?.trim() ||
    "";

  const roleEntries =
    competenciesPrefill.roleEntries && competenciesPrefill.roleEntries.length > 0
      ? competenciesPrefill.roleEntries
      : [{ id: `role-${Date.now()}`, responsibility: "", percentage: "" }];

  return {
    linkedinProfile: resolveLinkedIn(profile, candidate?.linkedin_url),
    email,
    phone,
    skillRatings: competenciesPrefill.skillRatings ?? {},
    whyHireMe,
    roleEntries,
    currentCompensation:
      competenciesPrefill.currentCompensation ||
      formatInrAmount(candidate?.current_salary),
    expectedCompensation:
      competenciesPrefill.expectedCompensation ||
      formatInrAmount(candidate?.expected_salary_max ?? candidate?.expected_salary_min),
    compensationRevisedDate: competenciesPrefill.compensationRevisedDate ?? "",
    resume,
  };
}
