import { apiRequest } from './apiService';

export const profileViewService = {
  async record(params: {
    candidateid: string;
    employerid?: string;
    vieweruserid?: string;
    viewtype?: string;
    source?: string;
  }): Promise<void> {
    await apiRequest('/api/profileviews/', 'POST', params);
  },

  async getCounts(candidateIds: string[]): Promise<Record<string, number>> {
    if (candidateIds.length === 0) return {};
    const qs = encodeURIComponent(candidateIds.join(','));
    return apiRequest<Record<string, number>>(`/api/profileviews/counts?candidateIds=${qs}`);
  },

  async getByEmployerId(employerId: string): Promise<Array<{ candidateid: string; viewedat?: string }>> {
    const data = await apiRequest<Array<{ candidateid: string; viewedat?: string }>>(
      `/api/profileviews/employer/${employerId}`
    );
    return data;
  },
};
