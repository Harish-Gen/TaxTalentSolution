import { apiRequest } from './apiService';
import type { Assessment as DBAssessment } from '../database/types';

export interface BackendAssessment {
  id: string;
  title?: string;
  category?: string;
  difficultylevel?: string;
  numberofquestions?: number;
  durationminutes?: number;
  passingscore?: number;
  pointsperquestion?: number;
  description?: string;
  status?: string;
  isactive?: boolean;
  createdon?: string;
  modifiedon?: string;
}

function mapToDBAssessment(backend: BackendAssessment): DBAssessment {
  return {
    id: backend.id,
    title: backend.title || '',
    description: backend.description || '',
    category: backend.category || '',
    difficulty: (backend.difficultylevel as any) || 'intermediate',
    duration_minutes: backend.durationminutes || 0,
    passing_score: backend.passingscore || 0,
    question_count: backend.numberofquestions || 0,
    status: (backend.status as any) || 'draft',
    is_active: backend.isactive ?? true,
    created_at: backend.createdon || new Date().toISOString(),
    updated_at: backend.modifiedon || new Date().toISOString(),
    price: 0,
    total_attempts: 0,
    avg_score: 0,
    rating: 0,
  };
}

function mapToBackend(frontend: Partial<DBAssessment>): Partial<BackendAssessment> {
  return {
    id: frontend.id,
    title: frontend.title,
    description: frontend.description,
    category: frontend.category,
    difficultylevel: frontend.difficulty,
    durationminutes: frontend.duration_minutes,
    passingscore: frontend.passing_score,
    numberofquestions: frontend.question_count,
    status: frontend.status,
    isactive: frontend.is_active,
  };
}

export const assessmentService = {
  async getAssessments(): Promise<DBAssessment[]> {
    const data = await apiRequest<BackendAssessment[]>('/api/assessments/');
    return data.map(mapToDBAssessment);
  },

  async getAssessmentById(id: string): Promise<DBAssessment> {
    const data = await apiRequest<BackendAssessment>(`/api/assessments/${id}`);
    return mapToDBAssessment(data);
  },

  async upsertAssessment(assessment: Partial<DBAssessment>): Promise<DBAssessment> {
    const backendData = mapToBackend(assessment);
    const data = await apiRequest<BackendAssessment>('/api/assessments/', 'POST', backendData);
    return mapToDBAssessment(data);
  },

  async deleteAssessment(id: string): Promise<void> {
    await apiRequest<BackendAssessment>('/api/assessments/', 'POST', { id, isactive: false });
  }
};
