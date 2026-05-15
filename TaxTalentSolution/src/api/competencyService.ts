import { apiRequest } from './apiService';

export interface CompetencyData {
  id?: string;
  userid: string;
  competenciesjson: any;
  isactive?: boolean;
}

export const competencyService = {
  async getCompetencies(userId: string): Promise<CompetencyData | null> {
    try {
      return await apiRequest<CompetencyData>(`/api/usercompetencies/user/${userId}`);
    } catch (error) {
      console.error('Failed to fetch competencies:', error);
      return null;
    }
  },

  async upsertCompetencies(data: CompetencyData): Promise<CompetencyData> {
    return await apiRequest<CompetencyData>('/api/usercompetencies/', 'POST', data);
  }
};
