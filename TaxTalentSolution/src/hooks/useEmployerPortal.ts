import { useEffect, useMemo, useState } from 'react';
import { isUuid } from '../api/userAssessmentService';
import { userService } from '../api/userService';
import {
  useEmployers,
  useEmployerJobs,
  useEmployerApplications,
  useCandidates,
  useJobs,
} from '../database';

type EmployerRow = {
  id: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  user_id?: string;
};

function normalizeEmail(email?: string): string {
  return (email || '').trim().toLowerCase();
}

function pickEmployerId(
  profile: { assignedEmployers?: string[]; employers?: Array<{ id?: string }> },
  employers: EmployerRow[],
  userId?: string,
  userEmail?: string
): string | undefined {
  const fromProfile = profile.assignedEmployers || [];
  if (fromProfile.length > 0) return fromProfile[0];

  const fromProfileRows = (profile.employers || [])
    .map((e) => e.id)
    .filter(Boolean) as string[];
  if (fromProfileRows.length > 0) return fromProfileRows[0];

  if (userId) {
    const owned = employers.find((e) => e.user_id === userId);
    if (owned) return owned.id;
  }

  const email = normalizeEmail(userEmail);
  if (email) {
    const byEmail = employers.find((e) => normalizeEmail(e.email) === email);
    if (byEmail) return byEmail.id;
  }

  return undefined;
}

export function useEmployerPortal(userId: string | undefined, userEmail?: string) {
  const [employerId, setEmployerId] = useState<string | undefined>();
  const [employerName, setEmployerName] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const { employers, loading: employersLoading } = useEmployers();
  const { jobs: employerJobs, loading: jobsLoading } = useEmployerJobs(employerId);
  const { applications, loading: appsLoading, refresh: refreshApplications } =
    useEmployerApplications(employerId);
  const { candidates, loading: candidatesLoading } = useCandidates();
  const { jobs: allJobs } = useJobs({ status: 'active' });

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      setProfileLoading(true);
      setProfileError(null);
      setEmployerId(undefined);
      setEmployerName('');

      if (!userId) {
        setProfileLoading(false);
        return;
      }

      let profile: {
        assignedEmployers?: string[];
        employers?: Array<{ id?: string; name?: string }>;
      } = {};

      if (isUuid(userId)) {
        try {
          profile = await userService.getUserById(userId);
          if (cancelled) return;
        } catch {
          if (!cancelled) setProfileError('Could not load employer account.');
        }
      }

      if (!cancelled) {
        const resolved = pickEmployerId(
          profile,
          employers as EmployerRow[],
          userId,
          userEmail
        );
        if (resolved) {
          setEmployerId(resolved);
          const fromList = employers.find((e) => e.id === resolved);
          const profileEmployer = (profile.employers || []).find((e) => e.id === resolved);
          setEmployerName(
            fromList?.company_name ||
              profileEmployer?.name ||
              fromList?.contact_person ||
              'Your company'
          );
        }
        setProfileLoading(false);
      }
    };

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [userId, userEmail, employers]);

  useEffect(() => {
    if (!employerId) return;
    const fromList = employers.find((e) => e.id === employerId);
    if (fromList?.company_name) {
      setEmployerName(fromList.company_name);
    }
  }, [employerId, employers]);

  const candidateNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of candidates) {
      const name = (c as { name?: string }).name;
      map.set(
        c.id,
        name || c.headline || `Candidate ${c.id.slice(0, 8)}`
      );
    }
    return map;
  }, [candidates]);

  const jobTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const j of allJobs) map.set(j.id, j.title);
    for (const j of employerJobs) map.set(j.id, j.title);
    return map;
  }, [allJobs, employerJobs]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort(
        (a, b) =>
          new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
      )
      .slice(0, 8)
      .map((app) => ({
        id: app.id,
        candidateName: candidateNameById.get(app.candidate_id) || 'Candidate',
        jobTitle: jobTitleById.get(app.job_id) || 'Role',
        status: app.status,
        appliedAt: app.applied_at,
      }));
  }, [applications, candidateNameById, jobTitleById]);

  const applicationsByDay = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Map<string, number>();
    for (const d of days) counts.set(d, 0);
    for (const app of applications) {
      const day = days[new Date(app.applied_at).getDay()];
      counts.set(day, (counts.get(day) || 0) + 1);
    }
    return days.map((name) => ({ name, views: counts.get(name) || 0 }));
  }, [applications]);

  const skillDemand = useMemo(() => {
    const counts = new Map<string, number>();
    for (const job of employerJobs) {
      const cat = job.category?.trim() || 'General';
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([skill, demand]) => ({ skill, demand: demand * 20 }))
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 6);
  }, [employerJobs]);

  const stats = useMemo(
    () => ({
      activeJobs: employerJobs.filter((j) => j.status === 'active').length,
      totalApplications: applications.length,
      underReview: applications.filter(
        (a) => a.status === 'submitted' || a.status === 'reviewed' || a.status === 'under_review'
      ).length,
      interviewStage: applications.filter(
        (a) => a.status === 'interview_scheduled' || a.status === 'shortlisted'
      ).length,
    }),
    [employerJobs, applications]
  );

  const loading =
    profileLoading || employersLoading || jobsLoading || appsLoading || candidatesLoading;

  return {
    employerId,
    employerName,
    setEmployerName,
    employerJobs,
    applications,
    candidates,
    recentApplications,
    applicationsByDay,
    skillDemand,
    stats,
    loading,
    profileError,
    hasEmployer: Boolean(employerId),
    refreshApplications,
  };
}

export function formatApplicationStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
