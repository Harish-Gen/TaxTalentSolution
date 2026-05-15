import { apiRequest } from './apiService';
import type { Candidate as DBCandidate, CandidateStatus } from '../database/types';

export interface BackendCandidate {
  id: string;
  name?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
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

function mapToDBCandidate(backend: BackendCandidate): DBCandidate & { name?: string; email?: string; phone?: string; firstname?: string; lastname?: string } {
  const isLocationObject = backend.location && typeof backend.location === 'object' && !Array.isArray(backend.location);
  const city = isLocationObject ? backend.location.city : (typeof backend.location === 'string' ? backend.location : '');
  const state = isLocationObject ? backend.location.state : '';

  return {
    id: backend.id,
    user_id: '', 
    name: backend.name || `${backend.firstname || ''} ${backend.lastname || ''}`.trim() || 'Unknown',
    firstname: backend.firstname,
    lastname: backend.lastname,
    email: backend.email,
    phone: backend.phone,
    headline: backend.currenttitle || '',
    summary: '', 
    location_city: city,
    location_state: state,
    location_country: 'India',
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
  };
}

function mapToBackend(frontend: any): Partial<BackendCandidate> {
  return {
    id: frontend.id,
    name: frontend.name,
    firstname: frontend.firstname,
    lastname: frontend.lastname,
    email: frontend.email,
    phone: frontend.phone,
    location: {
      city: frontend.location_city || '',
      state: frontend.location_state || ''
    },
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

  async upsertCandidate(candidate: Partial<DBCandidate> & { name?: string; phone?: string; email?: string; firstname?: string; lastname?: string }): Promise<DBCandidate & { name?: string; email?: string; phone?: string }> {
    const backendData = mapToBackend(candidate);
    const data = await apiRequest<BackendCandidate>('/api/candidates/', 'POST', backendData);
    return mapToDBCandidate(data);
  },

  async updateStatus(id: string, status: CandidateStatus): Promise<DBCandidate & { name?: string; email?: string; phone?: string }> {
    return this.upsertCandidate({ id, status });
  }
};
