import { apiRequest } from './apiService';
import type { Job as DBJob } from '../database/types';

export interface BackendJob {
  id: string;
  jobtitle?: string;
  employerid?: string;
  location?: string;
  jobtype?: string;
  experiencelevel?: string;
  category?: string;
  minsalary?: number;
  maxsalary?: number;
  closingdate?: string;
  jobdescription?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  isactive?: boolean;
  createdon?: string;
  modifiedon?: string;
}

function mapToDBJob(backend: BackendJob): DBJob {
  const locationParts = backend.location ? backend.location.split(/,\s*/) : [];
  const city = locationParts[0] || '';
  const state = locationParts[1] || '';

  return {
    id: backend.id,
    employer_id: backend.employerid || '',
    title: backend.jobtitle || '',
    description: backend.jobdescription || '',
    location_city: city,
    location_state: state,
    location_country: 'India',
    is_remote: (backend.location?.toLowerCase().includes('remote') || false),
    job_type: (backend.jobtype as any) || 'full-time',
    experience_level: (backend.experiencelevel as any) || 'mid',
    salary_min: backend.minsalary || 0,
    salary_max: backend.maxsalary || 0,
    salary_currency: 'INR',
    category: backend.category || '',
    requirements: backend.requirements || [],
    responsibilities: backend.responsibilities || [],
    benefits: backend.benefits || [],
    status: (backend.isactive === false) ? 'closed' : 'active',
    is_urgent: false,
    is_featured: false,
    applicant_count: 0,
    view_count: 0,
    posted_date: backend.createdon || new Date().toISOString(),
    closing_date: backend.closingdate,
    created_at: backend.createdon || new Date().toISOString(),
    updated_at: backend.modifiedon || new Date().toISOString(),
  };
}

function mapToBackend(frontend: any): Partial<BackendJob> {
  const location = frontend.location_city && frontend.location_state 
    ? `${frontend.location_city}, ${frontend.location_state}`
    : (frontend.location_city || frontend.location_state || frontend.location || '');

  return {
    id: frontend.id,
    jobtitle: frontend.title,
    employerid: frontend.employer_id,
    location: location,
    jobtype: frontend.job_type || frontend.jobType,
    experiencelevel: frontend.experience_level || frontend.experienceLevel,
    category: frontend.category,
    minsalary: frontend.salary_min || frontend.salaryMin,
    maxsalary: frontend.salary_max || frontend.salaryMax,
    closingdate: frontend.closing_date || frontend.closingDate,
    jobdescription: frontend.description,
    requirements: frontend.requirements,
    responsibilities: frontend.responsibilities,
    benefits: frontend.benefits,
    isactive: frontend.status !== 'closed' && frontend.status !== 'inactive'
  };
}

export const jobService = {
  async getJobs(): Promise<DBJob[]> {
    const data = await apiRequest<BackendJob[]>('/api/jobpostings/');
    return data.map(mapToDBJob);
  },

  async getJobById(id: string): Promise<DBJob> {
    const data = await apiRequest<BackendJob>(`/api/jobpostings/${id}`);
    return mapToDBJob(data);
  },

  async upsertJob(job: Partial<DBJob>): Promise<DBJob> {
    const backendData = mapToBackend(job);
    const data = await apiRequest<BackendJob>('/api/jobpostings/', 'POST', backendData);
    return mapToDBJob(data);
  },

  async deleteJob(id: string): Promise<void> {
    await apiRequest('/api/jobpostings/', 'POST', { id, isactive: false });
  }
};
