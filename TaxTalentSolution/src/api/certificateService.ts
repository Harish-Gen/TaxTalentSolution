import { apiRequest } from './apiService';
import type { Certificate, CertificateLevel } from '../database/types';

export interface BackendCertificate {
  id: string;
  candidateid: string;
  userid?: string;
  assessmentid?: string;
  credentialid: string;
  title: string;
  score?: number;
  percentile?: number;
  level?: string;
  issuedate: string;
  expirydate?: string;
  skillsvalidated?: string[] | string;
  isvalid?: boolean;
  pdfurl?: string;
  createdon?: string;
}

function parseSkills(value?: string[] | string): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapToFrontend(backend: BackendCertificate): Certificate {
  const level = (backend.level || 'professional') as CertificateLevel;
  return {
    id: backend.id,
    candidate_id: backend.candidateid,
    assessment_id: backend.assessmentid,
    credential_id: backend.credentialid,
    title: backend.title,
    score: backend.score,
    percentile: backend.percentile,
    level,
    issue_date: backend.issuedate,
    expiry_date: backend.expirydate,
    skills_validated: parseSkills(backend.skillsvalidated),
    is_valid: backend.isvalid !== false,
    pdf_url: backend.pdfurl,
    created_at: backend.createdon || new Date().toISOString(),
  };
}

export const certificateService = {
  async getByCandidateId(candidateId: string): Promise<Certificate[]> {
    const data = await apiRequest<BackendCertificate[]>(
      `/api/certificates/candidate/${candidateId}`
    );
    return data.map(mapToFrontend);
  },

  async getByUserId(userId: string): Promise<Certificate[]> {
    const data = await apiRequest<BackendCertificate[]>(`/api/certificates/user/${userId}`);
    return data.map(mapToFrontend);
  },

  async create(certificate: {
    candidateid: string;
    userid?: string;
    assessmentid?: string;
    credentialid: string;
    title: string;
    score?: number;
    level?: string;
    issuedate: string;
    expirydate?: string;
    skillsvalidated?: string[];
  }): Promise<Certificate> {
    const data = await apiRequest<BackendCertificate>('/api/certificates/', 'POST', certificate);
    return mapToFrontend(data);
  },
};
