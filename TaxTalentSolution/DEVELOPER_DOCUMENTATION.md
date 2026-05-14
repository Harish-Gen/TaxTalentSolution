# Tax Talent Solution — Developer Documentation

> **Last Updated:** April 30, 2026  
> **Version:** 0.1.0  
> **Purpose:** Complete technical reference for developers to understand, maintain, and extend this application.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Application Architecture](#4-application-architecture)
5. [Routing & View System](#5-routing--view-system)
6. [Authentication System](#6-authentication-system)
7. [Database Layer](#7-database-layer)
8. [Data Persistence (localStorage)](#8-data-persistence-localstorage)
9. [Landing Page](#9-landing-page)
10. [Candidate Dashboard](#10-candidate-dashboard)
11. [Employer Portal](#11-employer-portal)
12. [Admin Portal](#12-admin-portal)
13. [Pricing & Payment Flow](#13-pricing--payment-flow)
14. [UI Component Library](#14-ui-component-library)
15. [Build & Development](#15-build--development)
16. [Key Data Flow Diagrams](#16-key-data-flow-diagrams)
17. [Known Limitations & Future Work](#17-known-limitations--future-work)
18. [Demo Credentials](#18-demo-credentials)

---

## 1. Project Overview

**Tax Talent Solution** is a full-stack-like single-page React application (SPA) that serves as a niche talent marketplace for **US Tax Professionals based in India**. It connects three types of users:

| User Type | Purpose |
|---|---|
| **Candidate (Tax Professional)** | Create profile, take skill assessments, browse jobs, track applications |
| **Employer (Recruiter/Company)** | Search verified candidates, post jobs, manage hiring pipeline |
| **Admin (Platform Staff)** | Manage all users, candidates, employers, jobs, and assessments |

The application currently runs **entirely on the frontend** using in-memory seed data and `localStorage` for persistence. The Supabase and Azure AD B2C integrations exist in code but are configured to fall back to local authentication. This makes the app fully functional for demos and development without a live backend.

---

## 2. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | React | 18.3.1 |
| **Language** | TypeScript | Latest |
| **Build Tool** | Vite (with `@vitejs/plugin-react-swc`) | Latest |
| **Styling** | Tailwind CSS | Latest |
| **UI Components** | shadcn/ui (Radix UI primitives) | Various |
| **Icons** | lucide-react | 0.487.0 |
| **Charts** | Recharts | 2.15.2 |
| **Forms** | react-hook-form | 7.55.0 |
| **Toasts/Notifications** | Sonner | 2.0.3 |
| **PDF Parsing** | pdfjs-dist | 5.7.284 |
| **PDF Generation** | jspdf + jspdf-autotable | Latest |
| **Backend (planned)** | Supabase | `@supabase/supabase-js` |
| **Auth (planned)** | Azure AD B2C | `@azure/msal-browser` 5.9.0 |
| **Carousel** | embla-carousel-react | 8.6.0 |
| **Date Picker** | react-day-picker | 8.10.1 |
| **Server (planned)** | Hono (edge runtime) | Latest |

### Build Output
- Output directory: `build/`
- Target: `esnext`
- Dev server port: `3000`

---

## 3. Project Structure

```
TaxTalentSolution/
├── index.html                  # HTML shell — mounts <div id="root">
├── vite.config.ts              # Vite config: aliases, build output, dev server
├── package.json                # Dependencies and scripts
├── public/
│   └── images/                 # Static assets (logo, hero images)
└── src/
    ├── main.tsx                # React entry point — renders <App />
    ├── App.tsx                 # Root component — view router + auth state
    ├── index.css               # Base CSS
    ├── styles/
    │   └── globals.css         # Tailwind + CSS variable theme overrides
    ├── database/
    │   ├── types.ts            # All TypeScript interface definitions for DB tables
    │   ├── localDb.ts          # In-memory seed data + LocalDatabase class
    │   ├── hooks.ts            # React hooks (useUsers, useCandidates, etc.)
    │   ├── index.ts            # Re-exports all hooks and data
    │   ├── localAuth.ts        # Demo login credentials (5 hardcoded accounts)
    │   ├── userStore.ts        # localStorage-backed user registration & auth
    │   ├── profileStore.ts     # localStorage-backed candidate profile persistence
    │   └── schema.sql          # (Reference only) Full SQL schema for production DB
    ├── utils/
    │   ├── supabase/
    │   │   ├── client.tsx      # Supabase client singleton
    │   │   └── info.tsx        # Supabase project ID + anon key
    │   ├── b2c/
    │   │   └── authService.ts  # Azure AD B2C MSAL helper functions
    │   └── resumeParser.ts     # PDF resume parsing logic (LinkedIn PDF format)
    ├── components/
    │   ├── Header.tsx          # Landing page sticky top navigation bar
    │   ├── Hero.tsx            # Landing page hero section
    │   ├── Features.tsx        # Landing page features grid
    │   ├── HowItWorks.tsx      # Landing page step-by-step explainer
    │   ├── Pricing.tsx         # Pricing plans display
    │   ├── Testimonials.tsx    # Testimonials carousel
    │   ├── Articles.tsx        # Blog/articles section
    │   ├── Footer.tsx          # Site footer with links
    │   ├── LoginPage.tsx       # Login + Signup form
    │   ├── Dashboard.tsx       # Candidate dashboard shell + sidebar nav
    │   ├── EmployerPortal.tsx  # Employer portal shell + sidebar nav
    │   ├── AdminPortal.tsx     # Admin portal shell + sidebar nav
    │   ├── PaymentModal.tsx    # Subscription payment overlay
    │   ├── EmployerInfo.tsx    # Employer-facing marketing page
    │   ├── PrivacyPolicy.tsx   # Privacy policy page
    │   ├── TermsOfService.tsx  # Terms of service page
    │   ├── About.tsx           # About page
    │   ├── CookieConsent.tsx   # Cookie consent banner
    │   ├── dashboard/          # All candidate dashboard sub-views
    │   │   ├── ProfilePage.tsx
    │   │   ├── Competencies.tsx
    │   │   ├── BestMatches.tsx
    │   │   ├── AssessmentCertificates.tsx
    │   │   ├── Assessment1040.tsx
    │   │   ├── Certificate1040.tsx
    │   │   ├── Jobs.tsx
    │   │   ├── JobDetails.tsx
    │   │   ├── JobsSimple.tsx
    │   │   ├── JobApplication.tsx
    │   │   ├── StatusTracker.tsx
    │   │   ├── SalaryInsights.tsx
    │   │   └── InterviewFeedback.tsx
    │   ├── employer/           # All employer portal sub-views
    │   │   ├── EmployerDashboard.tsx
    │   │   ├── TalentSearch.tsx
    │   │   └── CandidateProfileView.tsx
    │   ├── admin/              # All admin portal sub-views
    │   │   ├── AdminDashboard.tsx
    │   │   ├── CandidateManagement.tsx
    │   │   ├── AssessmentManagement.tsx
    │   │   ├── EmployerManagement.tsx
    │   │   ├── JobManagement.tsx
    │   │   ├── UserManagement.tsx
    │   │   └── ResumeImport.tsx
    │   ├── figma/
    │   │   └── ImageWithFallback.tsx
    │   └── ui/                 # shadcn/ui component library (40+ components)
    └── guidelines/
        └── Guidelines.md       # Design/UX guidelines
```

---

## 4. Application Architecture

### Core Design Pattern

The application uses a **flat view-state router** inside `App.tsx`. There is **no React Router**. Navigation is managed entirely through a single `currentView` state variable of type `View`.

```typescript
type View = "landing" | "login" | "dashboard" | "employer-portal" | 
            "admin-portal" | "employer-info" | "privacy-policy" | 
            "terms-of-service" | "about";
```

The `App` component conditionally renders an entirely different component tree based on this state. Each portal (Dashboard, EmployerPortal, AdminPortal) has its own internal `activeSection` state for sub-navigation.

### State Management

There is **no global state library** (no Redux, Zustand, etc.). State flows in two ways:

1. **Top-down via props**: `App.tsx` passes `user` and `onLogout` down to each portal.
2. **localStorage** for cross-session persistence: profiles, competencies, and registered accounts.

### Data Layer

All data is served from **in-memory JavaScript arrays** defined in `src/database/localDb.ts`. React hooks in `src/database/hooks.ts` wrap these arrays with simulated 100ms async delays to mimic real API calls. On startup, any localStorage-registered users are merged into these arrays via `initializeFromStorage()`.

---

## 5. Routing & View System

### Top-Level Views (App.tsx)

| View Value | Renders | Triggered By |
|---|---|---|
| `"landing"` | Full marketing landing page | Default / after logout |
| `"login"` | `<LoginPage>` | Any "Login" / "Sign Up" button |
| `"dashboard"` | `<Dashboard>` | After candidate login |
| `"employer-portal"` | `<EmployerPortal>` | After employer login |
| `"admin-portal"` | `<AdminPortal>` | After admin login |
| `"employer-info"` | `<EmployerInfo>` | "For Employers" button on hero |
| `"privacy-policy"` | `<PrivacyPolicy>` | Footer link |
| `"terms-of-service"` | `<TermsOfService>` | Footer link |
| `"about"` | `<About>` | Header "About" link |

### Candidate Dashboard Sections (Dashboard.tsx)

The `Dashboard` component manages its own `activeSection: DashboardSection` state.

| Section ID | Component | Description |
|---|---|---|
| `"profile"` | `<ProfilePage>` | Edit personal/professional profile |
| `"competencies"` | `<Competencies>` | Tax skill self-ratings + role distribution |
| `"assessments"` | `<AssessmentCertificates>` | Take assessments, view certificates |
| `"salary"` | `<SalaryInsights>` | Market salary data by role/location |
| `"matches"` | `<BestMatches>` | AI-matched job recommendations |
| `"jobs"` | `<Jobs>` | Browse and search all active jobs |
| `"status"` | `<StatusTracker>` | Track application statuses |
| `"interview-feedback"` | `<InterviewFeedback>` | View received interview feedback |
| `"job-application"` | `<JobApplication>` | Job application form (transient) |
| `"job-details"` | `<JobDetails>` | Full job detail view (transient) |

### Employer Portal Sections (EmployerPortal.tsx)

| Section ID | Component | Description |
|---|---|---|
| `"dashboard"` | `<EmployerDashboard>` | Stats + recent activity |
| `"talent-search"` | `<TalentSearch>` | Filter and search approved candidates |
| `"candidate-profile"` | `<CandidateProfileView>` | Full profile of a selected candidate |
| `"interviews"` | *(placeholder)* | Coming soon |
| `"settings"` | *(placeholder)* | Coming soon |

### Admin Portal Sections (AdminPortal.tsx)

| Section ID | Component | Description |
|---|---|---|
| `"dashboard"` | `<AdminDashboard>` | Platform-wide stats + charts |
| `"candidate-management"` | `<CandidateManagement>` | Approve/reject/edit candidates |
| `"assessment-management"` | `<AssessmentManagement>` | CRUD for assessments and questions |
| `"employer-management"` | `<EmployerManagement>` | Manage employer accounts |
| `"job-management"` | `<JobManagement>` | Manage all job postings |
| `"user-management"` | `<UserManagement>` | Manage admin/manager user accounts |
| `"resume-import"` | `<ResumeImport>` | Import candidates via LinkedIn PDF upload |
| `"settings"` | *(placeholder)* | Coming soon |

---

## 6. Authentication System

The app has a **three-tier authentication** system, falling through layers in order:

```
User submits credentials
        │
        ▼
1. Demo credentials check (localAuth.ts)
   → Exact match against 5 hardcoded email/password pairs
        │ No match
        ▼
2. localStorage-registered accounts (userStore.ts)
   → SHA-256 hash comparison against stored accounts
        │ No match
        ▼
3. Supabase Auth (cloud, currently not connected)
   → supabase.auth.signInWithPassword(...)
```

### Layer 1 — Demo Credentials (`src/database/localAuth.ts`)

Five hardcoded accounts for immediate demo access. Passwords are stored in **plaintext** in the source code (intentionally, for demo only).

```
admin@taxtalentsolution.com  /  Admin@2025       → Admin role
recruiter1@kpmg.com          /  KPMG@2025        → Employer (KPMG)
hr1@deloitte.com             /  Deloitte@2025    → Employer (Deloitte)
priya.sharma@email.com       /  Priya@2025       → Candidate
rahul.kumar@email.com        /  Rahul@2025       → Candidate
```

`validateLocalLogin(loginId, password)` performs a case-insensitive email match + exact password match and returns a `LocalCredential` object. `buildMockUser(credential)` converts it into a Supabase-compatible user shape.

### Layer 2 — Registered Accounts (`src/database/userStore.ts`)

User registrations persist across browser sessions via `localStorage` key `tts_user_accounts`.

**Registration Flow (`registerUser`):**
1. Validate email format (regex) and minimum password length (8 chars).
2. Check for email conflicts in demo credentials and stored accounts.
3. Generate a unique user ID: `usr-{Date.now().toString(36)}-{random6}`.
4. Hash the password: `SHA-256(password + "tts_local_salt_2025")` via Web Crypto API.
5. Save the `StoredUser` object to `localStorage`.
6. Push a matching record into the in-memory `users[]` array (`localDb.ts`).
7. If role is `"candidate"`, create a skeleton `Candidate` record with ID `cnd-{userId}` and push into `candidates[]`.

**Login Flow (`authenticateStoredUser`):**
1. Find user by email in localStorage.
2. Check `status !== 'suspended'`.
3. Hash the provided password and compare against stored hash.
4. Return `StoredUser` or `null`.

**Session Object (`buildUserFromStored`):**
Converts a `StoredUser` into the same shape as a Supabase session user:
```typescript
{
  id: stored.id,
  email: stored.email,
  user_metadata: { name, role, phone },
  created_at, updated_at
}
```

**Startup Hydration (`initializeFromStorage`):**
Called once in `App.tsx` via a `useEffect` with empty deps on mount. It reads all accounts from `localStorage` and merges them into the in-memory `users[]` and `candidates[]` arrays — preventing data loss on page reload.

### Layer 3 — Supabase Auth

The `supabase` client is initialized in `src/utils/supabase/client.tsx` using the project ID and anon key from `info.tsx`. `supabase.auth.signInWithPassword` is called as a fallback if local auth fails. Email/OAuth flows (Google) and Azure AD B2C redirect flows are also wired up but require active Supabase project configuration and B2C tenant setup to function.

### Role-Based Routing

After any successful login, `App.tsx`'s `handleLocalLogin` reads `user.user_metadata.role`:
- `"admin"` → `setCurrentView("admin-portal")`
- `"employer"` → `setCurrentView("employer-portal")`
- anything else (candidate) → `setCurrentView("dashboard")`

---

## 7. Database Layer

### In-Memory Data (`src/database/localDb.ts`)

The file exports **named mutable arrays** at module level:

```typescript
export const users: User[]
export const candidates: Candidate[]
export const employers: Employer[]
export const employerUsers: EmployerUser[]
export const jobs: Job[]
export const jobApplications: JobApplication[]
export const assessments: Assessment[]
export const certificates: Certificate[]
export const notifications: Notification[]
export const adminUsers: AdminUser[]
export const candidateSkills: CandidateSkill[]
export const skillsMaster: SkillMaster[]
```

These arrays are populated with seed data at module load time and act as the live in-memory database for the entire session. Because they are mutable exports, `userStore.ts` and admin components can `push()` new records directly into them.

### `LocalDatabase` Class

A static utility class that exposes query methods:

| Method | Returns |
|---|---|
| `getUsers()` | All users |
| `getUserById(id)` | Single user |
| `getUserByEmail(email)` | Single user |
| `getCandidates(filters?)` | Filtered candidates |
| `getCandidateByUserId(userId)` | Single candidate |
| `getCandidateProfile(userId)` | Joined `CandidateProfile` object |
| `getEmployers(filters?)` | Filtered employers |
| `getJobs(filters?)` | Filtered jobs |
| `getJobsWithEmployers()` | Jobs joined with employer data |
| `getAssessments()` | All assessments |
| `getCertificates()` | All certificates |
| `getDashboardStats()` | Aggregated platform stats |
| `updateCandidateStatus(id, status)` | Mutates candidate in-memory |
| `updateCandidateInfo(id, updates)` | Mutates candidate in-memory |

### React Hooks (`src/database/hooks.ts`)

All data fetching in components is done through these hooks. They wrap the `LocalDatabase` static methods with simulated async behavior (100ms delay) and React state:

| Hook | Returns | Used In |
|---|---|---|
| `useUsers()` | `{ users, loading }` | CandidateManagement, TalentSearch |
| `useUser(id)` | `{ user, loading }` | Profile views |
| `useCurrentUser(email)` | `{ user, loading }` | Profile identification |
| `useCandidates(filters?)` | `{ candidates, loading }` | All candidate lists |
| `useCandidateProfile(userId)` | `{ profile, loading }` | ProfilePage |
| `useEmployers()` | `{ employers, loading }` | Job listings, employer views |
| `useJobs(filters?)` | `{ jobs, loading }` | Jobs, StatusTracker |
| `useCandidateApplications(candidateId)` | `{ applications, loading }` | StatusTracker |
| `useAssessments()` | `{ assessments, loading }` | AssessmentCertificates |
| `useCertificates()` | `{ certificates, loading }` | AssessmentCertificates |
| `useInterviews()` | `{ interviews }` | StatusTracker |
| `useDashboardStats()` | `{ stats, loading }` | AdminDashboard |
| `useCandidateCertificates(candidateId)` | `{ certificates, loading }` | TalentSearch |

### Type Definitions (`src/database/types.ts`)

All database entity shapes are defined here as TypeScript interfaces. Key types:

- **`User`** — Platform user (all roles)
- **`Candidate`** — Candidate profile record (linked to User via `user_id`)
- **`CandidateSkill`** — Individual skill with proficiency level
- **`CandidateExperience`** / **`CandidateEducation`** — Resume data
- **`Employer`** — Company account
- **`Job`** — Job posting
- **`JobApplication`** — Application record
- **`Assessment`** — Skill test definition
- **`Certificate`** — Earned certificate record

Enum types cover all status fields (e.g., `CandidateStatus`, `ApplicationStatus`, `JobStatus`, etc.).

---

## 8. Data Persistence (localStorage)

The application uses three separate `localStorage` namespaces:

### 8.1 User Accounts (`tts_user_accounts`)

Managed by `src/database/userStore.ts`. Stores an array of `StoredUser` objects:

```typescript
interface StoredUser {
  id: string;         // "usr-{timestamp36}-{random6}"
  email: string;
  name: string;
  phone: string;
  country: string;    // ISO 3166-1 alpha-2 code
  role: 'candidate' | 'employer_user' | 'admin';
  passwordHash: string; // SHA-256 hex
  createdAt: string;  // ISO timestamp
  status: 'active' | 'pending' | 'suspended';
}
```

### 8.2 Candidate Profile (`tts_profile_{userId}`)

Managed by `src/database/profileStore.ts`. One entry per user. Stores the full `StoredProfile` object with all profile fields (name, title, location, experience array, education array, skills, certifications, etc.) plus `savedAt` timestamp.

Profile images are stored separately under `tts_profile_img_{userId}` as base64 data URLs.

### 8.3 Competencies (`tts_competencies_{userId}`)

Managed inline inside `src/components/dashboard/Competencies.tsx`. Stores:
```json
{
  "skillRatings": { "1040HNI": "expert", "1065 Federal": "intermediate", ... },
  "whyHireMe": "string",
  "roleEntries": [{ "id": "...", "responsibility": "...", "percentage": "..." }],
  "customSkills": ["skill1", "skill2"]
}
```

---

## 9. Landing Page

The landing page is the default `"landing"` view. It is a composition of independent section components rendered in `App.tsx`:

```
<Header>           — Sticky nav bar with Login button + section anchors
<Hero>             — Main headline, CTA buttons, floating stat cards
<Features>         — 6-card grid of platform features
<HowItWorks>       — 3-step guide for candidates + employers
<Pricing>          — Pricing plan cards (3 tiers)
<Testimonials>     — Candidate/employer testimonials carousel
<Articles>         — Blog article cards
<Footer>           — Links to Privacy Policy, Terms, Cookie Policy, About
<CookieConsent>    — Bottom banner (persists via cookie)
```

### Navigation Anchors
The `<Header>` navigation links use standard `href="#section-id"` HTML anchors. The corresponding sections must have matching `id` attributes in their root elements.

### CTA Flows
- **"Find Your Dream Job" / "Get Started"** → `setCurrentView("login")`
- **"For Employers"** → `setCurrentView("employer-info")`
- **Pricing "Get Started"** → Stores `PendingPlan` in state, then navigates to login. After login, if the plan is paid, the `PaymentModal` is shown.

---

## 10. Candidate Dashboard

**Entry file:** `src/components/Dashboard.tsx`

### Layout
A two-column flex layout:
- **Left:** Fixed `w-52` sidebar with logo, navigation buttons, and logout button
- **Right:** Scrollable main content area rendering the active section

### Profile Section (`ProfilePage.tsx`)

The profile page has two modes:
- **View mode:** Displays name card, contact info, skills badges, experience/education timeline
- **Edit mode:** Inline form (not a modal) with all fields editable

**New Account Detection:**
```typescript
const isNewAccount = userId.startsWith('usr-');
```
- `usr-` prefix → blank `defaultProfile` (only `name` and `email` pre-filled from `user_metadata`)
- Demo IDs (e.g., `local-candidate-001`) → full seeded sample profile data

**Profile Image Upload:**
- Accepts image files via `<input type="file" accept="image/*">`
- Converts to base64 data URL using `FileReader`
- Stored to `localStorage` via `saveProfileImage(userId, dataUrl)`
- Loaded on mount via `loadProfileImage(userId)`

**Skills Selector:**
A predefined list of 60+ US tax-specific skills (`US_TAX_SKILLS`) is available in a searchable dropdown. Skills can also be typed in as custom entries.

**Save Logic:**
`handleSave()` calls `saveProfile(userId, profileData)` from `profileStore.ts`, then calls `LocalDatabase.updateCandidateInfo(candidateId, {...})` to sync the headline, location, etc. back into the in-memory DB.

### Competencies Section (`Competencies.tsx`)

Allows candidates to self-rate their proficiency in 10 core tax form types:

**Tax Form Skills Rated:**
`1040HNI`, `1040GMS`, `1040 COE`, `1120 Federal`, `1120 State`, `1065 Federal`, `1065 State`, `1120S`, `1065 Operating Partnership`, `990`

**Rating Scale:** `basic` | `intermediate` | `expert` | `not-applicable`

**Role Distribution:** Candidates can define their time allocation across 7 responsibility types (Preparation, First Level Review, Second Level Review, Managing Teams, Client Management, Strategy Meetings, Other) with percentage breakdown.

**"Why Hire Me":** Free-text textarea for a personal value proposition.

All data is saved to `localStorage` key `tts_competencies_{userId}` and loaded on mount.

### Assessments Section (`AssessmentCertificates.tsx`)

Three tabs:
1. **Available** — Lists all assessments from the DB with difficulty, duration, price, and a "Start" button
2. **In Progress** — Hardcoded sample of one in-progress assessment (placeholder)
3. **Certificates** — Earned certificates from DB with score, validity date, credential ID

**Assessment Flow:**
- Only Assessment ID 1 (Form 1040) launches the actual test component `<Assessment1040>`
- All other assessments show a "Coming Soon" toast
- Completing the 1040 assessment shows `<Certificate1040>` with a downloadable certificate (PDF via jsPDF)

### Jobs Section (`Jobs.tsx`)

Fetches all `status: 'active'` jobs from the DB via `useJobs()`. Displays job cards with:
- Title, company, location, type, experience range, salary range
- "Posted X days ago" relative timestamp
- Required skills badges
- "Urgent" badge for urgent postings
- "Apply Now" button → navigates to `job-application` section
- "View Details" button → navigates to `job-details` section

**Filters:** Search by keyword, filter by location and experience level.

### Status Tracker (`StatusTracker.tsx`)

Two tabs:
1. **Applications** — List of submitted applications with status badge, progress bar (0–100%), and timeline stages
2. **Interviews** — Scheduled/completed interviews from the DB

> **Note:** Currently uses hardcoded candidate ID `1` for DB queries. Needs to be updated to use the logged-in user's candidate ID for production.

### Salary Insights (`SalaryInsights.tsx`)

All data is **static/hardcoded**. Displays:
- Salary range table by role and experience
- Location comparison bar chart (6 Indian cities)
- Monthly salary trend line chart
- Skill premium table (% salary boost by skill)
- Company-by-company salary ranges

No API calls are made here; this is market intelligence data embedded in the component.

### Best Matches (`BestMatches.tsx`)

All data is **static/hardcoded**. Displays pre-defined job match cards with a percentage match score. Does not dynamically compute matches from the candidate's profile.

### Interview Feedback (`InterviewFeedback.tsx`)

All data is **static/hardcoded**. Shows detailed interview feedback cards with ratings across multiple dimensions (technical skills, communication, problem-solving, tax knowledge).

---

## 11. Employer Portal

**Entry file:** `src/components/EmployerPortal.tsx`

### Layout
Same two-column layout as the candidate dashboard. Sidebar sections: Dashboard, Search Talent, Interviews (placeholder), Settings (placeholder).

### Employer Dashboard (`EmployerDashboard.tsx`)

All data is **static/hardcoded**. Displays:
- KPI stat cards (candidates viewed, shortlisted, active searches, interview requests)
- Weekly profile views bar chart
- Skill demand bar chart
- Recent activity feed

### Talent Search (`TalentSearch.tsx`)

Fetches **approved** candidates from the DB (`status === 'approved'`). Transforms DB candidate records into display format with name, title, location, skills, availability, and hourly rate.

**Filters available:**
- Keyword search (matches name, title, skills, summary)
- Experience range slider (0–15 years)
- Minimum assessment score slider
- Skills multi-select checkboxes

Clicking "View Full Profile" calls `onViewProfile(candidateId)` which passes the ID to `CandidateProfileView`.

> **Current Limitation:** `onViewProfile` still expects a `number` type in `EmployerPortal.tsx`'s state (`candidateId: number`). Candidates are fetched by string ID. This disconnect means the profile view uses `parseInt()` to match, which will fail for new candidate IDs. This is a known issue requiring string-ID refactor in `EmployerPortal.tsx`.

### Candidate Profile View (`CandidateProfileView.tsx`)

Renders a full read-only candidate profile as seen by employers. Fetches data via `LocalDatabase.getCandidateProfile(userId)`.

---

## 12. Admin Portal

**Entry file:** `src/components/AdminPortal.tsx`

### Admin Dashboard (`AdminDashboard.tsx`)

Displays live platform statistics derived from the in-memory DB:
- Total candidates, employers, jobs, assessments (live counts from hooks)
- Pending approvals count
- Growth trend line chart (candidates + employers over last 6 months)
- Assessment distribution pie chart (static data)
- Revenue trend bar chart (static data)
- Recent activity feed (derived from newest DB records)

### Candidate Management (`CandidateManagement.tsx`)

The most complex admin component. Has **three view states**:

1. **List View** — Table of all candidates with search/filter. Columns: Name, Email, Location, Experience, Status, Rating, Skills, Actions.
2. **Detail View** — Full candidate profile with approval/rejection actions and "Assign Assessment" button.
3. **Edit View** — Inline form (not a Dialog, to avoid CSS portal issues) for editing candidate fields.

**Key Implementation Details:**
- All candidate IDs are handled as **strings** throughout (no `parseInt`).
- `statusOverrides` is a `Record<string, status>` in local React state — allows approving/rejecting without persisting to the DB immediately. `LocalDatabase.updateCandidateStatus(id, status)` updates the in-memory array.
- `getCandidateDetails(candidateId, mockCandidates, dbCandidates)` is a utility function that joins the display-format candidate with the raw DB record to pull additional fields (salary range, availability, work mode).

### Assessment Management (`AssessmentManagement.tsx`)

Static mock data only. Provides:
- Assessment list with CRUD controls
- Question bank view per assessment
- Create/edit assessment form
- Stats: total attempts, average scores

> **Note:** Does not connect to the live `assessments[]` in-memory DB. Uses its own hardcoded `mockAssessments` array.

### Employer Management (`EmployerManagement.tsx`)

Static mock data. Manage employer accounts with:
- Approve/reject/suspend controls
- Subscription plan badge
- Company detail view

### Job Management (`JobManagement.tsx`)

Static mock data. CRUD interface for job postings with:
- Active/Draft/Closed status toggle
- Edit job form (Dialog)
- Applicant count display

### User Management (`UserManagement.tsx`)

Static mock data. Manages **admin-level users** (not candidates or employers):
- Role assignment: admin / manager / viewer
- Permission sets per user
- Employer assignment for manager accounts

### Resume Import (`ResumeImport.tsx`)

The most technically complex admin component. Supports:

1. **PDF Upload** — Drag-and-drop or file selector. Multiple PDFs accepted.
2. **PDF Parsing** — Uses `pdfjs-dist` (CDN worker) to extract text from PDF. `parseLinkedInPDF()` in `utils/resumeParser.ts` parses the extracted text into structured data.
3. **Review Form** — Pre-populated `CandidateForm` fields that admin can edit before saving.
4. **Save to DB** — Calls `LocalDatabase.importCandidate(form)` to create User + Candidate + Skills records in the in-memory arrays.

---

## 13. Pricing & Payment Flow

### Pricing Plans (`Pricing.tsx`)

Three plans defined as static data:

| Plan | Price | Target |
|---|---|---|
| **Professional** | Free (Forever) | Tax Professionals |
| **Professional Pro** | ₹2,000/month | Advanced Professionals |
| **Premium** | ₹5,000/month | Top-tier / firms |

Each plan has feature lists and included assessment types. Employer plans exist as a separate section on the same page.

### Payment Flow

1. User clicks "Get Started" on a paid plan.
2. `handlePricingGetStarted(plan: PendingPlan)` stores plan in state and navigates to login.
3. After login, `App.tsx` checks `if (pendingPlan && pendingPlan.price !== "Free")`.
4. If true, renders `<PaymentModal plan={pendingPlan} />` over the dashboard.
5. `PaymentModal` shows a credit card form with basic formatting helpers.
6. On submit, simulates `1800ms` processing delay, then shows success state for `2000ms`, then calls `onSuccess()`.
7. `onSuccess` clears `pendingPlan` and `showPayment`.

> **Important:** No real payment processing occurs. This is a UI mockup only.

---

## 14. UI Component Library

All UI primitives are from **shadcn/ui** built on **Radix UI**. They are located in `src/components/ui/`. These are fully customized via CSS variables defined in `src/styles/globals.css`.

### Key Components Used

| Component | File | Primary Use |
|---|---|---|
| `Button` | `button.tsx` | All action buttons (with `variant` + `size` props) |
| `Card` | `card.tsx` | Section containers throughout all portals |
| `Input` | `input.tsx` | Text input fields |
| `Label` | `label.tsx` | Form field labels |
| `Textarea` | `textarea.tsx` | Multi-line text inputs |
| `Select` | `select.tsx` | Dropdown selectors |
| `Badge` | `badge.tsx` | Status indicators, skill tags |
| `Tabs` | `tabs.tsx` | Tab navigation inside views |
| `Dialog` | `dialog.tsx` | Modal overlays (used in some admin modals) |
| `Sheet` | `sheet.tsx` | Slide-out panels |
| `Progress` | `progress.tsx` | Application progress bars |
| `Separator` | `separator.tsx` | Visual dividers |
| `Checkbox` | `checkbox.tsx` | Multi-select filters |
| `RadioGroup` | `radio-group.tsx` | Competency level selection |
| `Slider` | `slider.tsx` | Experience/score range filters |
| `Avatar` | `avatar.tsx` | User profile images |
| `ScrollArea` | `scroll-area.tsx` | Scrollable containers |
| `Sonner` (toast) | `sonner.tsx` | Action feedback notifications |

### CSS Theming

Colors and spacing are defined as CSS custom properties in `globals.css`. The theme supports light/dark mode via `next-themes`. Key variables:
- `--primary` — Main brand color (blue)
- `--sidebar` / `--sidebar-border` / `--sidebar-primary` — Sidebar-specific tokens
- `--muted-foreground` — Subdued text color
- `--secondary` — Light background tint

### `ImageWithFallback` (`src/components/figma/ImageWithFallback.tsx`)

A thin wrapper around `<img>` that catches `onError` and renders a placeholder div with the same dimensions to prevent broken image icons.

---

## 15. Build & Development

### Scripts

```bash
npm run dev      # Start Vite dev server on http://localhost:3000
npm run build    # TypeScript check + production build to /build
npm run preview  # Serve the production build locally
```

### Vite Aliases

`vite.config.ts` defines aliases that strip version suffixes from import paths. This allows imports like `import { toast } from 'sonner@2.0.3'` to resolve correctly regardless of the exact installed version.

### Path Alias

`@` resolves to `./src`, so `import Foo from '@/components/Foo'` is valid.

### Production Build

Output goes to `build/`. The `build/index.html` already exists in the repo as a pre-built snapshot. Running `npm run build` will overwrite it.

---

## 16. Key Data Flow Diagrams

### New User Registration

```
LoginPage (signup form)
    │ registerUser({ email, password, name, phone, country, role })
    ▼
userStore.ts
    ├── Validate email format + uniqueness
    ├── Hash password (SHA-256 + salt via Web Crypto)
    ├── Generate: id = "usr-{timestamp36}-{random6}"
    ├── Save StoredUser → localStorage["tts_user_accounts"]
    ├── Push User record → localDb.users[]
    └── If candidate: push Candidate record → localDb.candidates[]
              id = "cnd-{userId}"
    │
    ▼
buildUserFromStored(newUser) → mock session object
    │
    ▼
App.tsx: handleLocalLogin(mockUser)
    └── setUser(mockUser)
    └── setCurrentView("dashboard")
```

### Page Reload with Registered Users

```
App.tsx: useEffect([], [])
    │ initializeFromStorage()
    ▼
userStore.ts
    ├── getStoredUsers() → read localStorage["tts_user_accounts"]
    ├── For each StoredUser not in localDb.users[] → push User
    └── For each candidate not in localDb.candidates[] → push Candidate
    
localDb.users[] and localDb.candidates[] are now fully hydrated
```

### Profile Save

```
ProfilePage.tsx: handleSave()
    ├── saveProfile(userId, profileData)    → localStorage["tts_profile_{userId}"]
    └── LocalDatabase.updateCandidateInfo(candidateId, {
            headline, location_city, location_state,
            experience_years, availability, work_mode,
            expected_salary_min, expected_salary_max
        })
        └── Mutates candidates[] in-memory
```

### Admin Candidate Approval

```
CandidateManagement.tsx: handleApprove(candidateId: string)
    ├── dbCandidates.find(c => c.id === candidateId)
    ├── LocalDatabase.updateCandidateStatus(dbRecord.id, "approved")
    │       └── Mutates candidates[] in-memory
    └── setStatusOverrides(prev => ({ ...prev, [candidateId]: "approved" }))
        └── React re-render reflects new status badge
```

---

## 17. Known Limitations & Future Work

### Current Limitations

| Area | Issue |
|---|---|
| **Data Persistence** | All data is lost on page reload except: user accounts, profiles, and competencies (in localStorage). No real database backend. |
| **Admin changes** | Approving/rejecting candidates updates in-memory state only. Not persisted to localStorage. Refreshing the page resets approval status. |
| **Status Tracker** | Uses hardcoded candidate ID `1` — does not show data for logged-in user. |
| **Best Matches** | Static data — not computed from actual profile. |
| **Employer Portal IDs** | `EmployerPortal.tsx` still passes `candidateId` as `number` to `CandidateProfileView`. New candidate IDs are strings, so profile lookup will fail. |
| **Interview Feedback** | Static data only — not linked to actual interviews. |
| **Assessment Management** | Not connected to the live `assessments[]` array. |
| **Employer/Job Management** | Uses own static mock data, not the seeded in-memory DB. |
| **Payment** | UI only — no real payment processor integrated. |
| **B2C Auth** | Azure AD B2C MSAL is wired up but requires active tenant configuration. |
| **Supabase** | Client is initialized but backend tables are not set up. |

### Recommended Future Improvements

1. **Connect to real backend** — Implement Supabase tables matching `schema.sql`, replace `localDb.ts` hooks with Supabase queries.
2. **Persist admin actions** — Save approval/rejection status to localStorage or DB.
3. **Fix Employer Portal ID type** — Refactor `EmployerPortal.tsx` and `CandidateProfileView.tsx` to use string IDs.
4. **Dynamic Best Matches** — Compute job matches by comparing candidate's skills/location/experience against job requirements.
5. **StatusTracker user linking** — Pass logged-in user's candidate ID to `useCandidateApplications`.
6. **Payment integration** — Integrate Razorpay or Stripe for Indian rupee processing.
7. **Admin persistence** — Store status overrides in localStorage (keyed by candidate ID) so they survive page reloads.

---

## 18. Demo Credentials

These accounts can be used to explore all three portals immediately after launching the app. Use the "Demo Logins" panel on the Login page (click "Show Demo Logins" to expand it).

### Admin
| Email | Password | Name |
|---|---|---|
| `admin@taxtalentsolution.com` | `Admin@2025` | Rajesh Kumar |

### Employer
| Email | Password | Company |
|---|---|---|
| `recruiter1@kpmg.com` | `KPMG@2025` | KPMG India |
| `hr1@deloitte.com` | `Deloitte@2025` | Deloitte India |

### Candidate
| Email | Password | Profile |
|---|---|---|
| `priya.sharma@email.com` | `Priya@2025` | Senior Tax Analyst (1040/1065) |
| `rahul.kumar@email.com` | `Rahul@2025` | Tax Manager (S-Corp/Partnership) |

### Quick Demo Buttons (No Login Required)
The login page also has three "Demo Access" tile buttons:
- **Demo Candidate** → Logs in as `john.doe@example.com` (id: `demo-user-123`)
- **Demo Employer** → Logs in as `recruiter@kpmg.com` (id: `demo-employer-123`)
- **Demo Admin** → Logs in as `admin@taxtalentsolution.com` (id: `demo-admin-123`)

These bypass the credential system entirely and construct a mock user object directly in `App.tsx`.

---

*End of Documentation*
