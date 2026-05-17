import { apiRequest } from './apiService';
import type { Candidate as DBCandidate, CandidateStatus } from '../database/types';

export interface BackendCandidateUser {
  id?: string;
  name?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
}

export interface BackendCandidate {
  id: string;
  userid?: string;
  name?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  user?: BackendCandidateUser;
  location?: any;
  currenttitle?: string;
  experienceyrs?: number;
  noticeperiod?: number;
  taxexpertise?: string[] | string;
  certifications?: string[] | string;
  hourlyrate?: number;
  currency?: string;
  availability?: string;
  workmode?: string;
  resumeurl?: string;
  status?: string;
  stage?: string;
  isactive?: boolean;
  createdon?: string;
  modifiedon?: string;
}

export function parseTaxExpertise(value?: string[] | string): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [value];
    } catch {
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function resolveCandidateName(backend: BackendCandidate): string {
  const user = backend.user;
  const fromParts = (first?: string, last?: string) =>
    `${first || ''} ${last || ''}`.trim();

  const direct =
    backend.name?.trim() ||
    fromParts(backend.firstname, backend.lastname) ||
    user?.name?.trim() ||
    fromParts(user?.firstname, user?.lastname);

  if (direct) return direct;

  const email = backend.email || user?.email;
  if (email) {
    const local = email.split('@')[0]?.replace(/[._]/g, ' ').trim();
    if (local) {
      return local.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  return 'Candidate';
}

function mapToDBCandidate(backend: BackendCandidate): DBCandidate & {
  name?: string;
  email?: string;
  phone?: string;
  firstname?: string;
  lastname?: string;
  tax_expertise?: string[];
} {
  const backendAny = backend as BackendCandidate & {
    locationcity?: string;
    locationstate?: string;
    locationcountry?: string;
  };
  const isLocationObject = backend.location && typeof backend.location === 'object' && !Array.isArray(backend.location);
  const city =
    backendAny.locationcity ||
    (isLocationObject ? backend.location.city : typeof backend.location === 'string' ? backend.location : '');
  const state = backendAny.locationstate || (isLocationObject ? backend.location.state : '');
  const country = backendAny.locationcountry || (isLocationObject ? backend.location.country : '') || 'IN';

  const user = backend.user;

  return {
    id: backend.id,
    user_id: backend.userid || user?.id || '',
    name: resolveCandidateName(backend),
    firstname: backend.firstname || user?.firstname,
    lastname: backend.lastname || user?.lastname,
    email: backend.email || user?.email,
    phone: backend.phone || user?.phone,
    headline: backend.currenttitle || '',
    summary: '', 
    location_city: city,
    location_state: state,
    location_country: country || 'IN',
    experience_years: backend.experienceyrs || 0,
    availability: (backend.availability as any) || 'immediate',
    work_mode: (backend.workmode as any) || 'remote',
    hourly_rate: backend.hourlyrate || 0,
    status: (backend.status as any) || 'pending',
    profile_completeness: 0,
    is_featured: false,
    profile_views: 0,
    rating: 0,
    created_at: backend.createdon || new Date().toISOString(),
    updated_at: backend.modifiedon || new Date().toISOString(),
    tax_expertise: parseTaxExpertise(backend.taxexpertise),
  };
}

function mapToBackend(frontend: any): Partial<BackendCandidate> & { userid?: string } {
  return {
    id: frontend.id,
    userid: frontend.userid || frontend.user_id,
    name: frontend.name,
    firstname: frontend.firstname,
    lastname: frontend.lastname,
    email: frontend.email,
    phone: frontend.phone,
    location: {
      city: frontend.location_city || '',
      state: frontend.location_state || '',
      country: frontend.location_country || 'IN',
    },
    locationcity: frontend.location_city,
    locationstate: frontend.location_state,
    locationcountry: frontend.location_country || 'IN',
    currenttitle: frontend.headline,
    experienceyrs: frontend.experience_years,
    noticeperiod: frontend.noticeperiod || 90,
    taxexpertise: frontend.taxexpertise || ["string"],
    certifications: frontend.certifications || ["string"],
    hourlyrate: frontend.hourly_rate,
    currency: frontend.currency || "inr",
    availability: frontend.availability,
    workmode: frontend.work_mode,
    resumeurl: frontend.resumeurl || "string",
    status: frontend.status || 'pending',
    stage: frontend.stage || "string",
    isactive: frontend.isactive ?? true,
  };
}

export const candidateService = {
  async getCandidates(): Promise<(DBCandidate & { name?: string; email?: string; phone?: string })[]> {
    const data = await apiRequest<BackendCandidate[]>('/api/candidates/');
    return data.map(mapToDBCandidate);
  },

  async getCandidateById(id: string): Promise<DBCandidate & { name?: string; email?: string; phone?: string }> {
    const data = await apiRequest<BackendCandidate>(`/api/candidates/${id}`);
    return mapToDBCandidate(data);
  },

  async getCandidateByUserId(
    userId: string,
    options?: { ensure?: boolean }
  ): Promise<(DBCandidate & { name?: string; email?: string; phone?: string }) | null> {
    try {
      const query = options?.ensure ? '?ensure=true' : '';
      const data = await apiRequest<BackendCandidate | null>(
        `/api/candidates/user/${userId}${query}`
      );
      if (!data) return null;
      return mapToDBCandidate(data);
    } catch {
      return null;
    }
  },

  async upsertCandidate(candidate: Partial<DBCandidate> & { name?: string; phone?: string; email?: string; firstname?: string; lastname?: string }): Promise<DBCandidate & { name?: string; email?: string; phone?: string }> {
    const backendData = mapToBackend(candidate);
    const data = await apiRequest<BackendCandidate>('/api/candidates/', 'POST', backendData);
    return mapToDBCandidate(data);
  },

  async updateStatus(id: string, status: CandidateStatus): Promise<DBCandidate & { name?: string; email?: string; phone?: string }> {
    return this.upsertCandidate({ id, status });
  }
};
