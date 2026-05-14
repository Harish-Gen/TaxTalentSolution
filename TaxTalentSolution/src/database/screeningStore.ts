// =====================================================
// Tax Talent Solution — Admin Screening Store
// Persists admin screening assessments per candidate
// in localStorage under key: tts_screening_<candidateId>
// =====================================================

const STORE_KEY_PREFIX = 'tts_screening_';

export interface ScreeningCategory {
  rating: number;   // 1-10
  comments: string;
}

export interface StoredScreening {
  domainKnowledge: ScreeningCategory;
  communicationSkills: ScreeningCategory;
  interpersonalSkills: ScreeningCategory;
  leadershipAbility: ScreeningCategory;
  cultureFit: ScreeningCategory;
  overallRating: ScreeningCategory;
  verifiedBy: string;
  lastUpdated: string; // ISO date string
}

export const DEFAULT_SCREENING: StoredScreening = {
  domainKnowledge:      { rating: 0, comments: '' },
  communicationSkills:  { rating: 0, comments: '' },
  interpersonalSkills:  { rating: 0, comments: '' },
  leadershipAbility:    { rating: 0, comments: '' },
  cultureFit:           { rating: 0, comments: '' },
  overallRating:        { rating: 0, comments: '' },
  verifiedBy: 'Admin',
  lastUpdated: new Date().toISOString().split('T')[0],
};

function storeKey(candidateId: string) {
  return `${STORE_KEY_PREFIX}${candidateId}`;
}

/** Load screening data for a candidate. Returns null if not yet saved. */
export function loadScreening(candidateId: string): StoredScreening | null {
  try {
    const raw = localStorage.getItem(storeKey(candidateId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredScreening;
  } catch {
    return null;
  }
}

/** Persist screening data for a candidate. */
export function saveScreening(candidateId: string, data: StoredScreening): void {
  try {
    localStorage.setItem(storeKey(candidateId), JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}
