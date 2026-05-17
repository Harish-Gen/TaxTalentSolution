// =====================================================
// Tax Talent Solution Database Module
// Main export file for local database
// =====================================================

// Export types
export * from './types';

// Export local database and data
export { default as LocalDatabase } from './localDb';
export {
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

// Export hooks
export {
  // User hooks
  useUsers,
  useUser,
  useCurrentUser,
  
  // Candidate hooks
  useCandidates,
  useCandidate,
  useCandidateProfile,
  useCandidateByUserId,
  useCandidateSkills,
  
  // Employer hooks
  useEmployers,
  useEmployer,
  useEmployerUsers,
  
  // Job hooks
  useJobs,
  useJob,
  useJobWithEmployer,
  useEmployerJobs,
  
  // Application hooks
  useApplications,
  useCandidateApplications,
  useUserApplications,
  useJobApplications,
  useEmployerApplications,
  
  // Assessment & Certificate hooks
  useAssessments,
  useAssessment,
  useCertificates,
  useUserAssessmentActivity,
  useCandidateCertificates,
  
  // Notification hooks
  useNotifications,
  
  // Admin hooks
  useAdminUsers,
  useSavedCandidates,
  
  // Skills hooks
  useSkillsMaster,
  
  // Dashboard hooks
  useDashboardStats,
  
  // Search hooks
  useCandidateSearch,
  useJobSearch,

  // Interview hooks
  useInterviews,
} from './hooks';
