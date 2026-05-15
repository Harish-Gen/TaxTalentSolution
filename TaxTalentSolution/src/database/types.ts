// =====================================================
// Tax Talent Solution Database Types
// Auto-generated from schema.sql
// =====================================================

// =====================================================
// ENUMS
// =====================================================
export type UserRole = 'candidate' | 'employer_user' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type CandidateStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type Availability = 'immediate' | '2_weeks' | '1_month' | 'not_looking';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type Proficiency = 'basic' | 'intermediate' | 'advanced' | 'expert';
export type CompetencyLevel = 'basic' | 'intermediate' | 'expert' | 'not_applicable';
export type EmployerStatus = 'active' | 'inactive' | 'pending';
export type SubscriptionPlan = 'basic' | 'professional' | 'enterprise';
export type EmployerUserRole = 'owner' | 'admin' | 'recruiter' | 'viewer';
export type JobType = 'full_time' | 'part_time' | 'contract' | 'temporary';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead';
export type JobStatus = 'active' | 'closed' | 'draft' | 'paused';
export type ApplicationStatus = 'submitted' | 'reviewed' | 'shortlisted' | 'interview_scheduled' | 'offered' | 'hired' | 'rejected' | 'withdrawn';
export type AssessmentDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type AssessmentStatus = 'active' | 'draft' | 'archived';
export type QuestionType = 'multiple_choice' | 'true_false' | 'scenario';
export type CertificateLevel = 'professional' | 'specialist' | 'expert';
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';
export type InterviewType = 'phone' | 'video' | 'in_person' | 'technical';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
export type Recommendation = 'highly_recommended' | 'recommended' | 'maybe' | 'not_recommended';
export type ViewType = 'full_profile' | 'basic_profile' | 'skills_only';
export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'viewer';

// ── Candidate subscription plan types ─────────────────────────────────────
export type CandidatePlan = 'free' | 'professional' | 'premium';
export type BillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export interface UserSubscription {
  user_id: string;
  plan: CandidatePlan;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  start_date: string;   // ISO 8601
  expires_at: string;   // ISO 8601  (Free plan uses a far-future date)
  updated_at: string;   // ISO 8601
}

// =====================================================
// DATABASE TABLES
// =====================================================

export interface User {
  id: string;
  b2c_object_id?: string;   // Azure AD B2C Object ID
  email: string;
  name: string;
  phone?: string;
  country?: string;          // ISO 3166-1 alpha-2
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  oauth_provider?: string;
  email_verified: boolean;
  phone_verified: boolean;   // true after OTP verification
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Candidate {
  id: string;
  user_id: string;
  headline?: string;
  summary?: string;
  location_city?: string;
  location_state?: string;
  location_country: string;
  experience_years: number;
  availability: Availability;
  work_mode: WorkMode;
  expected_salary_min?: number;
  expected_salary_max?: number;
  hourly_rate?: number;
  current_salary?: number;
  linkedin_url?: string;
  resume_url?: string;
  profile_completeness: number;
  status: CandidateStatus;
  is_featured: boolean;
  profile_views: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface CandidateSkill {
  id: string;
  candidate_id: string;
  skill_name: string;
  proficiency: Proficiency;
  is_verified: boolean;
  years_experience: number;
  verified_date?: string;
  created_at: string;
}

export interface CandidateExperience {
  id: string;
  candidate_id: string;
  company_name: string;
  position: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  achievements?: string[];
  display_order: number;
  created_at: string;
}

export interface CandidateEducation {
  id: string;
  candidate_id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  display_order: number;
  created_at: string;
}

export interface CandidateCompetency {
  id: string;
  candidate_id: string;
  form_type: string;
  proficiency_level: CompetencyLevel;
  updated_at: string;
}

export interface CandidateResponsibility {
  id: string;
  candidate_id: string;
  responsibility_type: string;
  percentage: number;
  description?: string;
  created_at: string;
}

export interface Employer {
  id: string;
  company_name: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  company_size?: string;
  headquarters_city?: string;
  headquarters_state?: string;
  headquarters_country: string;
  description?: string;
  status: EmployerStatus;
  subscription_plan: SubscriptionPlan;
  subscription_expiry?: string;
  monthly_budget: number;
  total_hires: number;
  created_at: string;
  updated_at: string;
  last_active: string;
}

export interface EmployerUser {
  id: string;
  user_id: string;
  employer_id: string;
  role: EmployerUserRole;
  permissions?: string[];
  status: UserStatus;
  invited_by?: string;
  joined_at: string;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description?: string;
  location_city?: string;
  location_state?: string;
  location_country: string;
  is_remote: boolean;
  job_type: JobType;
  experience_level: ExperienceLevel;
  experience_years_min: number;
  experience_years_max?: number;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  category?: string;
  required_skills?: string[];
  preferred_skills?: string[];
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  status: JobStatus;
  is_urgent: boolean;
  is_featured: boolean;
  applicant_count: number;
  view_count: number;
  posted_date: string;
  closing_date?: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  candidate_id: string;
  employer_id: string;
  cover_letter?: string;
  resume_url?: string;
  current_compensation?: number;
  expected_compensation?: number;
  status: ApplicationStatus;
  stage: number;
  progress: number;
  applied_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  notes?: string;
}

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  status: string;
  action: string;
  performed_by?: string;
  notes?: string;
  created_at: string;
}

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty: AssessmentDifficulty;
  duration_minutes: number;
  passing_score: number;
  question_count: number;
  price: number;
  skills_validated?: string[];
  status: AssessmentStatus;
  total_attempts: number;
  avg_score: number;
  rating: number;
  is_active?: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question_text: string;
  question_type: QuestionType;
  difficulty?: string;
  points: number;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  display_order: number;
  created_at: string;
}

export interface Certificate {
  id: string;
  candidate_id: string;
  assessment_id?: string;
  credential_id: string;
  title: string;
  score?: number;
  percentile?: number;
  level: CertificateLevel;
  issue_date: string;
  expiry_date?: string;
  skills_validated?: string[];
  is_valid: boolean;
  pdf_url?: string;
  created_at: string;
}

export interface AssessmentAttempt {
  id: string;
  candidate_id: string;
  assessment_id: string;
  started_at: string;
  completed_at?: string;
  time_spent?: number;
  score?: number;
  percentage?: number;
  passed?: boolean;
  answers?: Record<string, any>;
  status: AttemptStatus;
  created_at: string;
}

export interface Interview {
  id: string;
  application_id: string;
  candidate_id: string;
  employer_id: string;
  interviewer_id?: string;
  interview_type: InterviewType;
  scheduled_date: string;
  duration_minutes: number;
  meeting_link?: string;
  status: InterviewStatus;
  notes?: string;
  created_at: string;
}

export interface InterviewFeedback {
  id: string;
  interview_id: string;
  interviewer_name?: string;
  interviewer_role?: string;
  overall_rating: number;
  technical_skills_rating?: number;
  communication_rating?: number;
  problem_solving_rating?: number;
  tax_knowledge_rating?: number;
  strengths?: string[];
  improvements?: string[];
  detailed_feedback?: string;
  recommendation: Recommendation;
  created_at: string;
}

export interface ProfileView {
  id: string;
  candidate_id: string;
  employer_id?: string;
  viewer_user_id?: string;
  view_type: ViewType;
  source?: string;
  viewed_at: string;
}

export interface SavedCandidate {
  id: string;
  employer_id: string;
  candidate_id: string;
  saved_by?: string;
  folder?: string;
  notes?: string;
  saved_at: string;
}

export interface SavedJob {
  id: string;
  candidate_id: string;
  job_id: string;
  saved_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  permissions?: string[];
  assigned_employers?: string[];
  status: UserStatus;
  created_at: string;
  last_login?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface SkillMaster {
  id: string;
  name: string;
  category?: string;
  is_predefined: boolean;
  usage_count: number;
  created_at: string;
}

// =====================================================
// JOINED / EXPANDED TYPES (for queries with relations)
// =====================================================

export interface CandidateWithUser extends Candidate {
  user: User;
}

export interface CandidateProfile extends CandidateWithUser {
  skills: CandidateSkill[];
  experience: CandidateExperience[];
  education: CandidateEducation[];
  competencies: CandidateCompetency[];
  responsibilities: CandidateResponsibility[];
  certificates: Certificate[];
}

export interface JobWithEmployer extends Job {
  employer: Employer;
}

export interface ApplicationWithDetails extends JobApplication {
  job: Job;
  candidate: Candidate;
  employer: Employer;
  status_history: ApplicationStatusHistory[];
}

export interface EmployerWithUsers extends Employer {
  users: (EmployerUser & { user: User })[];
}

export interface InterviewWithFeedback extends Interview {
  feedback?: InterviewFeedback;
  candidate: Candidate;
  application: JobApplication;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// =====================================================
// FILTER / QUERY TYPES
// =====================================================

export interface CandidateFilters {
  search?: string;
  location_state?: string;
  location_city?: string;
  experience_min?: number;
  experience_max?: number;
  skills?: string[];
  availability?: Availability[];
  work_mode?: WorkMode[];
  status?: CandidateStatus[];
  min_rating?: number;
  has_certificate?: boolean;
}

export interface JobFilters {
  search?: string;
  employer_id?: string;
  location_state?: string;
  location_city?: string;
  is_remote?: boolean;
  job_type?: JobType[];
  experience_level?: ExperienceLevel[];
  salary_min?: number;
  salary_max?: number;
  category?: string[];
  skills?: string[];
  status?: JobStatus[];
  is_urgent?: boolean;
}

export interface ApplicationFilters {
  candidate_id?: string;
  job_id?: string;
  employer_id?: string;
  status?: ApplicationStatus[];
  date_from?: string;
  date_to?: string;
}
