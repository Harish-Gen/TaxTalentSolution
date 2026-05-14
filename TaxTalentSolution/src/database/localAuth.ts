// =====================================================
// Tax Talent Solution — Local Demo Credentials
// FOR DEVELOPMENT / DEMO USE ONLY
// Never store real passwords in client-side code.
// =====================================================

export type LocalUserRole = 'candidate' | 'employer_user' | 'admin';

export interface LocalCredential {
  id: string;
  loginId: string;       // email used as login ID
  password: string;      // demo password
  name: string;
  role: LocalUserRole;
  company?: string;
  description: string;   // shown in the demo panel
}

// =====================================================
// 5 SAMPLE LOGINS
// =====================================================
export const localCredentials: LocalCredential[] = [
  {
    // Must match localDb users: id 'aaaaaaaa-0001-0001-0001-000000000001'
    id: 'aaaaaaaa-0001-0001-0001-000000000001',
    loginId: 'admin@taxtalentsolution.com',
    password: 'Admin@2025',
    name: 'Rajesh Kumar',
    role: 'admin',
    description: 'Platform Administrator — full system access',
  },
  {
    // Must match localDb users: id 'eeeeeeee-0002-0001-0001-000000000001'
    id: 'eeeeeeee-0002-0001-0001-000000000001',
    loginId: 'recruiter1@kpmg.com',
    password: 'KPMG@2025',
    name: 'Anita Sharma',
    role: 'employer_user',
    company: 'KPMG India',
    description: 'Employer (KPMG) — post jobs & search talent',
  },
  {
    // Must match localDb users: id 'eeeeeeee-0002-0001-0001-000000000002'
    id: 'eeeeeeee-0002-0001-0001-000000000002',
    loginId: 'hr1@deloitte.com',
    password: 'Deloitte@2025',
    name: 'Sneha Patel',
    role: 'employer_user',
    company: 'Deloitte India',
    description: 'Employer (Deloitte) — post jobs & search talent',
  },
  {
    // Must match localDb users: id 'cccccccc-0001-0001-0001-000000000001'
    id: 'cccccccc-0001-0001-0001-000000000001',
    loginId: 'priya.sharma@email.com',
    password: 'Priya@2025',
    name: 'Priya Sharma',
    role: 'candidate',
    description: 'Candidate — Senior Tax Analyst (1040 / 1065)',
  },
  {
    // Must match localDb users: id 'cccccccc-0001-0001-0001-000000000002'
    id: 'cccccccc-0001-0001-0001-000000000002',
    loginId: 'rahul.kumar@email.com',
    password: 'Rahul@2025',
    name: 'Rahul Kumar',
    role: 'candidate',
    description: 'Candidate — Tax Manager (S-Corp / Partnership)',
  },
];

// =====================================================
// VALIDATION
// =====================================================
export function validateLocalLogin(
  loginId: string,
  password: string
): LocalCredential | null {
  const match = localCredentials.find(
    (c) =>
      c.loginId.toLowerCase() === loginId.toLowerCase() &&
      c.password === password
  );
  return match ?? null;
}

// Build a mock Supabase-like user object for App.tsx compatibility
export function buildMockUser(credential: LocalCredential) {
  return {
    id: credential.id,
    email: credential.loginId,
    user_metadata: {
      name: credential.name,
      role: credential.role === 'employer_user' ? 'employer' : credential.role,
      company: credential.company ?? undefined,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
