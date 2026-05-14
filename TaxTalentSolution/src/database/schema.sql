-- =====================================================
-- Tax Talent Solution Database Schema
-- Version: 1.0.0
-- Description: Complete database schema for Tax Talent Solution platform
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE (Core Authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    b2c_object_id VARCHAR(255) UNIQUE,             -- Azure AD B2C Object ID (oid claim)
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(10),                           -- ISO 3166-1 alpha-2 country code
    role VARCHAR(50) NOT NULL CHECK (role IN ('candidate', 'employer_user', 'admin')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    avatar_url TEXT,
    oauth_provider VARCHAR(50) DEFAULT 'azure_b2c',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,          -- set to TRUE after OTP confirmation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Index for fast B2C object-id lookups
CREATE INDEX IF NOT EXISTS idx_users_b2c_object_id ON users (b2c_object_id);

-- =====================================================
-- 1b. USER_SUBSCRIPTIONS TABLE
--     Tracks the active subscription plan for each user.
--     One row per user (upserted on plan change).
-- =====================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan          VARCHAR(50) NOT NULL DEFAULT 'free'
                      CHECK (plan IN ('free', 'professional', 'premium')),
    billing_cycle VARCHAR(50) NOT NULL DEFAULT 'monthly'
                      CHECK (billing_cycle IN ('monthly', 'annual')),
    status        VARCHAR(50) NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'cancelled', 'expired')),
    start_date    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at    TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions (user_id);

-- =====================================================
-- 2. CANDIDATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    summary TEXT,
    location_city VARCHAR(100),
    location_state VARCHAR(100),
    location_country VARCHAR(100) DEFAULT 'India',
    experience_years INTEGER DEFAULT 0,
    availability VARCHAR(50) DEFAULT 'immediate' CHECK (availability IN ('immediate', '2_weeks', '1_month', 'not_looking')),
    work_mode VARCHAR(50) DEFAULT 'remote' CHECK (work_mode IN ('remote', 'hybrid', 'onsite')),
    expected_salary_min INTEGER,
    expected_salary_max INTEGER,
    hourly_rate INTEGER,
    current_salary INTEGER,
    linkedin_url VARCHAR(500),
    resume_url VARCHAR(500),
    profile_completeness INTEGER DEFAULT 0 CHECK (profile_completeness >= 0 AND profile_completeness <= 100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    is_featured BOOLEAN DEFAULT FALSE,
    profile_views INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- 3. CANDIDATE_SKILLS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS candidate_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    proficiency VARCHAR(50) DEFAULT 'intermediate' CHECK (proficiency IN ('basic', 'intermediate', 'advanced', 'expert')),
    is_verified BOOLEAN DEFAULT FALSE,
    years_experience INTEGER DEFAULT 0,
    verified_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. CANDIDATE_EXPERIENCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS candidate_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    achievements TEXT[],
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. CANDIDATE_EDUCATION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS candidate_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    start_date DATE,
    end_date DATE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. CANDIDATE_COMPETENCIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS candidate_competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    form_type VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50) CHECK (proficiency_level IN ('basic', 'intermediate', 'expert', 'not_applicable')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(candidate_id, form_type)
);

-- =====================================================
-- 7. CANDIDATE_RESPONSIBILITIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS candidate_responsibilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    responsibility_type VARCHAR(255) NOT NULL,
    percentage INTEGER CHECK (percentage >= 0 AND percentage <= 100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. EMPLOYERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS employers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    website VARCHAR(500),
    industry VARCHAR(255),
    company_size VARCHAR(50),
    headquarters_city VARCHAR(100),
    headquarters_state VARCHAR(100),
    headquarters_country VARCHAR(100) DEFAULT 'India',
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    subscription_plan VARCHAR(50) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'professional', 'enterprise')),
    subscription_expiry DATE,
    monthly_budget INTEGER DEFAULT 0,
    total_hires INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. EMPLOYER_USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS employer_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'recruiter' CHECK (role IN ('owner', 'admin', 'recruiter', 'viewer')),
    permissions TEXT[],
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, employer_id)
);

-- =====================================================
-- 10. JOBS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_city VARCHAR(100),
    location_state VARCHAR(100),
    location_country VARCHAR(100) DEFAULT 'India',
    is_remote BOOLEAN DEFAULT FALSE,
    job_type VARCHAR(50) DEFAULT 'full_time' CHECK (job_type IN ('full_time', 'part_time', 'contract', 'temporary')),
    experience_level VARCHAR(50) CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead')),
    experience_years_min INTEGER DEFAULT 0,
    experience_years_max INTEGER,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'INR',
    category VARCHAR(100),
    required_skills TEXT[],
    preferred_skills TEXT[],
    requirements TEXT[],
    responsibilities TEXT[],
    benefits TEXT[],
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft', 'paused')),
    is_urgent BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    applicant_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    posted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closing_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. JOB_APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES employers(id),
    cover_letter TEXT,
    resume_url VARCHAR(500),
    current_compensation INTEGER,
    expected_compensation INTEGER,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'shortlisted', 'interview_scheduled', 'offered', 'hired', 'rejected', 'withdrawn')),
    stage INTEGER DEFAULT 1 CHECK (stage >= 1 AND stage <= 6),
    progress INTEGER DEFAULT 20 CHECK (progress >= 0 AND progress <= 100),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    notes TEXT,
    UNIQUE(job_id, candidate_id)
);

-- =====================================================
-- 12. APPLICATION_STATUS_HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS application_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    status VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    performed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. ASSESSMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(50) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
    duration_minutes INTEGER DEFAULT 60,
    passing_score INTEGER DEFAULT 70,
    question_count INTEGER DEFAULT 0,
    price INTEGER DEFAULT 0,
    skills_validated TEXT[],
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    total_attempts INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2) DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 14. ASSESSMENT_QUESTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS assessment_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) CHECK (question_type IN ('multiple_choice', 'true_false', 'scenario')),
    difficulty VARCHAR(50),
    points INTEGER DEFAULT 1,
    options TEXT[],
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 15. CERTIFICATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id),
    credential_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    score INTEGER,
    percentile INTEGER,
    level VARCHAR(50) CHECK (level IN ('professional', 'specialist', 'expert')),
    issue_date DATE NOT NULL,
    expiry_date DATE,
    skills_validated TEXT[],
    is_valid BOOLEAN DEFAULT TRUE,
    pdf_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 16. ASSESSMENT_ATTEMPTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER,
    score INTEGER,
    percentage DECIMAL(5,2),
    passed BOOLEAN,
    answers JSONB,
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 17. INTERVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    employer_id UUID NOT NULL REFERENCES employers(id),
    interviewer_id UUID REFERENCES users(id),
    interview_type VARCHAR(50) CHECK (interview_type IN ('phone', 'video', 'in_person', 'technical')),
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link VARCHAR(500),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 18. INTERVIEW_FEEDBACK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS interview_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    interviewer_name VARCHAR(255),
    interviewer_role VARCHAR(255),
    overall_rating DECIMAL(2,1) CHECK (overall_rating >= 0 AND overall_rating <= 5),
    technical_skills_rating DECIMAL(2,1),
    communication_rating DECIMAL(2,1),
    problem_solving_rating DECIMAL(2,1),
    tax_knowledge_rating DECIMAL(2,1),
    strengths TEXT[],
    improvements TEXT[],
    detailed_feedback TEXT,
    recommendation VARCHAR(50) CHECK (recommendation IN ('highly_recommended', 'recommended', 'maybe', 'not_recommended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 19. PROFILE_VIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    employer_id UUID REFERENCES employers(id),
    viewer_user_id UUID REFERENCES users(id),
    view_type VARCHAR(50) CHECK (view_type IN ('full_profile', 'basic_profile', 'skills_only')),
    source VARCHAR(100),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 20. SAVED_CANDIDATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS saved_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    saved_by UUID REFERENCES users(id),
    folder VARCHAR(100),
    notes TEXT,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employer_id, candidate_id)
);

-- =====================================================
-- 21. SAVED_JOBS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(candidate_id, job_id)
);

-- =====================================================
-- 22. ADMIN_USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager', 'viewer')),
    permissions TEXT[],
    assigned_employers UUID[],
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- =====================================================
-- 23. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 24. SKILLS_MASTER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS skills_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    is_predefined BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Candidates indexes
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_location ON candidates(location_state, location_city);
CREATE INDEX IF NOT EXISTS idx_candidates_experience ON candidates(experience_years);

-- Candidate skills indexes
CREATE INDEX IF NOT EXISTS idx_candidate_skills_candidate ON candidate_skills(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_name ON candidate_skills(skill_name);

-- Employers indexes
CREATE INDEX IF NOT EXISTS idx_employers_status ON employers(status);
CREATE INDEX IF NOT EXISTS idx_employers_subscription ON employers(subscription_plan);

-- Jobs indexes
CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location_state, location_city);

-- Applications indexes
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_employer ON job_applications(employer_id);

-- Certificates indexes
CREATE INDEX IF NOT EXISTS idx_certificates_candidate ON certificates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_credential ON certificates(credential_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employers_updated_at BEFORE UPDATE ON employers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
