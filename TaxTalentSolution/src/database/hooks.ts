// =====================================================
// Tax Talent Solution Database Hooks
// React hooks for accessing local database
// =====================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { candidateSkills } from './localDb';
import { candidateService } from '../api/candidateService';
import {
  assessmentService,
  isCandidateVisibleAssessment,
} from '../api/assessmentService';
import {
  userAssessmentService,
  isUuid,
  type BackendUserAssessment,
} from '../api/userAssessmentService';
import { loadUserAssessments, type StoredUserAssessment } from './assessmentUserStore';
import { employerService } from '../api/employerService';
import { jobService } from '../api/jobService';
import { userService } from '../api/userService';
import { jobApplicationService } from '../api/jobApplicationService';
import { certificateService } from '../api/certificateService';
import { notificationService } from '../api/notificationService';
import { adminUserService } from '../api/adminUserService';
import { savedCandidateService } from '../api/savedCandidateService';
import { profileViewService } from '../api/profileViewService';
import type {
  User,
  Candidate,
  Employer,
  EmployerUser,
  Job,
  JobApplication,
  Assessment,
  Certificate,
  Notification,
  AdminUser,
  CandidateSkill,
  SkillMaster,
  CandidateProfile,
  JobWithEmployer,
} from './types';

// =====================================================
// USERS HOOKS
// =====================================================

export function useUsers() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await userService.getUsers();
      setData(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users: data, loading, refresh: fetchUsers };
}

export function useUser(id: string | undefined) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setUser(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await userService.getUserById(id);
        setUser(data);
      } catch (error) {
        console.error(`Failed to fetch user ${id}:`, error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return { user, loading };
}

export function useCurrentUser(email: string | undefined) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const all = await userService.getUsers();
        setUser(all.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [email]);

  return { user, loading };
}

// =====================================================
// CANDIDATES HOOKS
// =====================================================

export function useCandidates() {
  const [data, setData] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const result = await candidateService.getCandidates();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCandidates();
  }, []);

  return { candidates: data, loading, refresh: fetchCandidates };
}

export function useCandidate(id: string | undefined) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await candidateService.getCandidateById(id);
        setCandidate(result);
      } catch (error) {
        console.error(`Failed to fetch candidate ${id}:`, error);
        setCandidate(null); // No fallback to mock data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const refresh = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await candidateService.getCandidateById(id);
      setCandidate(result);
    } catch (error) {
      console.error(`Failed to fetch candidate ${id}:`, error);
      setCandidate(null);
    } finally {
      setLoading(false);
    }
  };

  return { candidate, loading, refresh };
}

export function useCandidateProfile(candidateId: string | undefined) {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setProfile(null);
      setLoading(false);
    };
    fetchData();
  }, [candidateId]);

  return { profile, loading };
}

export function useCandidateByUserId(userId: string | undefined) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setCandidate(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (isUuid(userId)) {
          const result = await candidateService.getCandidateByUserId(userId, {
            ensure: true,
          });
          setCandidate(result);
        } else {
          setCandidate(null);
        }
      } catch (error) {
        console.error('Failed to fetch candidate by user:', error);
        setCandidate(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  return { candidate, loading };
}

export function useCandidateSkills(candidateId: string | undefined) {
  const skills = useMemo(() => {
    if (!candidateId) return [];
    return candidateSkills.filter(s => s.candidate_id === candidateId);
  }, [candidateId]);

  return { skills };
}

// =====================================================
// EMPLOYERS HOOKS
// =====================================================

export function useEmployers() {
  const [data, setData] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const result = await employerService.getEmployers();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch employers:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  return { employers: data, loading, refresh: fetchEmployers };
}

export function useEmployer(id: string | undefined) {
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await employerService.getEmployerById(id);
        setEmployer(result);
      } catch (error) {
        console.error(`Failed to fetch employer ${id}:`, error);
        setEmployer(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const refresh = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await employerService.getEmployerById(id);
      setEmployer(result);
    } catch (error) {
      console.error(`Failed to fetch employer ${id}:`, error);
      setEmployer(null);
    } finally {
      setLoading(false);
    }
  };

  return { employer, loading, refresh };
}

export function useEmployerUsers(employerId: string | undefined) {
  const [data, setData] = useState<EmployerUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employerId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setData([]);
      setLoading(false);
    };
    fetchData();
  }, [employerId]);

  return { employerUsers: data, loading };
}

// =====================================================
// JOBS HOOKS
// =====================================================

export function useJobs(filters?: {
  status?: string;
  category?: string;
  location?: string;
  isRemote?: boolean;
}) {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const result = await jobService.getJobs();
      let filtered = result;
      
      if (filters) {
        if (filters.status) {
          filtered = filtered.filter(j => j.status === filters.status);
        }
        if (filters.category) {
          filtered = filtered.filter(j => j.category === filters.category);
        }
        if (filters.location) {
          filtered = filtered.filter(j => 
            (j.location_city?.toLowerCase().includes(filters.location!.toLowerCase()) ?? false) ||
            (j.location_state?.toLowerCase().includes(filters.location!.toLowerCase()) ?? false)
          );
        }
        if (filters.isRemote !== undefined) {
          filtered = filtered.filter(j => j.is_remote === filters.isRemote);
        }
      }
      
      setData(filtered);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters?.status, filters?.category, filters?.location, filters?.isRemote]);

  return { jobs: data, loading, refresh: fetchJobs };
}

export function useJob(id: string | undefined) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await jobService.getJobById(id);
        setJob(result);
      } catch (error) {
        console.error(`Failed to fetch job ${id}:`, error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return { job, loading };
}

export function useJobWithEmployer(jobId: string | undefined) {
  const [job, setJob] = useState<JobWithEmployer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const j = await jobService.getJobById(jobId);
        if (!j) {
          setJob(null);
          return;
        }
        const employer = j.employer_id
          ? await employerService.getEmployerById(j.employer_id)
          : null;
        if (!employer) {
          setJob(null);
          return;
        }
        setJob({ ...j, employer });
      } catch {
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  return { job, loading };
}

export function useEmployerJobs(employerId: string | undefined) {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employerId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const all = await jobService.getJobs();
        setData(all.filter((j) => j.employer_id === employerId));
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employerId]);

  return { jobs: data, loading };
}

// =====================================================
// APPLICATIONS HOOKS
// =====================================================

export function useApplications() {
  const [data, setData] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setData(await jobApplicationService.getAll());
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { applications: data, loading };
}

export function useCandidateApplications(candidateId: string | undefined) {
  const [data, setData] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) {
      setLoading(false);
      setData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (isUuid(candidateId)) {
          setData(await jobApplicationService.getByCandidateId(candidateId));
        } else {
          setData([]);
        }
      } catch (error) {
        console.error('Failed to fetch candidate applications:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [candidateId]);

  return { applications: data, loading };
}

export function useUserApplications(userId: string | undefined) {
  const [data, setData] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (isUuid(userId)) {
          setData(await jobApplicationService.getByUserId(userId));
        } else {
          setData([]);
        }
      } catch (error) {
        console.error('Failed to fetch user applications:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  return { applications: data, loading };
}

export function useJobApplications(jobId: string | undefined) {
  const [data, setData] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const all = await jobApplicationService.getAll();
        setData(all.filter((a) => a.job_id === jobId));
      } catch (error) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  return { applications: data, loading };
}

export function useEmployerApplications(employerId: string | undefined) {
  const [data, setData] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!employerId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (isUuid(employerId)) {
        setData(await jobApplicationService.getByEmployerId(employerId));
      } else {
        setData([]);
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [employerId]);

  return { applications: data, loading, refresh: fetchData };
}

// =====================================================
// ASSESSMENTS & CERTIFICATES HOOKS
// =====================================================

export function useAssessments(options?: { candidateVisibleOnly?: boolean }) {
  const candidateVisibleOnly = options?.candidateVisibleOnly !== false;
  const [data, setData] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await assessmentService.getAssessments();
      setData(
        candidateVisibleOnly
          ? result.filter(isCandidateVisibleAssessment)
          : result
      );
    } catch (err) {
      console.error('Failed to fetch assessments:', err);
      setData([]);
      setError(err instanceof Error ? err.message : 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  }, [candidateVisibleOnly]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { assessments: data, loading, error, refresh: fetchData };
}

export function useAssessment(id: string | undefined) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await assessmentService.getAssessmentById(id);
        setAssessment(result);
      } catch (error) {
        console.error(`Failed to fetch assessment ${id}:`, error);
        setAssessment(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return { assessment, loading };
}

export function useCertificates(userId: string | undefined) {
  const [data, setData] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!userId) {
        setData([]);
        setLoading(false);
        return;
      }
      try {
        if (isUuid(userId)) {
          const byUser = await certificateService.getByUserId(userId);
          if (byUser.length > 0) {
            setData(byUser);
            return;
          }
          const candidate = await candidateService.getCandidateByUserId(userId, {
            ensure: true,
          });
          if (candidate?.id && isUuid(candidate.id)) {
            setData(await certificateService.getByCandidateId(candidate.id));
            return;
          }
        }
        setData([]);
      } catch (error) {
        console.error('Failed to fetch certificates:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  return { certificates: data, loading };
}

export interface UserAssessmentActivity {
  apiRecords: BackendUserAssessment[];
  localRecords: StoredUserAssessment[];
  loading: boolean;
}

export function useUserAssessmentActivity(
  userId: string | undefined,
  refreshKey = 0
) {
  const [apiRecords, setApiRecords] = useState<BackendUserAssessment[]>([]);
  const [localRecords, setLocalRecords] = useState<StoredUserAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const local = userId ? loadUserAssessments(userId) : [];
      setLocalRecords(local);

      const backendId = userId && isUuid(userId) ? userId : null;
      if (backendId) {
        try {
          const rows = await userAssessmentService.getByUserId(backendId);
          setApiRecords(rows.filter((r) => r.isactive !== false));
        } catch (error) {
          console.error('Failed to fetch user assessments:', error);
          setApiRecords([]);
        }
      } else {
        setApiRecords([]);
      }
      setLoading(false);
    };
    void load();
  }, [userId, refreshKey]);

  return { apiRecords, localRecords, loading };
}

export function useCandidateCertificates(candidateId: string | undefined) {
  const [data, setData] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (isUuid(candidateId)) {
          setData(await certificateService.getByCandidateId(candidateId));
        } else {
          setData([]);
        }
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [candidateId]);

  return { certificates: data, loading };
}

// =====================================================
// NOTIFICATIONS HOOKS
// =====================================================

export function useNotifications(userId: string | undefined) {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setData([]);
      setUnreadCount(0);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (isUuid(userId)) {
          const all = await notificationService.getByUserId(userId);
          setData(all);
          setUnreadCount(all.filter((n) => !n.is_read).length);
        } else {
          setData([]);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setData([]);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  return { notifications: data, unreadCount, loading };
}

// =====================================================
// ADMIN HOOKS
// =====================================================

export function useAdminUsers() {
  const [data, setData] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rows = await adminUserService.getAll();
        setData(rows);
      } catch (error) {
        console.error('Failed to fetch admin users:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { adminUsers: data, loading };
}

export function useSavedCandidates(employerId: string | undefined) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!employerId) {
      setSavedIds(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const rows = await savedCandidateService.getByEmployerId(employerId);
      setSavedIds(new Set(rows.filter((r) => r.is_active !== false).map((r) => r.candidate_id)));
    } catch {
      setSavedIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [employerId]);

  const toggleSave = async (candidateId: string, userId?: string) => {
    if (!employerId) return;
    const isSaved = savedIds.has(candidateId);
    if (isSaved) {
      await savedCandidateService.unsave(employerId, candidateId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(candidateId);
        return next;
      });
    } else {
      await savedCandidateService.save({
        employerid: employerId,
        candidateid: candidateId,
        savedby: userId,
        folder: 'Shortlist',
      });
      setSavedIds((prev) => new Set(prev).add(candidateId));
    }
  };

  return { savedIds, loading, toggleSave, refresh };
}

// =====================================================
// SKILLS HOOKS
// =====================================================

export function useSkillsMaster() {
  const [data, setData] = useState<SkillMaster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      setData([]);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { skills: data, loading };
}

// =====================================================
// DASHBOARD STATS HOOK
// =====================================================

export type DashboardStats = {
  totalCandidates: number;
  approvedCandidates: number;
  pendingCandidates: number;
  totalEmployers: number;
  activeEmployers: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalAssessments: number;
  totalCertificates: number;
  totalAdmins: number;
  avgCertificateScore?: number;
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [candidateList, employerList, jobList, assessmentList, applications] =
          await Promise.all([
            candidateService.getCandidates(),
            employerService.getEmployers(),
            jobService.getJobs(),
            assessmentService.getAssessments(),
            jobApplicationService.getAll().catch(() => []),
          ]);

        let totalCertificates = 0;
        let scoreSum = 0;
        let scoreCount = 0;
        await Promise.all(
          candidateList.slice(0, 50).map(async (c) => {
            try {
              const certs = await certificateService.getByCandidateId(c.id);
              totalCertificates += certs.length;
              for (const cert of certs) {
                if (cert.score != null) {
                  scoreSum += cert.score;
                  scoreCount += 1;
                }
              }
            } catch {
              /* skip */
            }
          })
        );

        let totalAdmins = 0;
        try {
          const admins = await adminUserService.getAll();
          totalAdmins = admins.length;
        } catch {
          totalAdmins = 0;
        }

        setStats({
          totalCandidates: candidateList.length,
          approvedCandidates: candidateList.filter((c) => c.status === 'approved').length,
          pendingCandidates: candidateList.filter((c) => c.status === 'pending').length,
          totalEmployers: employerList.length,
          activeEmployers: employerList.filter((e) => e.status === 'active').length,
          totalJobs: jobList.length,
          activeJobs: jobList.filter((j) => j.status === 'active').length,
          totalApplications: applications.length,
          totalAssessments: assessmentList.length,
          totalCertificates,
          totalAdmins,
          avgCertificateScore: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : undefined,
        });
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        setStats({
          totalCandidates: 0,
          approvedCandidates: 0,
          pendingCandidates: 0,
          totalEmployers: 0,
          activeEmployers: 0,
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          totalAssessments: 0,
          totalCertificates: 0,
          totalAdmins: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { stats, loading };
}

// =====================================================
// SEARCH HOOKS
// =====================================================

export function useCandidateSearch(searchParams: {
  query?: string;
  location?: string;
  skills?: string[];
  minExperience?: number;
  maxExperience?: number;
  availability?: string;
  workMode?: string;
}) {
  const [results, setResults] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = async () => {
      setLoading(true);
      let filtered: Candidate[] = [];
      try {
        filtered = await candidateService.getCandidates();
      } catch {
        setResults([]);
        setLoading(false);
        return;
      }

      if (searchParams.query) {
        const q = searchParams.query.toLowerCase();
        filtered = filtered.filter(c =>
          (c.headline?.toLowerCase().includes(q) ?? false) ||
          (c.summary?.toLowerCase().includes(q) ?? false)
        );
      }

      if (searchParams.location) {
        const loc = searchParams.location.toLowerCase();
        filtered = filtered.filter(c =>
          (c.location_city?.toLowerCase().includes(loc) ?? false) ||
          (c.location_state?.toLowerCase().includes(loc) ?? false)
        );
      }

      if (searchParams.skills && searchParams.skills.length > 0) {
        filtered = filtered.filter(c => {
          const cSkills = candidateSkills
            .filter(s => s.candidate_id === c.id)
            .map(s => s.skill_name.toLowerCase());
          return searchParams.skills!.some(skill =>
            cSkills.some(cs => cs.includes(skill.toLowerCase()))
          );
        });
      }

      if (searchParams.minExperience !== undefined) {
        filtered = filtered.filter(c => c.experience_years >= searchParams.minExperience!);
      }

      if (searchParams.maxExperience !== undefined) {
        filtered = filtered.filter(c => c.experience_years <= searchParams.maxExperience!);
      }

      if (searchParams.availability) {
        filtered = filtered.filter(c => c.availability === searchParams.availability);
      }

      if (searchParams.workMode) {
        filtered = filtered.filter(c => c.work_mode === searchParams.workMode);
      }

      setResults(filtered);
      setLoading(false);
    };

    search();
  }, [
    searchParams.query,
    searchParams.location,
    searchParams.skills?.join(','),
    searchParams.minExperience,
    searchParams.maxExperience,
    searchParams.availability,
    searchParams.workMode,
  ]);

  return { results, loading };
}

export function useJobSearch(searchParams: {
  query?: string;
  location?: string;
  category?: string;
  jobType?: string;
  isRemote?: boolean;
  minSalary?: number;
  maxSalary?: number;
}) {
  const [results, setResults] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = async () => {
      setLoading(true);
      let filtered: Job[] = [];
      try {
        filtered = (await jobService.getJobs()).filter(j => j.status === 'active');
      } catch {
        setResults([]);
        setLoading(false);
        return;
      }

      if (searchParams.query) {
        const q = searchParams.query.toLowerCase();
        filtered = filtered.filter(j =>
          j.title.toLowerCase().includes(q) ||
          (j.description?.toLowerCase().includes(q) ?? false)
        );
      }

      if (searchParams.location) {
        const loc = searchParams.location.toLowerCase();
        filtered = filtered.filter(j =>
          (j.location_city?.toLowerCase().includes(loc) ?? false) ||
          (j.location_state?.toLowerCase().includes(loc) ?? false)
        );
      }

      if (searchParams.category) {
        filtered = filtered.filter(j => j.category === searchParams.category);
      }

      if (searchParams.jobType) {
        filtered = filtered.filter(j => j.job_type === searchParams.jobType);
      }

      if (searchParams.isRemote !== undefined) {
        filtered = filtered.filter(j => j.is_remote === searchParams.isRemote);
      }

      if (searchParams.minSalary !== undefined) {
        filtered = filtered.filter(j => (j.salary_max ?? 0) >= searchParams.minSalary!);
      }

      if (searchParams.maxSalary !== undefined) {
        filtered = filtered.filter(j => (j.salary_min ?? 0) <= searchParams.maxSalary!);
      }

      setResults(filtered);
      setLoading(false);
    };

    search();
  }, [
    searchParams.query,
    searchParams.location,
    searchParams.category,
    searchParams.jobType,
    searchParams.isRemote,
    searchParams.minSalary,
    searchParams.maxSalary,
  ]);

  return { results, loading };
}

export function useInterviews() {
  const interviews: Array<{
    id: number;
    applicationId: number;
    scheduledAt: string;
    interviewType: string;
  }> = [];

  return { interviews };
}

export function useCertificate(id: string | undefined) {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setCertificate(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (id.startsWith('local-')) {
          const parts = id.split('-');
          let assessmentId = '';
          let targetUserId = '';

          if (parts.length === 2) {
            assessmentId = parts[1];
          } else if (parts.length >= 3) {
            targetUserId = parts[1];
            assessmentId = parts.slice(2).join('-');
          }

          let match: StoredUserAssessment | null = null;
          let foundUserId = '';

          if (targetUserId) {
            const list = loadUserAssessments(targetUserId);
            const found = list.find(r => r.assessmentId === assessmentId && r.status === 'completed');
            if (found) {
              match = found;
              foundUserId = targetUserId;
            }
          }

          if (!match) {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('tts_user_assessment_')) {
                const userIdFromKey = key.replace('tts_user_assessment_', '');
                try {
                  const list = JSON.parse(localStorage.getItem(key) || '[]') as StoredUserAssessment[];
                  const found = list.find(r =>
                    (r.assessmentId === assessmentId || key.includes(id.replace('local-', ''))) &&
                    r.status === 'completed'
                  );
                  if (found) {
                    match = found;
                    foundUserId = userIdFromKey;
                    break;
                  }
                } catch {
                  // ignore
                }
              }
            }
          }

          if (match) {
            const expiry = new Date(match.completedAt || new Date().toISOString());
            expiry.setFullYear(expiry.getFullYear() + 2);
            setCertificate({
              id: id,
              candidate_id: foundUserId || 'local-candidate',
              assessment_id: match.assessmentId,
              credential_id: match.credentialId || `TT-${match.assessmentId.slice(0, 8).toUpperCase()}-${Date.now()}`,
              title: match.title,
              score: match.score ?? 0,
              percentile: undefined,
              level: (match.score ?? 0) >= 85 ? 'expert' : 'professional',
              issue_date: match.completedAt || new Date().toISOString(),
              expiry_date: expiry.toISOString(),
              skills_validated: [],
              is_valid: true,
              created_at: match.completedAt || new Date().toISOString(),
            });
          } else {
            setCertificate(null);
          }
        } else {
          const result = await certificateService.getById(id);
          setCertificate(result);
        }
      } catch (error) {
        console.error(`Failed to fetch certificate ${id}:`, error);
        setCertificate(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { certificate, loading };
}

