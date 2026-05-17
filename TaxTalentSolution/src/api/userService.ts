import { apiRequest } from './apiService';
import type { User as DBUser } from '../database/types';

export interface BackendUser {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  roleid?: string;
  isactive?: boolean;
  employer_ids?: string[];
  employers?: Array<{ id?: string; name?: string; contactperson?: string; companyname?: string }>;
  role?: {
    id: string;
    name: string;
    description: string;
    isactive: boolean;
  };
  candidate?: {
    id: string;
    currenttitle?: string;
    location?: {
      city: string;
      state: string;
    };
  };
}

export interface LoginResponse {
  message: string;
  user: BackendUser;
}

// Temporary mapping for roles since backend uses roleid UUIDs
// In a real scenario, these would come from a /api/roles endpoint
const ROLE_MAP: Record<string, string> = {
  'admin': '11111111-1111-1111-1111-111111111111',
  'manager': '22222222-2222-2222-2222-222222222222',
  'viewer': '33333333-3333-3333-3333-333333333333',
};

const REVERSE_ROLE_MAP: Record<string, 'admin' | 'manager' | 'viewer'> = {
  '11111111-1111-1111-1111-111111111111': 'admin',
  '22222222-2222-2222-2222-222222222222': 'manager',
  '33333333-3333-3333-3333-333333333333': 'viewer',
};

function mapToFrontendUser(backend: BackendUser): any {
  const employerIdsFromRows = (backend.employers || [])
    .map((e) => e.id)
    .filter(Boolean) as string[];
  const assignedEmployers =
    backend.employer_ids?.length
      ? backend.employer_ids
      : employerIdsFromRows;

  return {
    id: backend.id,
    name: backend.name || '',
    email: backend.email || '',
    phone: backend.phone || '',
    role: backend.role?.name || (backend.roleid ? (REVERSE_ROLE_MAP[backend.roleid] || 'viewer') : 'viewer'),
    status: backend.isactive ? 'active' : 'inactive',
    assignedEmployers,
    employers: backend.employers || [],
    companyName: backend.employers?.[0]?.name || '',
    permissions: [],
    joinedDate: new Date().toISOString().split('T')[0],
    lastLogin: undefined as string | undefined,
  };
}

function mapToBackend(frontend: any): Partial<BackendUser> {
  return {
    id: frontend.id,
    name: frontend.name,
    email: frontend.email,
    phone: frontend.phone,
    roleid: ROLE_MAP[frontend.role] || ROLE_MAP['viewer'],
    isactive: frontend.status === 'active',
    employer_ids: frontend.assignedEmployers || []
  };
}

export const userService = {
  async login(email: string): Promise<LoginResponse> {
    return await apiRequest<LoginResponse>('/api/users/login', 'POST', { email });
  },

  async getUsers(): Promise<any[]> {
    const data = await apiRequest<BackendUser[]>('/api/users/');
    return data.map(mapToFrontendUser);
  },

  async getUserById(id: string): Promise<any> {
    const data = await apiRequest<BackendUser>(`/api/users/${id}`);
    return mapToFrontendUser(data);
  },

  async upsertUser(user: any): Promise<any> {
    const backendData = mapToBackend(user);
    const data = await apiRequest<BackendUser>('/api/users/', 'POST', backendData);
    return mapToFrontendUser(data);
  },

  async deleteUser(id: string): Promise<void> {
    await apiRequest('/api/users/', 'POST', { id, isactive: false });
  }
};
