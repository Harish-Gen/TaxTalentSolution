import { apiRequest } from './apiService';

export interface BackendUserAssessment {
  id: string;
  userid: string;
  assessmentid: string;
  status?: string;
  startedon?: string;
  completedon?: string;
  score?: number;
  isactive?: boolean;
  createdon?: string;
  modifiedon?: string;
}

export const userAssessmentService = {
  async getByUserId(userId: string): Promise<BackendUserAssessment[]> {
    return apiRequest<BackendUserAssessment[]>(`/api/userassessments/user/${userId}`);
  },

  async upsert(record: Partial<BackendUserAssessment>): Promise<BackendUserAssessment> {
    return apiRequest<BackendUserAssessment>('/api/userassessments/', 'POST', record);
  },
};

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}
