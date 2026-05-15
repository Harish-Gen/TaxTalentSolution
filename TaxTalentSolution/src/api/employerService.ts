import { apiRequest } from './apiService';
import type { Employer as DBEmployer } from '../database/types';

export interface BackendEmployer {
  id: string;
  companyname?: string;
  contactperson?: string;
  email?: string;
  phone?: string;
  location?: string;
  logourl?: string;
  website?: string;
  industry?: string;
  companysize?: string;
  description?: string;
  status?: string;
  subscriptionplan?: string;
  subscriptionexpiry?: string;
  monthlybudget?: number;
  totalhires?: number;
  isactive?: boolean;
  createdon?: string;
  modifiedon?: string;
  lastactive?: string;
}

function mapToDBEmployer(backend: BackendEmployer): DBEmployer & { isactive?: boolean; contact_person?: string; email?: string; phone?: string } {
  const locationParts = backend.location ? backend.location.split(/,\s*/) : [];
  const city = locationParts[0] || '';
  const state = locationParts[1] || '';

  return {
    id: backend.id,
    company_name: backend.companyname || '',
    contact_person: backend.contactperson || '',
    email: backend.email || '',
    phone: backend.phone || '',
    logo_url: backend.logourl,
    website: backend.website,
    industry: backend.industry,
    company_size: backend.companysize,
    headquarters_city: city,
    headquarters_state: state,
    headquarters_country: 'India',
    description: backend.description,
    status: (backend.status as any) || 'pending',
    subscription_plan: (backend.subscriptionplan as any) || 'basic',
    subscription_expiry: backend.subscriptionexpiry,
    monthly_budget: backend.monthlybudget || 0,
    total_hires: backend.totalhires || 0,
    isactive: backend.isactive ?? true,
    created_at: backend.createdon || new Date().toISOString(),
    updated_at: backend.modifiedon || new Date().toISOString(),
    last_active: backend.lastactive || new Date().toISOString(),
  };
}

function mapToBackend(frontend: any): Partial<BackendEmployer> {
  const location = frontend.headquarters_city && frontend.headquarters_state 
    ? `${frontend.headquarters_city}, ${frontend.headquarters_state}`
    : (frontend.headquarters_city || frontend.headquarters_state || '');

  return {
    id: frontend.id,
    companyname: frontend.company_name,
    contactperson: frontend.contact_person,
    email: frontend.email,
    phone: frontend.phone,
    location: location,
    logourl: frontend.logo_url,
    website: frontend.website,
    industry: frontend.industry,
    companysize: frontend.company_size,
    description: frontend.description,
    status: frontend.status,
    subscriptionplan: frontend.subscription_plan,
    monthlybudget: frontend.monthly_budget,
    isactive: frontend.isactive ?? true,
  };
}

export const employerService = {
  async getEmployers(): Promise<(DBEmployer & { isactive?: boolean; contact_person?: string; email?: string; phone?: string })[]> {
    const data = await apiRequest<BackendEmployer[]>('/api/employers/');
    return data.map(mapToDBEmployer);
  },

  async getEmployerById(id: string): Promise<DBEmployer & { isactive?: boolean; contact_person?: string; email?: string; phone?: string }> {
    const data = await apiRequest<BackendEmployer>(`/api/employers/${id}`);
    return mapToDBEmployer(data);
  },

  async upsertEmployer(employer: Partial<DBEmployer & { isactive?: boolean; contact_person?: string; email?: string; phone?: string }>): Promise<DBEmployer & { isactive?: boolean; contact_person?: string; email?: string; phone?: string }> {
    const backendData = mapToBackend(employer);
    const data = await apiRequest<BackendEmployer>('/api/employers/', 'POST', backendData);
    return mapToDBEmployer(data);
  },

  async deleteEmployer(id: string): Promise<void> {
    await apiRequest('/api/employers/', 'POST', { id, isactive: false });
  }
};
