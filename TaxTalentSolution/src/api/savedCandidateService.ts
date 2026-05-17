import { apiRequest } from './apiService';

export interface SavedCandidate {
  id: string;
  employer_id: string;
  candidate_id: string;
  saved_by?: string;
  folder?: string;
  notes?: string;
  saved_at?: string;
  is_active?: boolean;
}

interface BackendSavedCandidate {
  id: string;
  employerid: string;
  candidateid: string;
  savedby?: string;
  folder?: string;
  notes?: string;
  savedat?: string;
  isactive?: boolean;
}

function mapToFrontend(row: BackendSavedCandidate): SavedCandidate {
  return {
    id: row.id,
    employer_id: row.employerid,
    candidate_id: row.candidateid,
    saved_by: row.savedby,
    folder: row.folder,
    notes: row.notes,
    saved_at: row.savedat,
    is_active: row.isactive !== false,
  };
}

export const savedCandidateService = {
  async getByEmployerId(employerId: string): Promise<SavedCandidate[]> {
    const data = await apiRequest<BackendSavedCandidate[]>(
      `/api/savedcandidates/employer/${employerId}`
    );
    return data.map(mapToFrontend);
  },

  async save(params: {
    employerid: string;
    candidateid: string;
    savedby?: string;
    folder?: string;
    notes?: string;
  }): Promise<SavedCandidate> {
    const data = await apiRequest<BackendSavedCandidate>('/api/savedcandidates/', 'POST', {
      ...params,
      isactive: true,
    });
    return mapToFrontend(data);
  },

  async unsave(employerId: string, candidateId: string, existingId?: string): Promise<SavedCandidate> {
    const data = await apiRequest<BackendSavedCandidate>('/api/savedcandidates/', 'POST', {
      id: existingId,
      employerid: employerId,
      candidateid: candidateId,
      isactive: false,
    });
    return mapToFrontend(data);
  },
};
