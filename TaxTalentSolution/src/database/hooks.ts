// =====================================================
// Tax Talent Solution Database Hooks
// React hooks for accessing local database
// =====================================================

import { useState, useEffect, useMemo } from 'react';
import LocalDatabase, {
  users,
  candidates,
  employers,
  employerUsers,
  jobs,
  jobApplications,
  assessments,
  certificates,
  notifications,
  adminUsers,
  candidateSkills,
  skillsMaster,
} from './localDb';
import { candidateService } from '../api/candidateService';
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
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async fetch
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      setData(LocalDatabase.getUsers());
      setLoading(false);
    };
    fetchData();
  }, []);

  return { users: data, loading };
}

export function useUser(id: string | undefined) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 50));
      setUser(LocalDatabase.getUserById(id) || null);
      setLoading(false);
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
      await new Promise(resolve => setTimeout(resolve, 50));
      setUser(LocalDatabase.getUserByEmail(email) || null);
      setLoading(false);
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await candidateService.getCandidates();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch candidates:', error);
        setData([]); // No fallback to mock data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { candidates: data, loading };
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

  return { candidate, loading };
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
      await new Promise(resolve => setTimeout(resolve, 100));
      setProfile(LocalDatabase.getCandidateProfile(candidateId));
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
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 50));
      setCandidate(LocalDatabase.getCandidateByUserId(userId) || null);
      setLoading(false);
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      setData(LocalDatabase.getEmployers());
      setLoading(false);
    };
    fetchData();
  }, []);

  return { employers: data, loading };
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
      await new Promise(resolve => setTimeout(resolve, 50));
      setEmployer(LocalDatabase.getEmployerById(id) || null);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  return { employer, loading };
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
      await new Promise(resolve => setTimeout(resolve, 50));
      setData(LocalDatabase.getEmployerUsers(employerId));
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let result = LocalDatabase.getJobs();
      
      if (filters) {
        if (filters.status) {
          result = result.filter(j => j.status === filters.status);
        }
        if (filters.category) {
          result = result.filter(j => j.category === filters.category);
        }
        if (filters.location) {
          result = result.filter(j => 
            (j.location_city?.toLowerCase().includes(filters.location!.toLowerCase()) ?? false) ||
            (j.location_state?.toLowerCase().includes(filters.location!.toLowerCase()) ?? false)
          );
        }
        if (filters.isRemote !== undefined) {
          result = result.filter(j => j.is_remote === filters.isRemote);
        }
      }
      
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [filters?.status, filters?.category, filters?.location, filters?.isRemote]);

  return { jobs: data, loading };
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
      await new Promise(resolve => setTimeout(resolve, 50));
      setJob(LocalDatabase.getJobById(id) || null);
      setLoading(false);
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
      await new Promise(resolve => setTimeout(resolve, 50));
      setJob(LocalDatabase.getJobWithEmployer(jobId));
      setLoading(false);
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
      await new Promise(resolve => setTimeout(resolve, 50));
      setData(LocalDatabase.getJobsByEmployer(employerId));
      setLoading(false);
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
      await new Promise(resolve => setTimeout(resolve, 100));
      setData(LocalDatabase.getApplications());
      setLoading(false);
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
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 50));
      setData(LocalDatabase.getApplicationsByCandidate(candidateId));
      setLoading(false);
    };
    fetchData();
  }, [candidateId]);

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
      await new Promise(resolve => setTimeout(resolve, 50));
      setData(LocalDatabase.getApplicationsByJob(jobId));
      setLoading(false);
    };
    fetchData();
  }, [jobId]);

  return { applications: data, loading };
}

export function useEmployerApplications(employerId: string | undefined) {
  const [data, setData] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employerId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 50));
      setData(LocalDatabase.getApplicationsByEmployer(employerId));
      setLoading(false);
    };
    fetchData();
  }, [employerId]);

  return { applications: data, loading };
}

// =====================================================
// ASSESSMENTS & CERTIFICATES HOOKS
// =====================================================

export function useAssessments() {
  const [data, setData] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      setData(LocalDatabase.getAssessments());
      setLoading(false);
    };
    fetchData();
  }, []);

  return { assessments: data, loading };
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
      await new Promise(resolve => setTimeout(resolve, 50));
      setAssessment(LocalDatabase.getAssessmentById(id) || null);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  return { assessment, loading };
}

export function useCertificates() {
  const [data, setData] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      setData(LocalDatabase.getCertificates());
      setLoading(false);
    };
    fetchData();
  }, []);

  return { certificates: data, loading };
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
      await new Promise(resolve => setTimeout(resolve, 50));
      setData(LocalDatabase.getCertificatesByCandidate(candidateId));
      setLoading(false);
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
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 50));
      const all = LocalDatabase.getNotificationsByUser(userId);
      const unread = LocalDatabase.getUnreadNotifications(userId);
      setData(all);
      setUnreadCount(unread.length);
      setLoading(false);
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
      await new Promise(resolve => setTimeout(resolve, 100));
      setData(LocalDatabase.getAdminUsers());
      setLoading(false);
    };
    fetchData();
  }, []);

  return { adminUsers: data, loading };
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
      setData(LocalDatabase.getSkillsMaster());
      setLoading(false);
    };
    fetchData();
  }, []);

  return { skills: data, loading };
}

// =====================================================
// DASHBOARD STATS HOOK
// =====================================================

export function useDashboardStats() {
  const [stats, setStats] = useState<ReturnType<typeof LocalDatabase.getStats> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      setStats(LocalDatabase.getStats());
      setLoading(false);
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
      await new Promise(resolve => setTimeout(resolve, 150));

      let filtered = [...candidates];

      if (searchParams.query) {
        const q = searchParams.query.toLowerCase();
        filtered = filtered.filter(c => {
          const user = users.find(u => u.id === c.user_id);
          return (
            (c.headline?.toLowerCase().includes(q) ?? false) ||
            (c.summary?.toLowerCase().includes(q) ?? false) ||
            (user?.name.toLowerCase().includes(q) ?? false)
          );
        });
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
      await new Promise(resolve => setTimeout(resolve, 150));

      let filtered = [...jobs].filter(j => j.status === 'active');

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
