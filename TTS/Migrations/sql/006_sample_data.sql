-- Sample data for local / dev UI testing (SQL Server).
-- Run after 001–005. Idempotent: skips rows that already exist by fixed id.
-- Fixed GUIDs so you can reference them in API tests and Entra mapping.

-- Role ids from 004_seed_default_roles.sql
DECLARE @RoleCandidate UNIQUEIDENTIFIER = '8B90FD0B-EB39-482F-82C0-DCF60273D3D4';
DECLARE @RoleEmployer  UNIQUEIDENTIFIER = 'E390AD62-F385-4ACD-92A3-8F8607B0B908';
DECLARE @RoleAdmin     UNIQUEIDENTIFIER = (
    SELECT TOP 1 id FROM dbo.roles WHERE LOWER(name) = N'admin'
);

-- Sample entity ids
DECLARE @UserCandidate   UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000001';
DECLARE @UserEmployer    UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000002';
DECLARE @UserAdmin       UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000003';
DECLARE @CandidateId     UNIQUEIDENTIFIER = 'A1000002-0002-4002-8002-000000000010';
DECLARE @EmployerKpmg    UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000020';
DECLARE @EmployerDeloitte UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000021';
DECLARE @Assessment1040  UNIQUEIDENTIFIER = 'A1000004-0004-4004-8004-000000000030';
DECLARE @Assessment1065  UNIQUEIDENTIFIER = 'A1000004-0004-4004-8004-000000000031';
DECLARE @JobSenior1040   UNIQUEIDENTIFIER = 'A1000005-0005-4005-8005-000000000040';
DECLARE @JobTaxAssoc     UNIQUEIDENTIFIER = 'A1000005-0005-4005-8005-000000000041';
DECLARE @ApplicationId   UNIQUEIDENTIFIER = 'A1000006-0006-4006-8006-000000000050';
DECLARE @CertificateId   UNIQUEIDENTIFIER = 'A1000007-0007-4007-8007-000000000060';
DECLARE @NotificationId  UNIQUEIDENTIFIER = 'A1000008-0008-4008-8008-000000000070';
DECLARE @UserAssessmentId UNIQUEIDENTIFIER = 'A1000009-0009-4009-8009-000000000080';

-- ── Users ────────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE id = @UserCandidate)
BEGIN
    INSERT INTO dbo.users (id, name, email, phone, roleid, country, isactive)
    VALUES (
        @UserCandidate,
        N'Jane Doe',
        N'jane.candidate@taxtalent.dev',
        N'+919876543210',
        @RoleCandidate,
        N'IN',
        1
    );
END
GO

DECLARE @UserEmployer UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000002';
DECLARE @RoleEmployer UNIQUEIDENTIFIER = 'E390AD62-F385-4ACD-92A3-8F8607B0B908';

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE id = @UserEmployer)
BEGIN
    INSERT INTO dbo.users (id, name, email, phone, roleid, country, isactive)
    VALUES (
        @UserEmployer,
        N'KPMG Recruiter',
        N'recruiter@kpmg.demo',
        N'+911234567890',
        @RoleEmployer,
        N'IN',
        1
    );
END
GO

DECLARE @UserAdmin UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000003';
DECLARE @RoleAdmin UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM dbo.roles WHERE LOWER(name) = N'admin');

IF @RoleAdmin IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.users WHERE id = @UserAdmin)
BEGIN
    INSERT INTO dbo.users (id, name, email, phone, roleid, country, isactive)
    VALUES (
        @UserAdmin,
        N'Platform Admin',
        N'admin@taxtalent.dev',
        N'0000000000',
        @RoleAdmin,
        N'IN',
        1
    );
END
GO

-- ── Employers (company name/email live on users; employers table varies by DB age) ─
DECLARE @UserEmployer UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000002';
DECLARE @UserDeloitte UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000004';
DECLARE @RoleEmployer UNIQUEIDENTIFIER = 'E390AD62-F385-4ACD-92A3-8F8607B0B908';
DECLARE @EmployerKpmg UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000020';
DECLARE @EmployerDeloitte UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000021';

UPDATE dbo.users SET name = N'KPMG India' WHERE id = @UserEmployer;

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE id = @UserDeloitte)
BEGIN
    INSERT INTO dbo.users (id, name, email, phone, roleid, country, isactive)
    VALUES (
        @UserDeloitte, N'Deloitte USI', N'talent@deloitte.demo', N'+918765432100',
        @RoleEmployer, N'IN', 1
    );
END

IF NOT EXISTS (SELECT 1 FROM dbo.employers WHERE id = @EmployerKpmg)
BEGIN
    IF COL_LENGTH('dbo.employers', 'name') IS NOT NULL
        INSERT INTO dbo.employers (id, userid, name, contactperson, location, industry, companysize, website, isactive)
        VALUES (@EmployerKpmg, @UserEmployer, N'KPMG India', N'Priya Sharma', N'Mumbai, Maharashtra',
            N'Professional Services', N'1000+', N'https://kpmg.com/in', 1);
    ELSE IF COL_LENGTH('dbo.employers', 'companyname') IS NOT NULL
        INSERT INTO dbo.employers (id, userid, companyname, contactperson, location, industry, companysize, website, isactive)
        VALUES (@EmployerKpmg, @UserEmployer, N'KPMG India', N'Priya Sharma', N'Mumbai, Maharashtra',
            N'Professional Services', N'1000+', N'https://kpmg.com/in', 1);
    ELSE
        INSERT INTO dbo.employers (id, userid, contactperson, location, industry, companysize, website, isactive)
        VALUES (@EmployerKpmg, @UserEmployer, N'Priya Sharma', N'Mumbai, Maharashtra',
            N'Professional Services', N'1000+', N'https://kpmg.com/in', 1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.employers WHERE id = @EmployerDeloitte)
BEGIN
    IF COL_LENGTH('dbo.employers', 'name') IS NOT NULL
        INSERT INTO dbo.employers (id, userid, name, contactperson, location, industry, companysize, website, isactive)
        VALUES (@EmployerDeloitte, @UserDeloitte, N'Deloitte USI', N'Michael Chen', N'Hyderabad, Telangana',
            N'Professional Services', N'1000+', N'https://deloitte.com', 1);
    ELSE IF COL_LENGTH('dbo.employers', 'companyname') IS NOT NULL
        INSERT INTO dbo.employers (id, userid, companyname, contactperson, location, industry, companysize, website, isactive)
        VALUES (@EmployerDeloitte, @UserDeloitte, N'Deloitte USI', N'Michael Chen', N'Hyderabad, Telangana',
            N'Professional Services', N'1000+', N'https://deloitte.com', 1);
    ELSE
        INSERT INTO dbo.employers (id, userid, contactperson, location, industry, companysize, website, isactive)
        VALUES (@EmployerDeloitte, @UserDeloitte, N'Michael Chen', N'Hyderabad, Telangana',
            N'Professional Services', N'1000+', N'https://deloitte.com', 1);
END
GO

-- ── Candidate ───────────────────────────────────────────────────────────────
DECLARE @UserCandidate UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000001';
DECLARE @CandidateId UNIQUEIDENTIFIER = 'A1000002-0002-4002-8002-000000000010';

IF NOT EXISTS (SELECT 1 FROM dbo.candidates WHERE id = @CandidateId)
BEGIN
    INSERT INTO dbo.candidates (
        id, userid, location, currenttitle, experienceyrs, noticeperiod,
        taxexpertise, certifications, currency, availability, workmode, status, stage, isactive
    )
    VALUES (
        @CandidateId, @UserCandidate, N'Mumbai, India', N'Senior Tax Associate', 5, 30,
        N'1040,1065,Multi-state', N'CPA (pursuing)', N'INR', N'Actively Looking', N'Hybrid',
        N'approved', N'active', 1
    );
END
GO

-- ── Assessments (status active → visible on candidate dashboard) ───────────────
DECLARE @Assessment1040 UNIQUEIDENTIFIER = 'A1000004-0004-4004-8004-000000000030';
DECLARE @Assessment1065 UNIQUEIDENTIFIER = 'A1000004-0004-4004-8004-000000000031';

IF NOT EXISTS (SELECT 1 FROM dbo.assessments WHERE id = @Assessment1040)
BEGIN
    INSERT INTO dbo.assessments (
        id, title, category, difficultylevel, numberofquestions, durationminutes,
        passingscore, pointsperquestion, description, status, isactive
    )
    VALUES (
        @Assessment1040, N'1040 Individual Tax Returns', N'Individual', N'intermediate',
        25, 45, 70, 4,
        N'Assessment covering Form 1040 preparation, schedules, and common individual scenarios.',
        N'active', 1
    );
END

IF NOT EXISTS (SELECT 1 FROM dbo.assessments WHERE id = @Assessment1065)
BEGIN
    INSERT INTO dbo.assessments (
        id, title, category, difficultylevel, numberofquestions, durationminutes,
        passingscore, pointsperquestion, description, status, isactive
    )
    VALUES (
        @Assessment1065, N'1065 Partnership Taxation', N'Partnership', N'advanced',
        30, 60, 75, 4,
        N'Partnership allocations, K-1 reporting, and Form 1065 fundamentals.',
        N'active', 1
    );
END
GO

-- ── Job postings ─────────────────────────────────────────────────────────────
DECLARE @EmployerKpmg UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000020';
DECLARE @EmployerDeloitte UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000021';
DECLARE @JobSenior1040 UNIQUEIDENTIFIER = 'A1000005-0005-4005-8005-000000000040';
DECLARE @JobTaxAssoc UNIQUEIDENTIFIER = 'A1000005-0005-4005-8005-000000000041';

IF NOT EXISTS (SELECT 1 FROM dbo.jobpostings WHERE id = @JobSenior1040)
BEGIN
    INSERT INTO dbo.jobpostings (
        id, jobtitle, employerid, location, jobtype, experiencelevel, category,
        minsalary, maxsalary, closingdate, jobdescription,
        requirements, responsibilities, benefits, isactive
    )
    VALUES (
        @JobSenior1040, N'Senior Tax Analyst - 1040 Specialist', @EmployerKpmg,
        N'Mumbai, Maharashtra', N'full-time', N'mid', N'Individual Tax',
        1200000, 1800000, DATEADD(month, 2, CAST(GETUTCDATE() AS DATE)),
        N'Prepare and review complex individual tax returns for US clients.',
        N'["3+ years 1040 experience","Strong Schedule C/D knowledge","CPA preferred"]',
        N'["Prepare returns","Review junior work","Client communication"]',
        N'["Health insurance","Flexible hours","US tax training"]',
        1
    );
END

IF NOT EXISTS (SELECT 1 FROM dbo.jobpostings WHERE id = @JobTaxAssoc)
BEGIN
    INSERT INTO dbo.jobpostings (
        id, jobtitle, employerid, location, jobtype, experiencelevel, category,
        minsalary, maxsalary, closingdate, jobdescription,
        requirements, responsibilities, benefits, isactive
    )
    VALUES (
        @JobTaxAssoc, N'Tax Associate - Partnership', @EmployerDeloitte,
        N'Hyderabad, Telangana', N'full-time', N'entry', N'Partnership',
        800000, 1200000, DATEADD(month, 3, CAST(GETUTCDATE() AS DATE)),
        N'Support partnership tax compliance and K-1 preparation.',
        N'["1-3 years tax experience","1065 exposure"]',
        N'["Data entry","K-1 prep","Team collaboration"]',
        N'["Hybrid work","Learning budget"]',
        1
    );
END
GO

-- ── Job application ──────────────────────────────────────────────────────────
DECLARE @JobSenior1040 UNIQUEIDENTIFIER = 'A1000005-0005-4005-8005-000000000040';
DECLARE @CandidateId UNIQUEIDENTIFIER = 'A1000002-0002-4002-8002-000000000010';
DECLARE @UserCandidate UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000001';
DECLARE @EmployerKpmg UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000020';
DECLARE @ApplicationId UNIQUEIDENTIFIER = 'A1000006-0006-4006-8006-000000000050';

IF NOT EXISTS (SELECT 1 FROM dbo.job_applications WHERE id = @ApplicationId)
BEGIN
    INSERT INTO dbo.job_applications (
        id, jobpostingid, candidateid, userid, employerid,
        status, stage, progress, appliedat, isactive
    )
    VALUES (
        @ApplicationId, @JobSenior1040, @CandidateId, @UserCandidate, @EmployerKpmg,
        N'under_review', 2, 40, DATEADD(day, -5, SYSUTCDATETIME()), 1
    );
END
GO

-- ── Certificate ──────────────────────────────────────────────────────────────
DECLARE @CandidateId UNIQUEIDENTIFIER = 'A1000002-0002-4002-8002-000000000010';
DECLARE @UserCandidate UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000001';
DECLARE @Assessment1040 UNIQUEIDENTIFIER = 'A1000004-0004-4004-8004-000000000030';
DECLARE @CertificateId UNIQUEIDENTIFIER = 'A1000007-0007-4007-8007-000000000060';

IF NOT EXISTS (SELECT 1 FROM dbo.certificates WHERE id = @CertificateId)
BEGIN
    INSERT INTO dbo.certificates (
        id, candidateid, userid, assessmentid, credentialid, title,
        score, percentile, level, issuedate, skillsvalidated, isvalid, isactive
    )
    VALUES (
        @CertificateId, @CandidateId, @UserCandidate, @Assessment1040,
        N'TTS-1040-2025-0001', N'1040 Individual Tax - Expert',
        92, 88, N'Expert', CAST(GETUTCDATE() AS DATE),
        N'["Form 1040","Schedule C","Multi-state"]', 1, 1
    );
END
GO

-- ── User assessment (completed attempt) ───────────────────────────────────────
DECLARE @UserCandidate UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000001';
DECLARE @Assessment1040 UNIQUEIDENTIFIER = 'A1000004-0004-4004-8004-000000000030';
DECLARE @UserAssessmentId UNIQUEIDENTIFIER = 'A1000009-0009-4009-8009-000000000080';

IF NOT EXISTS (SELECT 1 FROM dbo.user_assessments WHERE id = @UserAssessmentId)
BEGIN
    INSERT INTO dbo.user_assessments (
        id, userid, assessmentid, status, startedon, completedon, score, isactive
    )
    VALUES (
        @UserAssessmentId, @UserCandidate, @Assessment1040, N'completed',
        DATEADD(day, -7, SYSUTCDATETIME()), DATEADD(day, -7, SYSUTCDATETIME()), 92, 1
    );
END
GO

-- ── Notification ─────────────────────────────────────────────────────────────
DECLARE @UserCandidate UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000001';
DECLARE @NotificationId UNIQUEIDENTIFIER = 'A1000008-0008-4008-8008-000000000070';

IF NOT EXISTS (SELECT 1 FROM dbo.notifications WHERE id = @NotificationId)
BEGIN
    INSERT INTO dbo.notifications (id, userid, type, title, message, link, isread, isactive)
    VALUES (
        @NotificationId, @UserCandidate, N'application', N'Application under review',
        N'Your application for Senior Tax Analyst - 1040 Specialist is being reviewed by KPMG India.',
        N'/dashboard/status', 0, 1
    );
END
GO

-- ── Candidate skills ───────────────────────────────────────────────────────────
DECLARE @CandidateId UNIQUEIDENTIFIER = 'A1000002-0002-4002-8002-000000000010';

IF NOT EXISTS (SELECT 1 FROM dbo.candidate_skills WHERE candidateid = @CandidateId AND skillname = N'1040 Individual')
BEGIN
    INSERT INTO dbo.candidate_skills (candidateid, skillname, proficiency, isverified, yearsexperience, isactive)
    VALUES (@CandidateId, N'1040 Individual', N'expert', 1, 5, 1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.candidate_skills WHERE candidateid = @CandidateId AND skillname = N'1065 Partnership')
BEGIN
    INSERT INTO dbo.candidate_skills (candidateid, skillname, proficiency, isverified, yearsexperience, isactive)
    VALUES (@CandidateId, N'1065 Partnership', N'intermediate', 0, 2, 1);
END
GO

-- ── Subscription (optional) ──────────────────────────────────────────────────
DECLARE @UserCandidate UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000001';

IF NOT EXISTS (SELECT 1 FROM dbo.user_subscriptions WHERE userid = @UserCandidate)
BEGIN
    INSERT INTO dbo.user_subscriptions (userid, subscriptionplan, billingcycle, status, expiresat)
    VALUES (@UserCandidate, N'free', N'monthly', N'active', DATEADD(year, 1, SYSUTCDATETIME()));
END
GO

-- ── Skills master (reference list) ───────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM dbo.skills_master WHERE name = N'1040 Individual')
    INSERT INTO dbo.skills_master (name, category, ispredefined, usagecount, isactive)
    VALUES (N'1040 Individual', N'Tax Forms', 1, 1, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.skills_master WHERE name = N'1065 Partnership')
    INSERT INTO dbo.skills_master (name, category, ispredefined, usagecount, isactive)
    VALUES (N'1065 Partnership', N'Tax Forms', 1, 1, 1);
GO

PRINT 'Migration 006_sample_data completed.';
PRINT 'Sample candidate user: jane.candidate@taxtalent.dev (id A1000001-0001-4001-8001-000000000001)';
PRINT 'Map this user id in Entra/B2C or use API login with matching email.';
GO
