// =====================================================
// Tax Talent Solution Local Database Service
// Mock data for local development and testing
// =====================================================

import {
  User,
  Candidate,
  CandidateSkill,
  CandidateExperience,
  CandidateEducation,
  CandidateCompetency,
  Employer,
  EmployerUser,
  Job,
  JobApplication,
  Assessment,
  Certificate,
  AdminUser,
  Notification,
  SkillMaster,
  CandidateProfile,
  JobWithEmployer,
  ApplicationWithDetails,
} from './types';

// =====================================================
// USERS DATA
// =====================================================
export const users: User[] = [
  // Admin Users
  {
    id: 'aaaaaaaa-0001-0001-0001-000000000001',
    email: 'admin@taxtalentsolution.com',
    name: 'Rajesh Kumar',
    phone: '+91 98765 00001',
    role: 'admin',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
    last_login: '2025-01-20T10:00:00Z',
  },
  {
    id: 'aaaaaaaa-0001-0001-0001-000000000002',
    email: 'superadmin@taxtalentsolution.com',
    name: 'Priya Mehta',
    phone: '+91 98765 00002',
    role: 'admin',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
    last_login: '2025-01-20T09:00:00Z',
  },
  // Employer Users - KPMG
  {
    id: 'eeeeeeee-0002-0001-0001-000000000001',
    email: 'recruiter1@kpmg.com',
    name: 'Anita Sharma',
    phone: '+91 98765 10001',
    role: 'employer_user',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z',
    last_login: '2025-01-19T14:00:00Z',
  },
  {
    id: 'eeeeeeee-0002-0001-0001-000000000002',
    email: 'recruiter2@kpmg.com',
    name: 'Vikram Singh',
    phone: '+91 98765 10002',
    role: 'employer_user',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    last_login: '2025-01-18T11:00:00Z',
  },
  // Employer Users - Deloitte
  {
    id: 'eeeeeeee-0002-0001-0001-000000000003',
    email: 'hr1@deloitte.com',
    name: 'Sneha Patel',
    phone: '+91 98765 20001',
    role: 'employer_user',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-02-20T00:00:00Z',
    updated_at: '2024-02-20T00:00:00Z',
    last_login: '2025-01-20T08:00:00Z',
  },
  {
    id: 'eeeeeeee-0002-0001-0001-000000000004',
    email: 'hr2@deloitte.com',
    name: 'Rahul Verma',
    phone: '+91 98765 20002',
    role: 'employer_user',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-04-10T00:00:00Z',
    updated_at: '2024-04-10T00:00:00Z',
    last_login: '2025-01-17T16:00:00Z',
  },
  // Candidate Users (15 candidates)
  {
    id: 'cccccccc-0001-0001-0001-000000000001',
    email: 'priya.sharma@email.com',
    name: 'Priya Sharma',
    phone: '+91 98765 30001',
    role: 'candidate',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-06-15T00:00:00Z',
    updated_at: '2024-06-15T00:00:00Z',
    last_login: '2025-01-20T07:00:00Z',
  },
  {
    id: 'cccccccc-0001-0001-0001-000000000002',
    email: 'rahul.kumar@email.com',
    name: 'Rahul Kumar',
    phone: '+91 98765 30002',
    role: 'candidate',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-05-20T00:00:00Z',
    updated_at: '2024-05-20T00:00:00Z',
    last_login: '2025-01-19T12:00:00Z',
  },
  {
    id: 'cccccccc-0001-0001-0001-000000000003',
    email: 'sneha.gupta@email.com',
    name: 'Sneha Gupta',
    phone: '+91 98765 30003',
    role: 'candidate',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-07-10T00:00:00Z',
    updated_at: '2024-07-10T00:00:00Z',
    last_login: '2025-01-18T09:00:00Z',
  },
  {
    id: 'cccccccc-0001-0001-0001-000000000004',
    email: 'amit.patel@email.com',
    name: 'Amit Patel',
    phone: '+91 98765 30004',
    role: 'candidate',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-04-05T00:00:00Z',
    updated_at: '2024-04-05T00:00:00Z',
    last_login: '2025-01-20T06:00:00Z',
  },
  {
    id: 'cccccccc-0001-0001-0001-000000000005',
    email: 'deepika.singh@email.com',
    name: 'Deepika Singh',
    phone: '+91 98765 30005',
    role: 'candidate',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-08-22T00:00:00Z',
    updated_at: '2024-08-22T00:00:00Z',
    last_login: '2025-01-19T15:00:00Z',
  },
  {
    id: 'cccccccc-0001-0001-0001-000000000006',
    email: 'vikram.malhotra@email.com',
    name: 'Vikram Malhotra',
    phone: '+91 98765 30006',
    role: 'candidate',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    last_login: '2025-01-20T11:00:00Z',
  },
  {
    id: 'cccccccc-0001-0001-0001-000000000007',
    email: 'neha.reddy@email.com',
    name: 'Neha Reddy',
    phone: '+91 98765 30007',
    role: 'candidate',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
    last_login: '2025-01-18T14:00:00Z',
  },
  {
    id: 'cccccccc-0001-0001-0001-000000000008',
    email: 'arjun.nair@email.com',
    name: 'Arjun Nair',
    phone: '+91 98765 30008',
    role: 'candidate',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-07-25T00:00:00Z',
    updated_at: '2024-07-25T00:00:00Z',
    last_login: '2025-01-17T10:00:00Z',
  },
  {
    id: 'cccccccc-0001-0001-0001-000000000009',
    email: 'kavita.joshi@email.com',
    name: 'Kavita Joshi',
    phone: '+91 98765 30009',
    role: 'candidate',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-05-10T00:00:00Z',
    updated_at: '2024-05-10T00:00:00Z',
    last_login: '2025-01-20T08:30:00Z',
  },
  {
    id: 'cccccccc-0001-0001-0001-000000000010',
    email: 'suresh.iyer@email.com',
    name: 'Suresh Iyer',
    phone: '+91 98765 30010',
    role: 'candidate',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-04-18T00:00:00Z',
    updated_at: '2024-04-18T00:00:00Z',
    last_login: '2025-01-19T09:00:00Z',
  },
  {
    id: 'cccccccc-0001-0001-0001-000000000011',
    email: 'pooja.menon@email.com',
    name: 'Pooja Menon',
    phone: '+91 98765 30011',
    role: 'candidate',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    last_login: '2025-01-15T11:00:00Z',
  },
  {
    id: 'cccccccc-0001-0001-0001-000000000012',
    email: 'arun.das@email.com',
    name: 'Arun Das',
    phone: '+91 98765 30012',
    role: 'candidate',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-08-05T00:00:00Z',
    updated_at: '2024-08-05T00:00:00Z',
    last_login: '2025-01-18T16:00:00Z',
  },
  {
    id: 'cccccccc-0001-0001-0001-000000000013',
    email: 'ritu.saxena@email.com',
    name: 'Ritu Saxena',
    phone: '+91 98765 30013',
    role: 'candidate',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-06-20T00:00:00Z',
    updated_at: '2024-06-20T00:00:00Z',
    last_login: '2025-01-19T13:00:00Z',
  },
  {
    id: 'cccccccc-0001-0001-0001-000000000014',
    email: 'karan.mehta@email.com',
    name: 'Karan Mehta',
    phone: '+91 98765 30014',
    role: 'candidate',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-07-15T00:00:00Z',
    updated_at: '2024-07-15T00:00:00Z',
    last_login: '2025-01-20T07:30:00Z',
  },
  {
    id: 'cccccccc-0001-0001-0001-000000000015',
    email: 'anjali.desai@email.com',
    name: 'Anjali Desai',
    phone: '+91 98765 30015',
    role: 'candidate',
    status: 'active',
    email_verified: true,
    phone_verified: false,
    created_at: '2024-09-10T00:00:00Z',
    updated_at: '2024-09-10T00:00:00Z',
    last_login: '2025-01-17T14:00:00Z',
  },
];

// =====================================================
// ADMIN USERS DATA
// =====================================================
export const adminUsers: AdminUser[] = [
  {
    id: 'aaaaaaaa-0002-0001-0001-000000000001',
    user_id: 'aaaaaaaa-0001-0001-0001-000000000001',
    role: 'admin',
    permissions: ['Full Access', 'User Management', 'Employer Management'],
    status: 'active',
    created_at: '2024-01-10T00:00:00Z',
    last_login: '2025-01-20T10:00:00Z',
  },
  {
    id: 'aaaaaaaa-0002-0001-0001-000000000002',
    user_id: 'aaaaaaaa-0001-0001-0001-000000000002',
    role: 'super_admin',
    permissions: ['Full Access', 'User Management', 'Employer Management', 'System Settings', 'Billing'],
    status: 'active',
    created_at: '2024-01-10T00:00:00Z',
    last_login: '2025-01-20T09:00:00Z',
  },
];

// =====================================================
// EMPLOYERS DATA
// =====================================================
export const employers: Employer[] = [
  {
    id: 'eeeeeeee-0001-0001-0001-000000000001',
    company_name: 'KPMG India',
    logo_url: '/images/kpmg-logo.png',
    website: 'www.kpmg.com/in',
    industry: 'Accounting & Tax Services',
    company_size: '1000+',
    headquarters_city: 'Mumbai',
    headquarters_state: 'Maharashtra',
    headquarters_country: 'India',
    description: 'KPMG India is part of the global network of KPMG International, providing Audit, Tax, and Advisory services.',
    status: 'active',
    subscription_plan: 'enterprise',
    monthly_budget: 500000,
    total_hires: 45,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    last_active: '2025-01-20T08:00:00Z',
  },
  {
    id: 'eeeeeeee-0001-0001-0001-000000000002',
    company_name: 'Deloitte India',
    logo_url: '/images/deloitte-logo.png',
    website: 'www.deloitte.com/in',
    industry: 'Professional Services',
    company_size: '1000+',
    headquarters_city: 'Bangalore',
    headquarters_state: 'Karnataka',
    headquarters_country: 'India',
    description: 'Deloitte provides industry-leading audit and assurance, tax and legal, consulting, financial advisory, and risk advisory services.',
    status: 'active',
    subscription_plan: 'enterprise',
    monthly_budget: 750000,
    total_hires: 67,
    created_at: '2024-02-20T00:00:00Z',
    updated_at: '2024-02-20T00:00:00Z',
    last_active: '2025-01-20T09:00:00Z',
  },
];

// =====================================================
// EMPLOYER USERS DATA
// =====================================================
export const employerUsers: EmployerUser[] = [
  {
    id: 'eeeeeeee-0003-0001-0001-000000000001',
    user_id: 'eeeeeeee-0002-0001-0001-000000000001',
    employer_id: 'eeeeeeee-0001-0001-0001-000000000001',
    role: 'owner',
    permissions: ['Full Access', 'Manage Users', 'Post Jobs', 'View Candidates'],
    status: 'active',
    joined_at: '2024-02-15T00:00:00Z',
  },
  {
    id: 'eeeeeeee-0003-0001-0001-000000000002',
    user_id: 'eeeeeeee-0002-0001-0001-000000000002',
    employer_id: 'eeeeeeee-0001-0001-0001-000000000001',
    role: 'recruiter',
    permissions: ['Post Jobs', 'View Candidates', 'Schedule Interviews'],
    status: 'active',
    joined_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'eeeeeeee-0003-0001-0001-000000000003',
    user_id: 'eeeeeeee-0002-0001-0001-000000000003',
    employer_id: 'eeeeeeee-0001-0001-0001-000000000002',
    role: 'owner',
    permissions: ['Full Access', 'Manage Users', 'Post Jobs', 'View Candidates'],
    status: 'active',
    joined_at: '2024-02-20T00:00:00Z',
  },
  {
    id: 'eeeeeeee-0003-0001-0001-000000000004',
    user_id: 'eeeeeeee-0002-0001-0001-000000000004',
    employer_id: 'eeeeeeee-0001-0001-0001-000000000002',
    role: 'recruiter',
    permissions: ['Post Jobs', 'View Candidates', 'Schedule Interviews'],
    status: 'active',
    joined_at: '2024-04-10T00:00:00Z',
  },
];

// =====================================================
// CANDIDATES DATA
// =====================================================
export const candidates: Candidate[] = [
  {
    id: 'cccccccc-0002-0001-0001-000000000001',
    user_id: 'cccccccc-0001-0001-0001-000000000001',
    headline: 'Senior Tax Analyst - 1040 Specialist',
    summary: 'Experienced tax professional with 5 years of expertise in individual tax returns. Expert in complex 1040 scenarios including self-employment, investments, and multi-state filings.',
    location_city: 'Bangalore',
    location_state: 'Karnataka',
    location_country: 'India',
    experience_years: 5,
    availability: 'immediate',
    work_mode: 'remote',
    expected_salary_min: 800000,
    expected_salary_max: 1200000,
    hourly_rate: 2500,
    current_salary: 750000,
    linkedin_url: 'linkedin.com/in/priyasharma',
    profile_completeness: 95,
    status: 'approved',
    is_featured: true,
    profile_views: 156,
    rating: 4.8,
    created_at: '2024-06-15T00:00:00Z',
    updated_at: '2024-06-15T00:00:00Z',
  },
  {
    id: 'cccccccc-0002-0001-0001-000000000002',
    user_id: 'cccccccc-0001-0001-0001-000000000002',
    headline: 'Tax Consultant - Partnership & Corporate',
    summary: 'Specialized in partnership and corporate taxation with 7 years experience. Deep expertise in Form 1065, 1120, and complex K-1 allocations.',
    location_city: 'Hyderabad',
    location_state: 'Telangana',
    location_country: 'India',
    experience_years: 7,
    availability: '2_weeks',
    work_mode: 'hybrid',
    expected_salary_min: 1200000,
    expected_salary_max: 1800000,
    hourly_rate: 3500,
    current_salary: 1100000,
    linkedin_url: 'linkedin.com/in/rahulkumar',
    profile_completeness: 100,
    status: 'approved',
    is_featured: true,
    profile_views: 203,
    rating: 4.9,
    created_at: '2024-05-20T00:00:00Z',
    updated_at: '2024-05-20T00:00:00Z',
  },
  {
    id: 'cccccccc-0002-0001-0001-000000000003',
    user_id: 'cccccccc-0001-0001-0001-000000000003',
    headline: 'Tax Associate - S Corporation Expert',
    summary: 'Detail-oriented professional with strong background in S Corporation taxation and compliance. 4 years of hands-on experience.',
    location_city: 'Pune',
    location_state: 'Maharashtra',
    location_country: 'India',
    experience_years: 4,
    availability: 'immediate',
    work_mode: 'remote',
    expected_salary_min: 600000,
    expected_salary_max: 900000,
    hourly_rate: 2200,
    current_salary: 550000,
    linkedin_url: 'linkedin.com/in/snehagupta',
    profile_completeness: 85,
    status: 'approved',
    is_featured: false,
    profile_views: 124,
    rating: 4.6,
    created_at: '2024-07-10T00:00:00Z',
    updated_at: '2024-07-10T00:00:00Z',
  },
  {
    id: 'cccccccc-0002-0001-0001-000000000004',
    user_id: 'cccccccc-0001-0001-0001-000000000004',
    headline: 'Senior Tax Manager - Private Equity',
    summary: 'Expert in private equity taxation with 9 years experience. Proven track record in complex fund structures and investor reporting.',
    location_city: 'Gurgaon',
    location_state: 'Haryana',
    location_country: 'India',
    experience_years: 9,
    availability: '1_month',
    work_mode: 'hybrid',
    expected_salary_min: 2000000,
    expected_salary_max: 2800000,
    hourly_rate: 5000,
    current_salary: 1900000,
    linkedin_url: 'linkedin.com/in/amitpatel',
    profile_completeness: 100,
    status: 'approved',
    is_featured: true,
    profile_views: 287,
    rating: 5.0,
    created_at: '2024-04-05T00:00:00Z',
    updated_at: '2024-04-05T00:00:00Z',
  },
  {
    id: 'cccccccc-0002-0001-0001-000000000005',
    user_id: 'cccccccc-0001-0001-0001-000000000005',
    headline: 'Tax Analyst - Individual & Small Business',
    summary: 'Enthusiastic tax professional with 3 years expertise in individual returns and small business taxation.',
    location_city: 'Chennai',
    location_state: 'Tamil Nadu',
    location_country: 'India',
    experience_years: 3,
    availability: 'immediate',
    work_mode: 'remote',
    expected_salary_min: 450000,
    expected_salary_max: 650000,
    hourly_rate: 1800,
    current_salary: 420000,
    linkedin_url: 'linkedin.com/in/deepikasingh',
    profile_completeness: 75,
    status: 'approved',
    is_featured: false,
    profile_views: 98,
    rating: 4.5,
    created_at: '2024-08-22T00:00:00Z',
    updated_at: '2024-08-22T00:00:00Z',
  },
  {
    id: 'cccccccc-0002-0001-0001-000000000006',
    user_id: 'cccccccc-0001-0001-0001-000000000006',
    headline: 'Tax Director - Corporate & International',
    summary: 'Strategic tax leader with 12 years of deep expertise in corporate and international taxation for multinational clients.',
    location_city: 'Mumbai',
    location_state: 'Maharashtra',
    location_country: 'India',
    experience_years: 12,
    availability: '2_weeks',
    work_mode: 'onsite',
    expected_salary_min: 3500000,
    expected_salary_max: 4500000,
    hourly_rate: 8000,
    current_salary: 3200000,
    linkedin_url: 'linkedin.com/in/vikrammalhotra',
    profile_completeness: 100,
    status: 'approved',
    is_featured: true,
    profile_views: 342,
    rating: 4.9,
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
  },
  {
    id: 'cccccccc-0002-0001-0001-000000000007',
    user_id: 'cccccccc-0001-0001-0001-000000000007',
    headline: 'Tax Specialist - 1065 & K-1 Expert',
    summary: 'Focused on partnership taxation with 6 years experience. Strong expertise in operating partnerships and complex allocations.',
    location_city: 'Noida',
    location_state: 'Uttar Pradesh',
    location_country: 'India',
    experience_years: 6,
    availability: 'immediate',
    work_mode: 'remote',
    expected_salary_min: 900000,
    expected_salary_max: 1300000,
    hourly_rate: 3000,
    current_salary: 850000,
    linkedin_url: 'linkedin.com/in/nehareddy',
    profile_completeness: 90,
    status: 'approved',
    is_featured: false,
    profile_views: 145,
    rating: 4.7,
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'cccccccc-0002-0001-0001-000000000008',
    user_id: 'cccccccc-0001-0001-0001-000000000008',
    headline: 'Senior Tax Analyst - Multi-State Filing',
    summary: 'Expert in multi-state tax compliance with 5 years experience. Specialized in state nexus and apportionment.',
    location_city: 'Kochi',
    location_state: 'Kerala',
    location_country: 'India',
    experience_years: 5,
    availability: '2_weeks',
    work_mode: 'hybrid',
    expected_salary_min: 750000,
    expected_salary_max: 1100000,
    hourly_rate: 2600,
    current_salary: 700000,
    linkedin_url: 'linkedin.com/in/arjunnair',
    profile_completeness: 88,
    status: 'approved',
    is_featured: false,
    profile_views: 112,
    rating: 4.6,
    created_at: '2024-07-25T00:00:00Z',
    updated_at: '2024-07-25T00:00:00Z',
  },
  {
    id: 'cccccccc-0002-0001-0001-000000000009',
    user_id: 'cccccccc-0001-0001-0001-000000000009',
    headline: 'Tax Consultant - HNI Individual Returns',
    summary: 'Specialized in high-net-worth individual taxation with 8 years experience. Expert in investment income and estate planning.',
    location_city: 'Delhi',
    location_state: 'Delhi',
    location_country: 'India',
    experience_years: 8,
    availability: 'immediate',
    work_mode: 'remote',
    expected_salary_min: 1400000,
    expected_salary_max: 2000000,
    hourly_rate: 4000,
    current_salary: 1300000,
    linkedin_url: 'linkedin.com/in/kavitajoshi',
    profile_completeness: 95,
    status: 'approved',
    is_featured: true,
    profile_views: 198,
    rating: 4.8,
    created_at: '2024-05-10T00:00:00Z',
    updated_at: '2024-05-10T00:00:00Z',
  },
  {
    id: 'cccccccc-0002-0001-0001-000000000010',
    user_id: 'cccccccc-0001-0001-0001-000000000010',
    headline: 'Tax Manager - Corporate Compliance',
    summary: 'Experienced in corporate tax compliance and planning with 7 years background. Strong in Form 1120 and state filings.',
    location_city: 'Ahmedabad',
    location_state: 'Gujarat',
    location_country: 'India',
    experience_years: 7,
    availability: '1_month',
    work_mode: 'hybrid',
    expected_salary_min: 1100000,
    expected_salary_max: 1600000,
    hourly_rate: 3200,
    current_salary: 1050000,
    linkedin_url: 'linkedin.com/in/sureshiyer',
    profile_completeness: 92,
    status: 'approved',
    is_featured: false,
    profile_views: 167,
    rating: 4.7,
    created_at: '2024-04-18T00:00:00Z',
    updated_at: '2024-04-18T00:00:00Z',
  },
  {
    id: 'cccccccc-0002-0001-0001-000000000011',
    user_id: 'cccccccc-0001-0001-0001-000000000011',
    headline: 'Junior Tax Analyst - Fresh Graduate',
    summary: 'Recent commerce graduate with strong foundation in US taxation. Completed internship at Big 4 firm.',
    location_city: 'Indore',
    location_state: 'Madhya Pradesh',
    location_country: 'India',
    experience_years: 1,
    availability: 'immediate',
    work_mode: 'remote',
    expected_salary_min: 300000,
    expected_salary_max: 450000,
    hourly_rate: 1200,
    current_salary: 0,
    linkedin_url: 'linkedin.com/in/poojamenon',
    profile_completeness: 65,
    status: 'pending',
    is_featured: false,
    profile_views: 45,
    rating: 0,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: 'cccccccc-0002-0001-0001-000000000012',
    user_id: 'cccccccc-0001-0001-0001-000000000012',
    headline: 'Tax Associate - Non-Profit Specialist',
    summary: 'Focused on non-profit taxation with 4 years experience. Expert in Form 990 and tax-exempt organizations.',
    location_city: 'Kolkata',
    location_state: 'West Bengal',
    location_country: 'India',
    experience_years: 4,
    availability: 'immediate',
    work_mode: 'remote',
    expected_salary_min: 550000,
    expected_salary_max: 800000,
    hourly_rate: 2000,
    current_salary: 500000,
    linkedin_url: 'linkedin.com/in/arundas',
    profile_completeness: 82,
    status: 'approved',
    is_featured: false,
    profile_views: 89,
    rating: 4.4,
    created_at: '2024-08-05T00:00:00Z',
    updated_at: '2024-08-05T00:00:00Z',
  },
  {
    id: 'cccccccc-0002-0001-0001-000000000013',
    user_id: 'cccccccc-0001-0001-0001-000000000013',
    headline: 'Senior Tax Analyst - International Tax',
    summary: 'Specialized in international tax compliance including FBAR, FATCA, and transfer pricing. 6 years of experience.',
    location_city: 'Jaipur',
    location_state: 'Rajasthan',
    location_country: 'India',
    experience_years: 6,
    availability: '2_weeks',
    work_mode: 'hybrid',
    expected_salary_min: 950000,
    expected_salary_max: 1400000,
    hourly_rate: 3100,
    current_salary: 900000,
    linkedin_url: 'linkedin.com/in/ritusaxena',
    profile_completeness: 88,
    status: 'approved',
    is_featured: false,
    profile_views: 134,
    rating: 4.6,
    created_at: '2024-06-20T00:00:00Z',
    updated_at: '2024-06-20T00:00:00Z',
  },
  {
    id: 'cccccccc-0002-0001-0001-000000000014',
    user_id: 'cccccccc-0001-0001-0001-000000000014',
    headline: 'Tax Consultant - Real Estate Focus',
    summary: 'Expert in real estate taxation with 5 years experience. Strong in depreciation, 1031 exchanges, and passive activity rules.',
    location_city: 'Chandigarh',
    location_state: 'Punjab',
    location_country: 'India',
    experience_years: 5,
    availability: 'immediate',
    work_mode: 'remote',
    expected_salary_min: 800000,
    expected_salary_max: 1150000,
    hourly_rate: 2700,
    current_salary: 750000,
    linkedin_url: 'linkedin.com/in/karanmehta',
    profile_completeness: 85,
    status: 'approved',
    is_featured: false,
    profile_views: 121,
    rating: 4.5,
    created_at: '2024-07-15T00:00:00Z',
    updated_at: '2024-07-15T00:00:00Z',
  },
  {
    id: 'cccccccc-0002-0001-0001-000000000015',
    user_id: 'cccccccc-0001-0001-0001-000000000015',
    headline: 'Tax Analyst - Startup & Emerging Companies',
    summary: 'Focused on startup taxation with 3 years experience. Expertise in equity compensation, R&D credits, and entity selection.',
    location_city: 'Pune',
    location_state: 'Maharashtra',
    location_country: 'India',
    experience_years: 3,
    availability: 'immediate',
    work_mode: 'remote',
    expected_salary_min: 500000,
    expected_salary_max: 750000,
    hourly_rate: 1900,
    current_salary: 480000,
    linkedin_url: 'linkedin.com/in/anjalidesai',
    profile_completeness: 78,
    status: 'approved',
    is_featured: false,
    profile_views: 76,
    rating: 4.3,
    created_at: '2024-09-10T00:00:00Z',
    updated_at: '2024-09-10T00:00:00Z',
  },
];

// =====================================================
// CANDIDATE SKILLS DATA
// =====================================================
export const candidateSkills: CandidateSkill[] = [
  // Candidate 1: Priya Sharma
  { id: 'skill-001', candidate_id: 'cccccccc-0002-0001-0001-000000000001', skill_name: '1040 Individual Returns', proficiency: 'expert', is_verified: true, years_experience: 5, created_at: '2024-06-15T00:00:00Z' },
  { id: 'skill-002', candidate_id: 'cccccccc-0002-0001-0001-000000000001', skill_name: 'Multi-State Tax Filing', proficiency: 'advanced', is_verified: true, years_experience: 4, created_at: '2024-06-15T00:00:00Z' },
  { id: 'skill-003', candidate_id: 'cccccccc-0002-0001-0001-000000000001', skill_name: 'Drake Software', proficiency: 'expert', is_verified: true, years_experience: 5, created_at: '2024-06-15T00:00:00Z' },
  { id: 'skill-004', candidate_id: 'cccccccc-0002-0001-0001-000000000001', skill_name: 'Tax Planning', proficiency: 'advanced', is_verified: false, years_experience: 3, created_at: '2024-06-15T00:00:00Z' },
  { id: 'skill-005', candidate_id: 'cccccccc-0002-0001-0001-000000000001', skill_name: 'ProConnect Tax', proficiency: 'advanced', is_verified: true, years_experience: 4, created_at: '2024-06-15T00:00:00Z' },
  
  // Candidate 2: Rahul Kumar
  { id: 'skill-006', candidate_id: 'cccccccc-0002-0001-0001-000000000002', skill_name: '1065 Partnership Returns', proficiency: 'expert', is_verified: true, years_experience: 7, created_at: '2024-05-20T00:00:00Z' },
  { id: 'skill-007', candidate_id: 'cccccccc-0002-0001-0001-000000000002', skill_name: '1120 Corporate Returns', proficiency: 'expert', is_verified: true, years_experience: 6, created_at: '2024-05-20T00:00:00Z' },
  { id: 'skill-008', candidate_id: 'cccccccc-0002-0001-0001-000000000002', skill_name: 'K-1 Reporting', proficiency: 'expert', is_verified: true, years_experience: 7, created_at: '2024-05-20T00:00:00Z' },
  { id: 'skill-009', candidate_id: 'cccccccc-0002-0001-0001-000000000002', skill_name: 'CCH Axcess', proficiency: 'expert', is_verified: true, years_experience: 5, created_at: '2024-05-20T00:00:00Z' },
  
  // Candidate 3: Sneha Gupta
  { id: 'skill-010', candidate_id: 'cccccccc-0002-0001-0001-000000000003', skill_name: '1120S S Corporation Returns', proficiency: 'expert', is_verified: true, years_experience: 4, created_at: '2024-07-10T00:00:00Z' },
  { id: 'skill-011', candidate_id: 'cccccccc-0002-0001-0001-000000000003', skill_name: 'Drake Software', proficiency: 'advanced', is_verified: true, years_experience: 4, created_at: '2024-07-10T00:00:00Z' },
  
  // Candidate 4: Amit Patel
  { id: 'skill-012', candidate_id: 'cccccccc-0002-0001-0001-000000000004', skill_name: 'Private Equity Taxation', proficiency: 'expert', is_verified: true, years_experience: 9, created_at: '2024-04-05T00:00:00Z' },
  { id: 'skill-013', candidate_id: 'cccccccc-0002-0001-0001-000000000004', skill_name: '1065 Partnership Returns', proficiency: 'expert', is_verified: true, years_experience: 9, created_at: '2024-04-05T00:00:00Z' },
  { id: 'skill-014', candidate_id: 'cccccccc-0002-0001-0001-000000000004', skill_name: 'K-1 Reporting', proficiency: 'expert', is_verified: true, years_experience: 9, created_at: '2024-04-05T00:00:00Z' },
  
  // Candidate 5: Deepika Singh
  { id: 'skill-015', candidate_id: 'cccccccc-0002-0001-0001-000000000005', skill_name: '1040 Individual Returns', proficiency: 'advanced', is_verified: true, years_experience: 3, created_at: '2024-08-22T00:00:00Z' },
  { id: 'skill-016', candidate_id: 'cccccccc-0002-0001-0001-000000000005', skill_name: 'ProSeries', proficiency: 'intermediate', is_verified: true, years_experience: 2, created_at: '2024-08-22T00:00:00Z' },
  
  // Candidate 6: Vikram Malhotra
  { id: 'skill-017', candidate_id: 'cccccccc-0002-0001-0001-000000000006', skill_name: '1120 Corporate Returns', proficiency: 'expert', is_verified: true, years_experience: 12, created_at: '2024-03-15T00:00:00Z' },
  { id: 'skill-018', candidate_id: 'cccccccc-0002-0001-0001-000000000006', skill_name: 'International Tax Compliance', proficiency: 'expert', is_verified: true, years_experience: 10, created_at: '2024-03-15T00:00:00Z' },
  { id: 'skill-019', candidate_id: 'cccccccc-0002-0001-0001-000000000006', skill_name: 'Tax Planning', proficiency: 'expert', is_verified: true, years_experience: 12, created_at: '2024-03-15T00:00:00Z' },
];

// =====================================================
// JOBS DATA
// =====================================================
export const jobs: Job[] = [
  {
    id: '77777777-0001-0001-0001-000000000001',
    employer_id: 'eeeeeeee-0001-0001-0001-000000000001',
    title: 'Senior Tax Analyst - 1040 Specialist',
    description: 'We are seeking an experienced Senior Tax Analyst with expertise in Form 1040 preparation and review.',
    location_city: 'Mumbai',
    location_state: 'Maharashtra',
    location_country: 'India',
    is_remote: false,
    job_type: 'full_time',
    experience_level: 'senior',
    experience_years_min: 4,
    experience_years_max: 7,
    salary_min: 800000,
    salary_max: 1200000,
    salary_currency: 'INR',
    category: 'Individual Tax',
    required_skills: ['1040', 'Multi-state Filing', 'Drake Software'],
    responsibilities: ['Prepare and review Form 1040', 'Client consultation', 'Tax planning'],
    benefits: ['Health insurance', 'Performance bonus', 'Remote work options'],
    status: 'active',
    is_urgent: true,
    is_featured: true,
    applicant_count: 45,
    view_count: 320,
    posted_date: '2024-12-01T00:00:00Z',
    closing_date: '2025-02-28',
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '77777777-0001-0001-0001-000000000002',
    employer_id: 'eeeeeeee-0001-0001-0001-000000000001',
    title: 'Tax Manager - Partnership Returns',
    description: 'Lead our partnership tax division handling complex 1065 returns and K-1 distributions.',
    location_city: 'Mumbai',
    location_state: 'Maharashtra',
    location_country: 'India',
    is_remote: true,
    job_type: 'full_time',
    experience_level: 'lead',
    experience_years_min: 7,
    experience_years_max: 12,
    salary_min: 1500000,
    salary_max: 2200000,
    salary_currency: 'INR',
    category: 'Partnership Tax',
    required_skills: ['1065', 'K-1', 'CCH Axcess'],
    responsibilities: ['Manage tax team', 'Partnership returns', 'Client relationships'],
    benefits: ['Competitive salary', 'Bonus structure', 'Flexible hours'],
    status: 'active',
    is_urgent: false,
    is_featured: true,
    applicant_count: 28,
    view_count: 256,
    posted_date: '2024-12-10T00:00:00Z',
    closing_date: '2025-03-15',
    created_at: '2024-12-10T00:00:00Z',
    updated_at: '2024-12-10T00:00:00Z',
  },
  {
    id: '77777777-0001-0001-0001-000000000003',
    employer_id: 'eeeeeeee-0001-0001-0001-000000000002',
    title: 'Tax Associate - Corporate',
    description: 'Join our corporate tax team handling US corporate returns and compliance.',
    location_city: 'Bangalore',
    location_state: 'Karnataka',
    location_country: 'India',
    is_remote: true,
    job_type: 'full_time',
    experience_level: 'mid',
    experience_years_min: 2,
    experience_years_max: 5,
    salary_min: 600000,
    salary_max: 900000,
    salary_currency: 'INR',
    category: 'Corporate Tax',
    required_skills: ['1120', 'Tax Compliance', 'Excel'],
    responsibilities: ['Prepare corporate returns', 'Support senior team', 'Research'],
    benefits: ['Training provided', 'Health coverage', 'Annual bonus'],
    status: 'active',
    is_urgent: false,
    is_featured: false,
    applicant_count: 67,
    view_count: 489,
    posted_date: '2024-11-25T00:00:00Z',
    closing_date: '2025-01-31',
    created_at: '2024-11-25T00:00:00Z',
    updated_at: '2024-11-25T00:00:00Z',
  },
  {
    id: '77777777-0001-0001-0001-000000000004',
    employer_id: 'eeeeeeee-0001-0001-0001-000000000002',
    title: 'Private Equity Tax Specialist',
    description: 'Contract position for Private Equity tax specialist with complex deal structure experience.',
    location_city: 'Bangalore',
    location_state: 'Karnataka',
    location_country: 'India',
    is_remote: true,
    job_type: 'contract',
    experience_level: 'senior',
    experience_years_min: 6,
    experience_years_max: 10,
    salary_min: 1500000,
    salary_max: 2000000,
    salary_currency: 'INR',
    category: 'Private Equity',
    required_skills: ['PE Taxation', '1065', 'K-1'],
    responsibilities: ['PE tax compliance', 'Deal support', 'Client advisory'],
    benefits: ['High compensation', 'Flexible schedule', 'Remote work'],
    status: 'active',
    is_urgent: true,
    is_featured: true,
    applicant_count: 34,
    view_count: 234,
    posted_date: '2024-12-15T00:00:00Z',
    closing_date: '2025-03-31',
    created_at: '2024-12-15T00:00:00Z',
    updated_at: '2024-12-15T00:00:00Z',
  },
];

// =====================================================
// JOB APPLICATIONS DATA
// =====================================================
export const jobApplications: JobApplication[] = [
  {
    id: '88888888-0001-0001-0001-000000000001',
    job_id: '77777777-0001-0001-0001-000000000001',
    candidate_id: 'cccccccc-0002-0001-0001-000000000001',
    employer_id: 'eeeeeeee-0001-0001-0001-000000000001',
    cover_letter: 'I am excited to apply for the Senior Tax Analyst position. With 5 years of experience in 1040 preparation...',
    current_compensation: 750000,
    expected_compensation: 1000000,
    status: 'interview_scheduled',
    stage: 4,
    progress: 75,
    applied_at: '2024-12-10T00:00:00Z',
    updated_at: '2024-12-15T00:00:00Z',
  },
  {
    id: '88888888-0001-0001-0001-000000000002',
    job_id: '77777777-0001-0001-0001-000000000002',
    candidate_id: 'cccccccc-0002-0001-0001-000000000002',
    employer_id: 'eeeeeeee-0001-0001-0001-000000000001',
    cover_letter: 'As a specialist in partnership taxation with 7 years experience...',
    current_compensation: 1100000,
    expected_compensation: 1800000,
    status: 'shortlisted',
    stage: 3,
    progress: 60,
    applied_at: '2024-12-08T00:00:00Z',
    updated_at: '2024-12-12T00:00:00Z',
  },
  {
    id: '88888888-0001-0001-0001-000000000003',
    job_id: '77777777-0001-0001-0001-000000000003',
    candidate_id: 'cccccccc-0002-0001-0001-000000000005',
    employer_id: 'eeeeeeee-0001-0001-0001-000000000002',
    cover_letter: 'I am interested in the Tax Associate position at Deloitte...',
    current_compensation: 420000,
    expected_compensation: 700000,
    status: 'submitted',
    stage: 1,
    progress: 20,
    applied_at: '2024-12-15T00:00:00Z',
    updated_at: '2024-12-15T00:00:00Z',
  },
  {
    id: '88888888-0001-0001-0001-000000000004',
    job_id: '77777777-0001-0001-0001-000000000004',
    candidate_id: 'cccccccc-0002-0001-0001-000000000004',
    employer_id: 'eeeeeeee-0001-0001-0001-000000000002',
    cover_letter: 'With 9 years of private equity tax experience, I am the ideal candidate...',
    current_compensation: 1900000,
    expected_compensation: 2000000,
    status: 'reviewed',
    stage: 2,
    progress: 40,
    applied_at: '2024-12-12T00:00:00Z',
    updated_at: '2024-12-14T00:00:00Z',
  },
];

// =====================================================
// ASSESSMENTS DATA
// =====================================================
export const assessments: Assessment[] = [
  {
    id: '55555555-0001-0001-0001-000000000001',
    title: 'Form 1040 - Individual Income Tax',
    description: 'Comprehensive assessment covering individual tax returns, deductions, credits, and complex scenarios.',
    category: 'Individual Taxation',
    difficulty: 'advanced',
    duration_minutes: 45,
    passing_score: 70,
    question_count: 50,
    price: 299,
    skills_validated: ['1040', 'Deductions', 'Credits', 'Tax Planning'],
    status: 'active',
    total_attempts: 245,
    avg_score: 82.4,
    rating: 4.8,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '55555555-0001-0001-0001-000000000002',
    title: 'Form 1065 - Partnership Tax',
    description: 'Advanced assessment on partnership tax returns, K-1 allocations, and distributions.',
    category: 'Partnership Taxation',
    difficulty: 'advanced',
    duration_minutes: 60,
    passing_score: 70,
    question_count: 75,
    price: 399,
    skills_validated: ['1065', 'K-1', 'Distributions', 'Partnership'],
    status: 'active',
    total_attempts: 156,
    avg_score: 78.6,
    rating: 4.9,
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-02-10T00:00:00Z',
  },
  {
    id: '55555555-0001-0001-0001-000000000003',
    title: 'Form 1120 - Corporate Tax',
    description: 'Expert-level assessment on corporate tax returns and schedules.',
    category: 'Corporate Taxation',
    difficulty: 'expert',
    duration_minutes: 55,
    passing_score: 75,
    question_count: 65,
    price: 399,
    skills_validated: ['1120', 'Corporate Tax', 'Schedules'],
    status: 'active',
    total_attempts: 132,
    avg_score: 75.2,
    rating: 4.7,
    created_at: '2024-03-05T00:00:00Z',
    updated_at: '2024-03-05T00:00:00Z',
  },
  {
    id: '55555555-0001-0001-0001-000000000004',
    title: 'S Corporation Taxation',
    description: 'Specialized assessment on S Corp elections and pass-through taxation.',
    category: 'Corporate Taxation',
    difficulty: 'intermediate',
    duration_minutes: 40,
    passing_score: 65,
    question_count: 45,
    price: 299,
    skills_validated: ['S Corp', 'Pass-through', 'Elections'],
    status: 'active',
    total_attempts: 98,
    avg_score: 80.1,
    rating: 4.6,
    created_at: '2024-04-20T00:00:00Z',
    updated_at: '2024-04-20T00:00:00Z',
  },
];

// =====================================================
// CERTIFICATES DATA
// =====================================================
export const certificates: Certificate[] = [
  {
    id: '66666666-0001-0001-0001-000000000001',
    candidate_id: 'cccccccc-0002-0001-0001-000000000001',
    assessment_id: '55555555-0001-0001-0001-000000000001',
    credential_id: 'TT-1040-2024-001892',
    title: '1040 Individual Tax Returns - Expert Certification',
    score: 94,
    percentile: 92,
    level: 'expert',
    issue_date: '2024-10-05',
    expiry_date: '2026-10-05',
    skills_validated: ['Individual Tax', 'Deductions', 'Credits'],
    is_valid: true,
    created_at: '2024-10-05T00:00:00Z',
  },
  {
    id: '66666666-0001-0001-0001-000000000002',
    candidate_id: 'cccccccc-0002-0001-0001-000000000002',
    assessment_id: '55555555-0001-0001-0001-000000000002',
    credential_id: 'TT-1065-2024-000756',
    title: '1065 Partnership Returns - Expert Certification',
    score: 96,
    percentile: 95,
    level: 'expert',
    issue_date: '2024-09-15',
    expiry_date: '2026-09-15',
    skills_validated: ['Partnership Tax', 'K-1', 'Distributions'],
    is_valid: true,
    created_at: '2024-09-15T00:00:00Z',
  },
  {
    id: '66666666-0001-0001-0001-000000000003',
    candidate_id: 'cccccccc-0002-0001-0001-000000000004',
    assessment_id: '55555555-0001-0001-0001-000000000002',
    credential_id: 'TT-1065-2024-000412',
    title: '1065 Partnership Returns - Expert Certification',
    score: 98,
    percentile: 98,
    level: 'expert',
    issue_date: '2024-08-20',
    expiry_date: '2026-08-20',
    skills_validated: ['Partnership Tax', 'K-1', 'PE Taxation'],
    is_valid: true,
    created_at: '2024-08-20T00:00:00Z',
  },
  {
    id: '66666666-0001-0001-0001-000000000004',
    candidate_id: 'cccccccc-0002-0001-0001-000000000003',
    assessment_id: '55555555-0001-0001-0001-000000000004',
    credential_id: 'TT-SCORP-2024-000234',
    title: 'S Corporation Specialist Certification',
    score: 88,
    percentile: 85,
    level: 'specialist',
    issue_date: '2024-11-10',
    expiry_date: '2026-11-10',
    skills_validated: ['S Corp', 'Pass-through'],
    is_valid: true,
    created_at: '2024-11-10T00:00:00Z',
  },
];

// =====================================================
// NOTIFICATIONS DATA
// =====================================================
export const notifications: Notification[] = [
  {
    id: 'notif-001',
    user_id: 'cccccccc-0001-0001-0001-000000000001',
    type: 'interview',
    title: 'Interview Scheduled',
    message: 'Your interview with KPMG India has been scheduled for Dec 18, 2024',
    link: '/dashboard/status',
    is_read: false,
    created_at: '2024-12-15T10:00:00Z',
  },
  {
    id: 'notif-002',
    user_id: 'cccccccc-0001-0001-0001-000000000002',
    type: 'application',
    title: 'Application Shortlisted',
    message: 'Your application for Tax Manager at KPMG has been shortlisted',
    link: '/dashboard/status',
    is_read: false,
    created_at: '2024-12-12T14:00:00Z',
  },
  {
    id: 'notif-003',
    user_id: 'eeeeeeee-0002-0001-0001-000000000001',
    type: 'application',
    title: 'New Application',
    message: 'Priya Sharma applied for Senior Tax Analyst position',
    link: '/employer/applications',
    is_read: true,
    created_at: '2024-12-10T09:00:00Z',
  },
];

// =====================================================
// SKILLS MASTER DATA
// =====================================================
export const skillsMaster: SkillMaster[] = [
  { id: 'sm-001', name: '1040 Individual Returns', category: 'Tax Returns', is_predefined: true, usage_count: 12, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-002', name: '1065 Partnership Returns', category: 'Tax Returns', is_predefined: true, usage_count: 8, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-003', name: '1120 Corporate Returns', category: 'Tax Returns', is_predefined: true, usage_count: 6, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-004', name: '1120S S Corporation Returns', category: 'Tax Returns', is_predefined: true, usage_count: 4, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-005', name: '990 Non-Profit Returns', category: 'Tax Returns', is_predefined: true, usage_count: 2, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-006', name: 'Drake Software', category: 'Software', is_predefined: true, usage_count: 5, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-007', name: 'ProSeries', category: 'Software', is_predefined: true, usage_count: 3, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-008', name: 'Lacerte', category: 'Software', is_predefined: true, usage_count: 2, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-009', name: 'CCH Axcess', category: 'Software', is_predefined: true, usage_count: 4, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-010', name: 'UltraTax CS', category: 'Software', is_predefined: true, usage_count: 3, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-011', name: 'Tax Planning', category: 'Specialized', is_predefined: true, usage_count: 8, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-012', name: 'Tax Research', category: 'Specialized', is_predefined: true, usage_count: 5, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-013', name: 'Multi-State Tax Filing', category: 'Compliance', is_predefined: true, usage_count: 4, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-014', name: 'International Tax Compliance', category: 'Compliance', is_predefined: true, usage_count: 3, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-015', name: 'K-1 Reporting', category: 'Specialized', is_predefined: true, usage_count: 6, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-016', name: 'Private Equity Taxation', category: 'Specialized', is_predefined: true, usage_count: 2, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-017', name: 'FBAR Reporting', category: 'Compliance', is_predefined: true, usage_count: 2, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-018', name: 'IRS Regulations', category: 'Compliance', is_predefined: true, usage_count: 4, created_at: '2024-01-01T00:00:00Z' },
  { id: 'sm-019', name: 'ProConnect Tax', category: 'Software', is_predefined: true, usage_count: 2, created_at: '2024-01-01T00:00:00Z' },
];

// =====================================================
// DATABASE SERVICE CLASS
// =====================================================
export class LocalDatabase {
  // Users
  static getUsers() {
    return users;
  }

  static getUserById(id: string) {
    return users.find(u => u.id === id);
  }

  static getUserByEmail(email: string) {
    return users.find(u => u.email === email);
  }

  // Candidates
  static getCandidates() {
    return candidates;
  }

  static getCandidateById(id: string) {
    return candidates.find(c => c.id === id);
  }

  static getCandidateByUserId(userId: string) {
    return candidates.find(c => c.user_id === userId);
  }

  static getCandidateByLinkedInUrl(url: string) {
    const normalize = (raw: string) =>
      raw.toLowerCase()
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .replace(/\/+$/, '')
        .trim();
    const normalized = normalize(url);
    return candidates.find(c => c.linkedin_url && normalize(c.linkedin_url) === normalized) || null;
  }

  // Returns all profile sections needed for LinkedIn profile load
  static getLinkedInMappedProfile(candidateId: string): {
    name: string;
    title: string;
    location: string;
    summary: string;
    email: string;
    phone: string;
    website: string;
    skills: string[];
    certifications: string[];
    experience: Array<{ id: number; company: string; position: string; duration: string; location: string; description: string }>;
    education: Array<{ id: number; institution: string; degree: string; field: string; duration: string; description: string }>;
  } | null {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return null;
    const user = users.find(u => u.id === candidate.user_id);
    if (!user) return null;

    // Skills from candidateSkills table
    const skills = candidateSkills
      .filter(s => s.candidate_id === candidateId)
      .map(s => s.skill_name);

    // Certifications from certificates table
    const certs = certificates
      .filter(c => c.candidate_id === candidateId)
      .map(c => c.title);

    // Experience — seeded per candidate; falls back to derived entry
    const experienceMap: Record<string, Array<{ id: number; company: string; position: string; duration: string; location: string; description: string }>> = {
      'cccccccc-0002-0001-0001-000000000001': [
        { id: 1, company: 'Grant Thornton India', position: 'Senior Tax Analyst', duration: 'Jan 2022 - Present', location: 'Bangalore, Karnataka', description: 'Lead preparation and review of complex 1040 returns including self-employment income, capital gains, and multi-state filings for HNI clients.' },
        { id: 2, company: 'EY GDS', position: 'Tax Associate', duration: 'Jul 2019 - Dec 2021', location: 'Bangalore, Karnataka', description: 'Prepared individual tax returns (1040) for US clients. Achieved 99% accuracy on 600+ returns per season.' },
      ],
      'cccccccc-0002-0001-0001-000000000002': [
        { id: 1, company: 'KPMG India', position: 'Tax Consultant – Partnership & Corporate', duration: 'Mar 2021 - Present', location: 'Hyderabad, Telangana', description: 'Lead engagement teams on complex Form 1065 and 1120 returns. Specialize in K-1 allocations for private equity and real estate funds.' },
        { id: 2, company: 'RSM India', position: 'Tax Senior', duration: 'Jun 2017 - Feb 2021', location: 'Hyderabad, Telangana', description: 'Prepared partnership and corporate returns for mid-market US clients. Mentored junior staff and reviewed work products.' },
      ],
      'cccccccc-0002-0001-0001-000000000003': [
        { id: 1, company: 'Deloitte USI', position: 'Tax Associate – S Corporation', duration: 'Aug 2021 - Present', location: 'Pune, Maharashtra', description: 'Prepare and review 1120S returns for S-Corporation clients across various industries. Handle elections and shareholder basis calculations.' },
        { id: 2, company: 'BDO India', position: 'Junior Tax Analyst', duration: 'Jun 2020 - Jul 2021', location: 'Pune, Maharashtra', description: 'Assisted with preparation of corporate and individual tax returns under senior supervision.' },
      ],
      'cccccccc-0002-0001-0001-000000000004': [
        { id: 1, company: 'PwC India', position: 'Senior Tax Manager – Private Equity', duration: 'Jan 2019 - Present', location: 'Gurgaon, Haryana', description: 'Manage complex PE fund taxation including fund structuring, investor reporting, and UBTI analysis. Handle multi-jurisdictional filings.' },
        { id: 2, company: 'KPMG India', position: 'Tax Manager', duration: 'Apr 2015 - Dec 2018', location: 'Mumbai, Maharashtra', description: 'Managed portfolio of partnership returns for PE and VC fund clients. Led a team of 6 tax professionals.' },
      ],
      'cccccccc-0002-0001-0001-000000000005': [
        { id: 1, company: 'H&R Block India', position: 'Tax Analyst', duration: 'Sep 2022 - Present', location: 'Chennai, Tamil Nadu', description: 'Prepare individual (1040) and small business tax returns. Handle Schedule C, Schedule E, and state returns for US clients.' },
        { id: 2, company: 'Infosys BPM', position: 'Tax Processing Associate', duration: 'Jun 2021 - Aug 2022', location: 'Chennai, Tamil Nadu', description: 'Processed high-volume individual tax returns as part of a large-scale US tax outsourcing engagement.' },
      ],
      'cccccccc-0002-0001-0001-000000000006': [
        { id: 1, company: 'Deloitte USI', position: 'Tax Director – Corporate & International', duration: 'Feb 2017 - Present', location: 'Mumbai, Maharashtra', description: 'Direct and oversee corporate and international tax compliance for Fortune 500 US clients. Lead cross-border tax planning and BEPS compliance.' },
        { id: 2, company: 'EY GDS', position: 'Senior Manager – International Tax', duration: 'May 2012 - Jan 2017', location: 'Mumbai, Maharashtra', description: 'Managed international tax compliance including transfer pricing, FBAR, Form 5471, and PFIC filings.' },
      ],
      'cccccccc-0002-0001-0001-000000000007': [
        { id: 1, company: 'BDO India', position: 'Tax Specialist – 1065 & K-1', duration: 'Apr 2019 - Present', location: 'Noida, Uttar Pradesh', description: 'Specialize in operating partnership returns and complex special allocations. Prepare and review Form 1065 and associated K-1 packages.' },
        { id: 2, company: 'Grant Thornton India', position: 'Tax Associate', duration: 'Jul 2018 - Mar 2019', location: 'Delhi, India', description: 'Supported senior staff on partnership and corporate tax engagements.' },
      ],
      'cccccccc-0002-0001-0001-000000000008': [
        { id: 1, company: 'RSM India', position: 'Senior Tax Analyst – Multi-State', duration: 'Jan 2020 - Present', location: 'Kochi, Kerala', description: 'Specialize in multi-state income tax compliance, nexus studies, and apportionment analysis for US clients expanding across states.' },
        { id: 2, company: 'Wipro Technologies', position: 'Tax Associate', duration: 'Aug 2019 - Dec 2019', location: 'Kochi, Kerala', description: 'Assisted with state and local tax compliance for US corporate clients.' },
      ],
      'cccccccc-0002-0001-0001-000000000009': [
        { id: 1, company: 'PwC India', position: 'Tax Consultant – HNI Individual', duration: 'Oct 2018 - Present', location: 'Delhi', description: 'Manage individual tax compliance and planning for high-net-worth US clients with complex investment portfolios, trusts, and estate considerations.' },
        { id: 2, company: 'KPMG India', position: 'Tax Senior', duration: 'Jun 2016 - Sep 2018', location: 'Delhi', description: 'Prepared 1040 returns for HNI clients with significant investment income, rental properties, and foreign assets.' },
      ],
      'cccccccc-0002-0001-0001-000000000010': [
        { id: 1, company: 'EY GDS', position: 'Tax Manager – Corporate Compliance', duration: 'Jun 2018 - Present', location: 'Ahmedabad, Gujarat', description: 'Manage corporate tax compliance engagements including 1120, multi-state returns, and tax provision (ASC 740) work.' },
        { id: 2, company: 'Deloitte USI', position: 'Tax Analyst', duration: 'Jul 2017 - May 2018', location: 'Ahmedabad, Gujarat', description: 'Assisted with corporate and international tax compliance projects.' },
      ],
    };

    const educationMap: Record<string, Array<{ id: number; institution: string; degree: string; field: string; duration: string; description: string }>> = {
      'cccccccc-0002-0001-0001-000000000001': [
        { id: 1, institution: 'Christ University', degree: 'Master of Commerce (M.Com)', field: 'Taxation & Finance', duration: '2017 - 2019', description: 'Specialized in direct taxation and international tax laws. Graduated with distinction.' },
        { id: 2, institution: 'Bangalore University', degree: 'Bachelor of Commerce (B.Com)', field: 'Accounting', duration: '2014 - 2017', description: 'Core studies in financial accounting, cost accounting, and business law.' },
      ],
      'cccccccc-0002-0001-0001-000000000002': [
        { id: 1, institution: 'Osmania University', degree: 'Master of Business Administration (MBA)', field: 'Finance & Taxation', duration: '2015 - 2017', description: 'Focused on corporate finance and taxation. Top 5% of class.' },
        { id: 2, institution: 'Hyderabad University', degree: 'Bachelor of Commerce (B.Com)', field: 'Accounting & Finance', duration: '2012 - 2015', description: 'Foundation in accounting, auditing, and business taxation.' },
      ],
      'cccccccc-0002-0001-0001-000000000003': [
        { id: 1, institution: 'University of Pune', degree: 'Master of Commerce (M.Com)', field: 'Advanced Accounting', duration: '2018 - 2020', description: 'Specialization in corporate accounting and indirect taxation.' },
        { id: 2, institution: 'Fergusson College', degree: 'Bachelor of Commerce (B.Com)', field: 'Accounting', duration: '2015 - 2018', description: 'Accounting fundamentals and business law.' },
      ],
      'cccccccc-0002-0001-0001-000000000004': [
        { id: 1, institution: 'IIM Ahmedabad', degree: 'Post Graduate Programme in Management (PGPM)', field: 'Finance', duration: '2013 - 2015', description: 'Specialization in corporate finance and investment management.' },
        { id: 2, institution: 'Delhi University', degree: 'Bachelor of Commerce (B.Com) Hons.', field: 'Finance & Taxation', duration: '2010 - 2013', description: 'Honours in Finance. Merit scholar.' },
      ],
      'cccccccc-0002-0001-0001-000000000005': [
        { id: 1, institution: 'Madras University', degree: 'Master of Commerce (M.Com)', field: 'Taxation', duration: '2019 - 2021', description: 'Taxation specialization with focus on direct and indirect taxes.' },
        { id: 2, institution: 'Loyola College', degree: 'Bachelor of Commerce (B.Com)', field: 'Accounting', duration: '2016 - 2019', description: 'Core commerce and accounting studies.' },
      ],
      'cccccccc-0002-0001-0001-000000000006': [
        { id: 1, institution: 'ICAI', degree: 'Chartered Accountant (CA)', field: 'Taxation & Audit', duration: '2008 - 2012', description: 'Qualified CA with specialization in international taxation and audit.' },
        { id: 2, institution: 'Sydenham College', degree: 'Bachelor of Commerce (B.Com)', field: 'Accounting & Finance', duration: '2005 - 2008', description: 'Commerce fundamentals and financial analysis.' },
      ],
      'cccccccc-0002-0001-0001-000000000007': [
        { id: 1, institution: 'Amity University', degree: 'Master of Business Administration (MBA)', field: 'Finance', duration: '2016 - 2018', description: 'Finance major with taxation electives.' },
        { id: 2, institution: 'Amity University', degree: 'Bachelor of Commerce (B.Com)', field: 'Accounting', duration: '2013 - 2016', description: 'Accounting and business studies.' },
      ],
      'cccccccc-0002-0001-0001-000000000008': [
        { id: 1, institution: 'Kerala University', degree: 'Master of Commerce (M.Com)', field: 'Taxation', duration: '2017 - 2019', description: 'Taxation and financial reporting specialization.' },
        { id: 2, institution: 'MG University', degree: 'Bachelor of Commerce (B.Com)', field: 'Finance', duration: '2014 - 2017', description: 'Finance and accounting fundamentals.' },
      ],
      'cccccccc-0002-0001-0001-000000000009': [
        { id: 1, institution: 'Delhi School of Economics', degree: 'Master of Commerce (M.Com)', field: 'Finance & Taxation', duration: '2014 - 2016', description: 'Advanced taxation and investment management.' },
        { id: 2, institution: 'Hindu College', degree: 'Bachelor of Commerce (B.Com) Hons.', field: 'Finance', duration: '2011 - 2014', description: 'Finance honours. University gold medallist.' },
      ],
      'cccccccc-0002-0001-0001-000000000010': [
        { id: 1, institution: 'Gujarat University', degree: 'Master of Commerce (M.Com)', field: 'Taxation', duration: '2015 - 2017', description: 'Direct tax laws and corporate compliance specialization.' },
        { id: 2, institution: 'HL College of Commerce', degree: 'Bachelor of Commerce (B.Com)', field: 'Accounting', duration: '2012 - 2015', description: 'Accounting and auditing studies.' },
      ],
    };

    const expYrs = candidate.experience_years ?? 3;
    const defaultExp = [
      {
        id: 1,
        company: 'Tax Consulting Firm',
        position: candidate.headline || 'Tax Professional',
        duration: `Jan ${new Date().getFullYear() - expYrs} - Present`,
        location: [candidate.location_city, candidate.location_state].filter(Boolean).join(', '),
        description: candidate.summary || '',
      },
    ];
    const defaultEdu = [
      {
        id: 1,
        institution: 'University',
        degree: 'Bachelor of Commerce (B.Com)',
        field: 'Accounting & Finance',
        duration: `${new Date().getFullYear() - expYrs - 4} - ${new Date().getFullYear() - expYrs}`,
        description: '',
      },
    ];

    return {
      name: user.name,
      title: candidate.headline || '',
      location: [candidate.location_city, candidate.location_state, candidate.location_country].filter(Boolean).join(', '),
      summary: candidate.summary || '',
      email: user.email,
      phone: user.phone || '',
      website: candidate.linkedin_url || '',
      skills,
      certifications: certs,
      experience: experienceMap[candidateId] ?? defaultExp,
      education: educationMap[candidateId] ?? defaultEdu,
    };
  }

  static getCandidateProfile(candidateId: string): CandidateProfile | null {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return null;

    const user = users.find(u => u.id === candidate.user_id);
    if (!user) return null;

    return {
      ...candidate,
      user,
      skills: candidateSkills.filter(s => s.candidate_id === candidateId),
      experience: [], // Add experience data
      education: [], // Add education data
      competencies: [], // Add competencies data
      responsibilities: [], // Add responsibilities data
      certificates: certificates.filter(c => c.candidate_id === candidateId),
    };
  }

  // Employers
  static getEmployers() {
    return employers;
  }

  static getEmployerById(id: string) {
    return employers.find(e => e.id === id);
  }

  static getEmployerUsers(employerId: string) {
    return employerUsers.filter(eu => eu.employer_id === employerId);
  }

  // Jobs
  static getJobs() {
    return jobs;
  }

  static getJobById(id: string) {
    return jobs.find(j => j.id === id);
  }

  static getJobsByEmployer(employerId: string) {
    return jobs.filter(j => j.employer_id === employerId);
  }

  static getJobWithEmployer(jobId: string): JobWithEmployer | null {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return null;

    const employer = employers.find(e => e.id === job.employer_id);
    if (!employer) return null;

    return { ...job, employer };
  }

  // Applications
  static getApplications() {
    return jobApplications;
  }

  static getApplicationsByCandidate(candidateId: string) {
    return jobApplications.filter(a => a.candidate_id === candidateId);
  }

  static getApplicationsByJob(jobId: string) {
    return jobApplications.filter(a => a.job_id === jobId);
  }

  static getApplicationsByEmployer(employerId: string) {
    return jobApplications.filter(a => a.employer_id === employerId);
  }

  // Assessments
  static getAssessments() {
    return assessments;
  }

  static getAssessmentById(id: string) {
    return assessments.find(a => a.id === id);
  }

  // Certificates
  static getCertificates() {
    return certificates;
  }

  static getCertificatesByCandidate(candidateId: string) {
    return certificates.filter(c => c.candidate_id === candidateId);
  }

  // Notifications
  static getNotifications() {
    return notifications;
  }

  static getNotificationsByUser(userId: string) {
    return notifications.filter(n => n.user_id === userId);
  }

  static getUnreadNotifications(userId: string) {
    return notifications.filter(n => n.user_id === userId && !n.is_read);
  }

  // Skills Master
  static getSkillsMaster() {
    return skillsMaster;
  }

  // Admin
  static getAdminUsers() {
    return adminUsers;
  }

  static addEmployer(data: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    location: string;
    industry: string;
    size: string;
    website: string;
  }): Employer {
    const now = new Date().toISOString();
    const [city, state] = data.location.split(',').map(s => s.trim());
    const newEmployer: Employer = {
      id: `emp-${Date.now()}`,
      company_name: data.companyName,
      website: data.website || undefined,
      industry: data.industry || undefined,
      company_size: data.size || undefined,
      headquarters_city: city || undefined,
      headquarters_state: state || undefined,
      headquarters_country: 'India',
      status: 'pending',
      subscription_plan: 'basic',
      monthly_budget: 0,
      total_hires: 0,
      created_at: now,
      updated_at: now,
      last_active: now,
    };
    employers.push(newEmployer);
    // Also add a user record for the contact person
    if (data.email) {
      users.push({
        id: `emp-user-${Date.now()}`,
        email: data.email,
        name: data.contactPerson || data.companyName,
        phone: data.phone || undefined,
        role: 'employer_user',
        status: 'active',
        email_verified: false,
        created_at: now,
        updated_at: now,
      } as any);
    }
    return newEmployer;
  }

  static addJob(data: {
    title: string;
    employerId: string;
    location: string;
    jobType: string;
    experienceLevel: string;
    category: string;
    salaryMin: number;
    salaryMax: number;
    description: string;
    requirements: string[];
    responsibilities: string[];
    benefits: string[];
    closingDate: string;
  }): Job {
    const now = new Date().toISOString();
    const [city, state] = data.location.split(',').map(s => s.trim());
    const jobTypeMap: Record<string, string> = {
      'full-time': 'full_time',
      'part-time': 'part_time',
      'contract': 'contract',
      'freelance': 'freelance',
      'internship': 'internship',
    };
    const newJob: Job = {
      id: `job-${Date.now()}`,
      employer_id: data.employerId,
      title: data.title,
      description: data.description || undefined,
      location_city: city || undefined,
      location_state: state || undefined,
      location_country: 'India',
      is_remote: false,
      job_type: (jobTypeMap[data.jobType] || data.jobType) as any,
      experience_level: (data.experienceLevel as any) || 'mid',
      experience_years_min: 0,
      salary_min: data.salaryMin || undefined,
      salary_max: data.salaryMax || undefined,
      salary_currency: 'INR',
      category: data.category || undefined,
      requirements: data.requirements,
      responsibilities: data.responsibilities,
      benefits: data.benefits,
      status: 'active',
      is_urgent: false,
      is_featured: false,
      applicant_count: 0,
      view_count: 0,
      posted_date: now,
      closing_date: data.closingDate || undefined,
      created_at: now,
      updated_at: now,
    };
    jobs.push(newJob);
    return newJob;
  }

  static addAdminUser(data: {
    name: string;
    email: string;
    phone: string;
    role: 'admin' | 'manager' | 'viewer';
  }): AdminUser {
    const now = new Date().toISOString();
    const userId = `admin-${Date.now()}`;
    users.push({
      id: userId,
      email: data.email,
      name: data.name,
      phone: data.phone || undefined,
      role: 'admin',
      status: 'active',
      email_verified: false,
      created_at: now,
      updated_at: now,
    } as any);
    const newAdmin: AdminUser = {
      id: userId,
      user_id: userId,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      role: data.role as any,
      permissions: [],
      status: 'active',
      created_at: now,
      updated_at: now,
      last_login: now,
    } as any;
    adminUsers.push(newAdmin);
    return newAdmin;
  }

  // Import a candidate from a parsed resume form
  static addImportedCandidate(form: {
    name: string;
    email: string;
    phone: string;
    linkedinUrl: string;
    locationCity: string;
    locationState: string;
    locationCountry: string;
    headline: string;
    summary: string;
    skills: string[];
    availability: string;
    workMode: string;
    experienceYears: number;
    hourlyRate: number;
    expectedSalaryMin: number;
    expectedSalaryMax: number;
  }): { userId: string; candidateId: string } {
    if (!form.email) throw new Error('Email is required');
    if (users.find((u) => u.email === form.email)) {
      throw new Error(`A user with email "${form.email}" already exists`);
    }

    const now = new Date().toISOString();
    const userId = `cccccccc-import-${Date.now()}`;
    const candidateId = `cccccccc-import-${Date.now()}-c`;

    users.push({
      id: userId,
      email: form.email,
      name: form.name || 'Unknown',
      phone: form.phone || undefined,
      role: 'candidate',
      status: 'active',
      email_verified: false,
      phone_verified: false,
      created_at: now,
      updated_at: now,
    } as any);

    candidates.push({
      id: candidateId,
      user_id: userId,
      headline: form.headline || undefined,
      summary: form.summary || undefined,
      location_city: form.locationCity || undefined,
      location_state: form.locationState || undefined,
      location_country: form.locationCountry || 'Unknown',
      experience_years: form.experienceYears || 0,
      availability: (form.availability as any) || 'immediate',
      work_mode: (form.workMode as any) || 'remote',
      expected_salary_min: form.expectedSalaryMin || undefined,
      expected_salary_max: form.expectedSalaryMax || undefined,
      hourly_rate: form.hourlyRate || undefined,
      linkedin_url: form.linkedinUrl || undefined,
      profile_completeness: 50,
      status: 'pending',
      is_featured: false,
      profile_views: 0,
      rating: 0,
      created_at: now,
      updated_at: now,
    });

    for (const skill of form.skills) {
      candidateSkills.push({
        id: `skill-import-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        candidate_id: candidateId,
        skill_name: skill,
        proficiency: 'intermediate',
        is_verified: false,
        years_experience: 0,
        created_at: now,
      });
    }

    return { userId, candidateId };
  }

  // Stats
  static getStats() {
    return {
      totalCandidates: candidates.length,
      approvedCandidates: candidates.filter(c => c.status === 'approved').length,
      pendingCandidates: candidates.filter(c => c.status === 'pending').length,
      totalEmployers: employers.length,
      activeEmployers: employers.filter(e => e.status === 'active').length,
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.status === 'active').length,
      totalApplications: jobApplications.length,
      totalAssessments: assessments.length,
      totalCertificates: certificates.length,
      totalAdmins: adminUsers.length,
    };
  }

  static updateCandidateStatus(candidateId: string, status: 'approved' | 'rejected' | 'pending') {
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
      candidate.status = status;
      candidate.updated_at = new Date().toISOString();
    }
  }

  static updateCandidateInfo(candidateId: string, updates: {
    name?: string;
    phone?: string;
    location_city?: string;
    location_state?: string;
    experience_years?: number;
    headline?: string;
    availability?: string;
    work_mode?: string;
    hourly_rate?: number;
  }) {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;
    if (updates.location_city !== undefined) candidate.location_city = updates.location_city;
    if (updates.location_state !== undefined) candidate.location_state = updates.location_state;
    if (updates.experience_years !== undefined) candidate.experience_years = updates.experience_years;
    if (updates.headline !== undefined) candidate.headline = updates.headline;
    if (updates.availability !== undefined) candidate.availability = updates.availability as any;
    if (updates.work_mode !== undefined) candidate.work_mode = updates.work_mode as any;
    if (updates.hourly_rate !== undefined) candidate.hourly_rate = updates.hourly_rate;
    candidate.updated_at = new Date().toISOString();

    // Update user name/phone if provided
    const user = users.find(u => u.id === candidate.user_id);
    if (user) {
      if (updates.name !== undefined) user.name = updates.name;
      if (updates.phone !== undefined) user.phone = updates.phone;
    }
  }
}

export default LocalDatabase;
