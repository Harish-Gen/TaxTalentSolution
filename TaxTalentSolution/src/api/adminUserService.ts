import { apiRequest } from './apiService';
import type { AdminUser } from '../database/types';

interface BackendAdminUser {
  id: string;
  userid: string;
  role: string;
  permissions?: string;
  assignedemployers?: string;
  status: string;
  lastlogin?: string;
  isactive: boolean;
  createdon?: string;
}

function parseJsonArray(value?: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapToFrontend(row: BackendAdminUser): AdminUser {
  return {
    id: row.id,
    user_id: row.userid,
    role: row.role as AdminUser['role'],
    permissions: parseJsonArray(row.permissions),
    assigned_employers: parseJsonArray(row.assignedemployers),
    status: row.status as AdminUser['status'],
    last_login: row.lastlogin,
    created_at: row.createdon || new Date().toISOString(),
  };
}

export const adminUserService = {
  async getAll(): Promise<AdminUser[]> {
    const data = await apiRequest<BackendAdminUser[]>('/api/adminusers/');
    return data.map(mapToFrontend);
  },

  async getByUserId(userId: string): Promise<AdminUser | null> {
    try {
      const data = await apiRequest<BackendAdminUser>(`/api/adminusers/user/${userId}`);
      return mapToFrontend(data);
    } catch {
      return null;
    }
  },
};
