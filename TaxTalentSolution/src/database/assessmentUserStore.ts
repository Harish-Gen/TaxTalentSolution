// Per-user assessment progress and completions (local accounts / offline fallback)

const KEY_PREFIX = 'tts_user_assessment_';

export interface StoredUserAssessment {
  assessmentId: string;
  title: string;
  status: 'in_progress' | 'completed';
  progress: number;
  score?: number;
  questionsAnswered?: number;
  totalQuestions?: number;
  timeLeftMinutes?: number;
  completedAt?: string;
  credentialId?: string;
}

function storeKey(userId: string) {
  return `${KEY_PREFIX}${userId}`;
}

export function loadUserAssessments(userId: string): StoredUserAssessment[] {
  try {
    const raw = localStorage.getItem(storeKey(userId));
    return raw ? (JSON.parse(raw) as StoredUserAssessment[]) : [];
  } catch {
    return [];
  }
}

function saveAll(userId: string, list: StoredUserAssessment[]): void {
  try {
    localStorage.setItem(storeKey(userId), JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function upsertUserAssessment(
  userId: string,
  record: StoredUserAssessment
): void {
  const list = loadUserAssessments(userId);
  const idx = list.findIndex((r) => r.assessmentId === record.assessmentId);
  if (idx >= 0) list[idx] = { ...list[idx], ...record };
  else list.push(record);
  saveAll(userId, list);
}

export function markAssessmentInProgress(
  userId: string,
  assessmentId: string,
  title: string,
  totalQuestions: number
): void {
  upsertUserAssessment(userId, {
    assessmentId,
    title,
    status: 'in_progress',
    progress: 0,
    questionsAnswered: 0,
    totalQuestions,
    timeLeftMinutes: 45,
  });
}

export function markAssessmentCompleted(
  userId: string,
  assessmentId: string,
  title: string,
  score: number,
  totalQuestions: number
): void {
  const credentialId = `TT-${assessmentId.slice(0, 8).toUpperCase()}-${Date.now()}`;
  upsertUserAssessment(userId, {
    assessmentId,
    title,
    status: 'completed',
    progress: 100,
    score,
    questionsAnswered: totalQuestions,
    totalQuestions,
    completedAt: new Date().toISOString(),
    credentialId,
  });
}
