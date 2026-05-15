import { apiRequest } from './apiService';

export interface QuestionQAJson {
  question: string;
  type: 'multiple-choice' | 'true-false' | 'scenario' | 'short-answer';
  difficulty: string;
  points: number;
  options?: string[];
  correctAnswer?: string;
}

export interface BackendQuestion {
  id?: string;
  qajson: QuestionQAJson | Record<string, any>;
  isactive: boolean;
  assessment_ids: string[];
}

export interface FrontendQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'scenario' | 'short-answer';
  difficulty: string;
  points: number;
  options?: string[];
  correctAnswer?: string;
  assessmentIds: string[];
}

function mapToFrontend(backend: BackendQuestion): FrontendQuestion {
  const qa = backend.qajson as QuestionQAJson;
  return {
    id: backend.id || '',
    question: qa.question || '',
    type: qa.type || 'multiple-choice',
    difficulty: qa.difficulty || 'Beginner',
    points: qa.points || 0,
    options: qa.options,
    correctAnswer: qa.correctAnswer,
    assessmentIds: backend.assessment_ids || [],
  };
}

export const questionService = {
  async getQuestionsByAssessment(assessmentId: string): Promise<FrontendQuestion[]> {
    const data = await apiRequest<BackendQuestion[]>(`/api/questions/assessment/${assessmentId}`);
    return data.map(mapToFrontend);
  },

  async createQuestion(payload: {
    qajson: QuestionQAJson;
    assessment_ids: string[];
  }): Promise<FrontendQuestion> {
    const body: BackendQuestion = {
      qajson: payload.qajson,
      isactive: true,
      assessment_ids: payload.assessment_ids,
    };
    const data = await apiRequest<BackendQuestion>('/api/questions/', 'POST', body);
    return mapToFrontend(data);
  },

  async deleteQuestion(id: string): Promise<void> {
    await apiRequest('/api/questions/', 'POST', { id, isactive: false });
  },
};
