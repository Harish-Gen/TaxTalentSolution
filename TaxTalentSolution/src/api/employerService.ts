import { apiRequest } from './apiService';
import type { Employer as DBEmployer } from '../database/types';

export interface BackendEmployer {
  id: string;
  userid?: string;
  user?: { id?: string; name?: string; email?: string; phone?: string };
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

function mapToDBEmployer(backend: BackendEmployer): DBEmployer & {
  isactive?: boolean;
  contact_person?: string;
  email?: string;
  phone?: string;
  user_id?: string;
} {
  const backendLoc = backend as BackendEmployer & {
    headquarterscity?: string;
    headquartersstate?: string;
    headquarterscountry?: string;
  };
  const locationParts = backend.location ? backend.location.split(/,\s*/) : [];
  const city = backendLoc.headquarterscity || locationParts[0] || '';
  const state = backendLoc.headquartersstate || locationParts[1] || '';
  const country = backendLoc.headquarterscountry || 'IN';
  const ownerUser = backend.user;

  return {
    id: backend.id,
    user_id: backend.userid || ownerUser?.id,
    company_name: backend.companyname || ownerUser?.name || '',
    contact_person: backend.contactperson || '',
    email: backend.email || ownerUser?.email || '',
    phone: backend.phone || ownerUser?.phone || '',
    logo_url: backend.logourl,
    website: backend.website,
    industry: backend.industry,
    company_size: backend.companysize,
    headquarters_city: city,
    headquarters_state: state,
    headquarters_country: country || 'IN',
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
  const city = frontend.headquarters_city?.trim() || '';
  const state = frontend.headquarters_state?.trim() || '';
  const location =
    city && state ? `${city}, ${state}` : city || state || undefined;

  const payload: Partial<BackendEmployer> = {
    id: frontend.id,
    userid: frontend.user_id,
    companyname: frontend.company_name,
    contactperson: frontend.contact_person,
    email: frontend.email,
    phone: frontend.phone,
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

  if (location) payload.location = location;
  if (city) payload.headquarterscity = city;
  if (state) payload.headquartersstate = state;
  if (frontend.headquarters_country) {
    payload.headquarterscountry = frontend.headquarters_country;
  }

  return payload;
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
