import { apiRequest } from './apiService';
import type { JobApplication, ApplicationStatus } from '../database/types';

export interface BackendJobApplication {
  id: string;
  jobpostingid: string;
  candidateid: string;
  userid?: string;
  employerid: string;
  coverletter?: string;
  resumeurl?: string;
  currentcompensation?: number;
  expectedcompensation?: number;
  status?: string;
  stage?: number;
  progress?: number;
  appliedat?: string;
  modifiedon?: string;
  notes?: string;
}

function mapToFrontend(backend: BackendJobApplication): JobApplication {
  return {
    id: backend.id,
    job_id: backend.jobpostingid,
    candidate_id: backend.candidateid,
    employer_id: backend.employerid,
    cover_letter: backend.coverletter,
    resume_url: backend.resumeurl,
    current_compensation: backend.currentcompensation,
    expected_compensation: backend.expectedcompensation,
    status: (backend.status as ApplicationStatus) || 'submitted',
    stage: backend.stage ?? 1,
    progress: backend.progress ?? 20,
    applied_at: backend.appliedat || new Date().toISOString(),
    updated_at: backend.modifiedon || backend.appliedat || new Date().toISOString(),
    notes: backend.notes,
  };
}

export const jobApplicationService = {
  async getAll(): Promise<JobApplication[]> {
    const data = await apiRequest<BackendJobApplication[]>('/api/jobapplications/');
    return data.map(mapToFrontend);
  },

  async getByCandidateId(candidateId: string): Promise<JobApplication[]> {
    const data = await apiRequest<BackendJobApplication[]>(
      `/api/jobapplications/candidate/${candidateId}`
    );
    return data.map(mapToFrontend);
  },

  async getByUserId(userId: string): Promise<JobApplication[]> {
    const data = await apiRequest<BackendJobApplication[]>(
      `/api/jobapplications/user/${userId}`
    );
    return data.map(mapToFrontend);
  },

  async getByEmployerId(employerId: string): Promise<JobApplication[]> {
    const data = await apiRequest<BackendJobApplication[]>(
      `/api/jobapplications/employer/${employerId}`
    );
    return data.map(mapToFrontend);
  },

  async getByJobPostingId(jobPostingId: string): Promise<JobApplication[]> {
    const data = await apiRequest<BackendJobApplication[]>(
      `/api/jobapplications/job/${jobPostingId}`
    );
    return data.map(mapToFrontend);
  },

  async submit(application: {
    jobpostingid: string;
    candidateid: string;
    userid: string;
    employerid: string;
    coverletter?: string;
    resumeurl?: string;
    currentcompensation?: number;
    expectedcompensation?: number;
    notes?: string;
  }): Promise<JobApplication> {
    const data = await apiRequest<BackendJobApplication>('/api/jobapplications/', 'POST', {
      ...application,
      status: 'submitted',
      stage: 1,
      progress: 20,
    });
    return mapToFrontend(data);
  },

  async updateStatus(
    application: JobApplication,
    status: ApplicationStatus
  ): Promise<JobApplication> {
    const stageMap: Record<ApplicationStatus, number> = {
      submitted: 1,
      reviewed: 2,
      under_review: 2,
      shortlisted: 3,
      interview_scheduled: 4,
      offered: 5,
      hired: 6,
      rejected: 1,
      withdrawn: 1,
    };
    const progressMap: Record<ApplicationStatus, number> = {
      submitted: 20,
      reviewed: 30,
      under_review: 40,
      shortlisted: 60,
      interview_scheduled: 75,
      offered: 90,
      hired: 100,
      rejected: 0,
      withdrawn: 0,
    };
    const data = await apiRequest<BackendJobApplication>('/api/jobapplications/', 'POST', {
      id: application.id,
      jobpostingid: application.job_id,
      candidateid: application.candidate_id,
      employerid: application.employer_id,
      status,
      stage: stageMap[status] ?? application.stage,
      progress: progressMap[status] ?? application.progress,
    });
    return mapToFrontend(data);
  },
};
