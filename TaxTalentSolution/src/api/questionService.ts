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

export interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
}

export function mapFrontendQuestionsToExam(questions: FrontendQuestion[]): ExamQuestion[] {
  return questions
    .filter((q) => q.type === 'multiple-choice' && (q.options?.length ?? 0) >= 2)
    .map((q, index) => {
      const options = q.options!;
      let correctIndex = 0;
      if (q.correctAnswer) {
        const byText = options.findIndex((o) => o.trim() === q.correctAnswer!.trim());
        if (byText >= 0) {
          correctIndex = byText;
        } else {
          const numeric = parseInt(q.correctAnswer, 10);
          if (!Number.isNaN(numeric) && numeric >= 0 && numeric < options.length) {
            correctIndex = numeric;
          }
        }
      }
      return {
        id: index + 1,
        question: q.question,
        options,
        correctAnswer: correctIndex,
        explanation: '',
        difficulty: 'Easy',
        topic: q.type,
      };
    });
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
