-- Yopmail test users + full portal sample data (idempotent).
-- Run AFTER 011_truncate_all_data (or on empty DB after 001-005 + 004 roles).
--
-- Login emails (Entra or API login by email):
--   Candidate: fifrapeupuwoi-6176@yopmail.com
--   Employer:  leihammacetou-3371@yopmail.com
--   Admin:     zigocriddoussoi-2038@yopmail.com

-- ── Role IDs (from 004_seed_default_roles.sql) ───────────────────────────────
DECLARE @RoleCandidate UNIQUEIDENTIFIER = '8B90FD0B-EB39-482F-82C0-DCF60273D3D4';
DECLARE @RoleEmployer  UNIQUEIDENTIFIER = 'E390AD62-F385-4ACD-92A3-8F8607B0B908';
DECLARE @RoleAdmin     UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM dbo.roles WHERE LOWER(name) = N'admin');

IF @RoleAdmin IS NULL
BEGIN
    RAISERROR('Admin role missing. Run migration 004_seed_default_roles.sql first.', 16, 1);
    RETURN;
END

-- ── Fixed entity IDs (use in Entra claims mapping / API tests) ─────────────────
DECLARE @UserCandidate UNIQUEIDENTIFIER = 'B2000001-0001-4001-8001-000000000001';
DECLARE @UserEmployer  UNIQUEIDENTIFIER = 'B2000001-0001-4001-8001-000000000002';
DECLARE @UserAdmin     UNIQUEIDENTIFIER = 'B2000001-0001-4001-8001-000000000003';
DECLARE @CandidateId   UNIQUEIDENTIFIER = 'B2000002-0002-4002-8002-000000000010';
DECLARE @EmployerId    UNIQUEIDENTIFIER = 'B2000003-0003-4003-8003-000000000020';
DECLARE @AssessmentId  UNIQUEIDENTIFIER = 'B2000004-0004-4004-8004-000000000030';
DECLARE @JobId         UNIQUEIDENTIFIER = 'B2000005-0005-4005-8005-000000000040';
DECLARE @ApplicationId UNIQUEIDENTIFIER = 'B2000006-0006-4006-8006-000000000050';
DECLARE @CertificateId UNIQUEIDENTIFIER = 'B2000007-0007-4007-8007-000000000060';
DECLARE @UserAssessmentId UNIQUEIDENTIFIER = 'B2000009-0009-4009-8009-000000000080';
DECLARE @AdminUserRowId UNIQUEIDENTIFIER = 'B2000011-0011-4011-8011-000000000110';
DECLARE @SavedCandId   UNIQUEIDENTIFIER = 'B2000010-0010-4010-8010-000000000100';
DECLARE @NotifEmployer UNIQUEIDENTIFIER = 'B2000012-0012-4012-8012-000000000120';
DECLARE @NotifCandidate UNIQUEIDENTIFIER = 'B2000013-0013-4013-8013-000000000130';

-- ── USERS ─────────────────────────────────────────────────────────────────────
MERGE dbo.users AS t
USING (VALUES
    (@UserCandidate, N'Fifra Candidate',   N'fifrapeupuwoi-6176@yopmail.com',  N'+919876543210', @RoleCandidate, N'IN', 1),
    (@UserEmployer,  N'Lei Hamm Recruiter', N'leihammacetou-3371@yopmail.com', N'+911234567890', @RoleEmployer,  N'IN', 1),
    (@UserAdmin,     N'Zigo Platform Admin', N'zigocriddoussoi-2038@yopmail.com', N'0000000000', @RoleAdmin, N'IN', 1)
) AS s (id, name, email, phone, roleid, country, isactive)
ON t.id = s.id
WHEN MATCHED THEN
    UPDATE SET name = s.name, email = s.email, phone = s.phone, roleid = s.roleid,
               country = s.country, isactive = s.isactive
WHEN NOT MATCHED THEN
    INSERT (id, name, email, phone, roleid, country, isactive)
    VALUES (s.id, s.name, s.email, s.phone, s.roleid, s.country, s.isactive);
GO

-- ── EMPLOYER company (dynamic SQL — legacy employers schemas lack name/email columns) ─
IF OBJECT_ID('tempdb..#InsertEmployer') IS NOT NULL DROP PROCEDURE #InsertEmployer;
GO

CREATE PROCEDURE #InsertEmployer
    @EmployerId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER = NULL,
    @CompanyLabel NVARCHAR(255) = NULL,
    @ContactPerson NVARCHAR(255) = NULL,
    @Location NVARCHAR(500) = NULL,
    @Industry NVARCHAR(100) = NULL,
    @CompanySize NVARCHAR(50) = NULL,
    @Website NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.employers WHERE id = @EmployerId)
    BEGIN
        IF COL_LENGTH('dbo.employers', 'userid') IS NOT NULL AND @UserId IS NOT NULL
        BEGIN
            DECLARE @upd NVARCHAR(MAX) = N'UPDATE dbo.employers SET userid = @uid';
            IF COL_LENGTH('dbo.employers', 'isactive') IS NOT NULL SET @upd += N', isactive = 1';
            IF COL_LENGTH('dbo.employers', 'status') IS NOT NULL SET @upd += N', status = N''active''';
            SET @upd += N' WHERE id = @eid';
            EXEC sp_executesql @upd,
                N'@uid UNIQUEIDENTIFIER, @eid UNIQUEIDENTIFIER',
                @uid = @UserId, @eid = @EmployerId;
        END
        RETURN;
    END

    DECLARE @cols NVARCHAR(MAX) = N'id';
    DECLARE @vals NVARCHAR(MAX) = N'''' + CAST(@EmployerId AS NVARCHAR(36)) + N'''';
    DECLARE @q NVARCHAR(MAX);

    IF COL_LENGTH('dbo.employers', 'userid') IS NOT NULL
    BEGIN
        SET @cols += N',userid';
        SET @vals += CASE WHEN @UserId IS NULL THEN N',NULL'
            ELSE N',''' + CAST(@UserId AS NVARCHAR(36)) + N'''' END;
    END

    IF COL_LENGTH('dbo.employers', 'name') IS NOT NULL
    BEGIN
        SET @cols += N',name';
        SET @q = REPLACE(ISNULL(@CompanyLabel, N''), '''', '''''');
        SET @vals += N',N''' + @q + N'''';
    END
    ELSE IF COL_LENGTH('dbo.employers', 'companyname') IS NOT NULL
    BEGIN
        SET @cols += N',companyname';
        SET @q = REPLACE(ISNULL(@CompanyLabel, N''), '''', '''''');
        SET @vals += N',N''' + @q + N'''';
    END
    ELSE IF COL_LENGTH('dbo.employers', 'company_name') IS NOT NULL
    BEGIN
        SET @cols += N',company_name';
        SET @q = REPLACE(ISNULL(@CompanyLabel, N''), '''', '''''');
        SET @vals += N',N''' + @q + N'''';
    END

    IF COL_LENGTH('dbo.employers', 'contactperson') IS NOT NULL
    BEGIN
        SET @cols += N',contactperson';
        SET @q = REPLACE(ISNULL(@ContactPerson, N''), '''', '''''');
        SET @vals += N',N''' + @q + N'''';
    END

    IF COL_LENGTH('dbo.employers', 'location') IS NOT NULL
    BEGIN
        SET @cols += N',location';
        SET @q = REPLACE(ISNULL(@Location, N''), '''', '''''');
        SET @vals += N',N''' + @q + N'''';
    END

    IF COL_LENGTH('dbo.employers', 'industry') IS NOT NULL
    BEGIN
        SET @cols += N',industry';
        SET @q = REPLACE(ISNULL(@Industry, N''), '''', '''''');
        SET @vals += N',N''' + @q + N'''';
    END

    IF COL_LENGTH('dbo.employers', 'companysize') IS NOT NULL
    BEGIN
        SET @cols += N',companysize';
        SET @q = REPLACE(ISNULL(@CompanySize, N''), '''', '''''');
        SET @vals += N',N''' + @q + N'''';
    END

    IF COL_LENGTH('dbo.employers', 'website') IS NOT NULL
    BEGIN
        SET @cols += N',website';
        SET @q = REPLACE(ISNULL(@Website, N''), '''', '''''');
        SET @vals += N',N''' + @q + N'''';
    END

    IF COL_LENGTH('dbo.employers', 'isactive') IS NOT NULL
    BEGIN
        SET @cols += N',isactive';
        SET @vals += N',1';
    END

    IF COL_LENGTH('dbo.employers', 'status') IS NOT NULL
    BEGIN
        SET @cols += N',status';
        SET @vals += N',N''active''';
    END

    DECLARE @sql NVARCHAR(MAX) =
        N'INSERT INTO dbo.employers (' + @cols + N') VALUES (' + @vals + N')';
    EXEC sp_executesql @sql;
END
GO

DECLARE @UserEmployer UNIQUEIDENTIFIER = 'B2000001-0001-4001-8001-000000000002';
DECLARE @EmployerId   UNIQUEIDENTIFIER = 'B2000003-0003-4003-8003-000000000020';

EXEC #InsertEmployer
    @EmployerId = @EmployerId,
    @UserId = @UserEmployer,
    @CompanyLabel = N'Tax Talent Demo Corp',
    @ContactPerson = N'Lei Hamm',
    @Location = N'Mumbai, Maharashtra',
    @Industry = N'Professional Services',
    @CompanySize = N'100-500',
    @Website = N'https://taxtalent.demo';

DROP PROCEDURE #InsertEmployer;
GO

-- Company display name on users (legacy DB stores email on users, not employers)
UPDATE dbo.users SET name = N'Tax Talent Demo Corp'
WHERE id = 'B2000001-0001-4001-8001-000000000002';
GO

-- ── user_employers (required for employer portal) ─────────────────────────────
DECLARE @UserEmployer UNIQUEIDENTIFIER = 'B2000001-0001-4001-8001-000000000002';
DECLARE @EmployerId   UNIQUEIDENTIFIER = 'B2000003-0003-4003-8003-000000000020';

IF EXISTS (SELECT 1 FROM dbo.employers WHERE id = @EmployerId)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.user_employers WHERE userid = @UserEmployer AND employerid = @EmployerId)
        INSERT INTO dbo.user_employers (userid, employerid, isactive)
        VALUES (@UserEmployer, @EmployerId, 1);
    ELSE
        UPDATE dbo.user_employers SET isactive = 1 WHERE userid = @UserEmployer AND employerid = @EmployerId;
END
ELSE
    PRINT 'WARNING: Employer row was not created — skip user_employers, jobs, and employer FK data.';
GO

-- ── admin_users (required for admin portal stats) ─────────────────────────────
DECLARE @UserAdmin UNIQUEIDENTIFIER = 'B2000001-0001-4001-8001-000000000003';
DECLARE @AdminUserRowId UNIQUEIDENTIFIER = 'B2000011-0011-4011-8011-000000000110';

IF NOT EXISTS (SELECT 1 FROM dbo.admin_users WHERE userid = @UserAdmin)
    INSERT INTO dbo.admin_users (id, userid, role, status, isactive)
    VALUES (@AdminUserRowId, @UserAdmin, N'super_admin', N'active', 1);
ELSE
    UPDATE dbo.admin_users SET isactive = 1, status = N'active', role = N'super_admin' WHERE userid = @UserAdmin;
GO

-- ── CANDIDATE profile ─────────────────────────────────────────────────────────
DECLARE @UserCandidate UNIQUEIDENTIFIER = 'B2000001-0001-4001-8001-000000000001';
DECLARE @CandidateId   UNIQUEIDENTIFIER = 'B2000002-0002-4002-8002-000000000010';

IF NOT EXISTS (SELECT 1 FROM dbo.candidates WHERE id = @CandidateId)
BEGIN
    INSERT INTO dbo.candidates (
        id, userid, currenttitle, headline, summary, experienceyrs, taxexpertise,
        hourlyrate, availability, workmode, location, status, profilecompleteness, rating, isactive
    )
    VALUES (
        @CandidateId, @UserCandidate,
        N'Senior US Tax Analyst', N'1040 & Schedule C Specialist',
        N'5+ years preparing US individual and small-business returns for Big 4 clients.',
        5, N'["1040 Individual","Schedule C","Multi-state","Form 1065"]',
        2200, N'immediate', N'hybrid',
        N'{"city":"Mumbai","state":"Maharashtra","country":"IN"}',
        N'approved', 85, 4.5, 1
    );
END
ELSE
    UPDATE dbo.candidates SET userid = @UserCandidate, status = N'approved', isactive = 1 WHERE id = @CandidateId;
GO

-- ── Candidate skills ────────────────────────────────────────────────────────────
DECLARE @CandidateId UNIQUEIDENTIFIER = 'B2000002-0002-4002-8002-000000000010';

IF NOT EXISTS (SELECT 1 FROM dbo.candidate_skills WHERE candidateid = @CandidateId AND skillname = N'1040 Individual')
    INSERT INTO dbo.candidate_skills (candidateid, skillname, proficiency, isverified, yearsexperience, isactive)
    VALUES (@CandidateId, N'1040 Individual', N'expert', 1, 5, 1);
GO

-- ── Assessment catalog ────────────────────────────────────────────────────────
DECLARE @AssessmentId UNIQUEIDENTIFIER = 'B2000004-0004-4004-8004-000000000030';

IF NOT EXISTS (SELECT 1 FROM dbo.assessments WHERE id = @AssessmentId)
    INSERT INTO dbo.assessments (
        id, title, category, difficultylevel, numberofquestions, durationminutes,
        passingscore, description, isactive
    )
    VALUES (
        @AssessmentId, N'1040 Individual Tax - Expert', N'Individual Tax', N'advanced',
        25, 45, 80, N'Validate 1040 preparation skills for US individual clients.', 1
    );

IF COL_LENGTH('dbo.assessments', 'status') IS NOT NULL
    UPDATE dbo.assessments SET status = N'active' WHERE id = @AssessmentId;
GO

-- ── Job posting (employer) ─────────────────────────────────────────────────────
DECLARE @JobId      UNIQUEIDENTIFIER = 'B2000005-0005-4005-8005-000000000040';
DECLARE @EmployerId UNIQUEIDENTIFIER = 'B2000003-0003-4003-8003-000000000020';

IF EXISTS (SELECT 1 FROM dbo.employers WHERE id = @EmployerId)
   AND NOT EXISTS (SELECT 1 FROM dbo.jobpostings WHERE id = @JobId)
    INSERT INTO dbo.jobpostings (
        id, jobtitle, employerid, location, jobtype, experiencelevel, category,
        minsalary, maxsalary, closingdate, jobdescription,
        requirements, responsibilities, benefits, isactive
    )
    VALUES (
        @JobId, N'Senior Tax Analyst - 1040 Specialist', @EmployerId,
        N'Mumbai, Maharashtra', N'full-time', N'mid', N'Individual Tax',
        1200000, 1800000, DATEADD(month, 2, CAST(GETUTCDATE() AS DATE)),
        N'Prepare and review complex US individual tax returns.',
        N'["3+ years 1040","Schedule C/D","CPA preferred"]',
        N'["Prepare returns","Review workpapers","Client calls"]',
        N'["Health insurance","US tax training"]',
        1
    );

IF COL_LENGTH('dbo.jobpostings', 'status') IS NOT NULL
    UPDATE dbo.jobpostings SET status = N'active' WHERE id = @JobId;
GO

-- ── Job application (candidate applied to employer job) ─────────────────────────
DECLARE @JobId         UNIQUEIDENTIFIER = 'B2000005-0005-4005-8005-000000000040';
DECLARE @CandidateId   UNIQUEIDENTIFIER = 'B2000002-0002-4002-8002-000000000010';
DECLARE @UserCandidate UNIQUEIDENTIFIER = 'B2000001-0001-4001-8001-000000000001';
DECLARE @EmployerId    UNIQUEIDENTIFIER = 'B2000003-0003-4003-8003-000000000020';
DECLARE @ApplicationId UNIQUEIDENTIFIER = 'B2000006-0006-4006-8006-000000000050';

IF EXISTS (SELECT 1 FROM dbo.jobpostings WHERE id = @JobId)
   AND NOT EXISTS (SELECT 1 FROM dbo.job_applications WHERE id = @ApplicationId)
    INSERT INTO dbo.job_applications (
        id, jobpostingid, candidateid, userid, employerid,
        status, stage, progress, appliedat, isactive
    )
    VALUES (
        @ApplicationId, @JobId, @CandidateId, @UserCandidate, @EmployerId,
        N'under_review', 2, 40, DATEADD(day, -3, SYSUTCDATETIME()), 1
    );
GO

-- ── Certificate + completed assessment ─────────────────────────────────────────
DECLARE @UserCandidate    UNIQUEIDENTIFIER = 'B2000001-0001-4001-8001-000000000001';
DECLARE @CandidateId      UNIQUEIDENTIFIER = 'B2000002-0002-4002-8002-000000000010';
DECLARE @AssessmentId     UNIQUEIDENTIFIER = 'B2000004-0004-4004-8004-000000000030';
DECLARE @CertificateId    UNIQUEIDENTIFIER = 'B2000007-0007-4007-8007-000000000060';
DECLARE @UserAssessmentId UNIQUEIDENTIFIER = 'B2000009-0009-4009-8009-000000000080';

IF NOT EXISTS (SELECT 1 FROM dbo.user_assessments WHERE id = @UserAssessmentId)
    INSERT INTO dbo.user_assessments (
        id, userid, assessmentid, status, startedon, completedon, score, isactive
    )
    VALUES (
        @UserAssessmentId, @UserCandidate, @AssessmentId, N'completed',
        DATEADD(day, -7, SYSUTCDATETIME()), DATEADD(day, -7, SYSUTCDATETIME()), 88, 1
    );

IF NOT EXISTS (SELECT 1 FROM dbo.certificates WHERE id = @CertificateId)
    INSERT INTO dbo.certificates (
        id, candidateid, userid, assessmentid, credentialid, title,
        score, percentile, level, issuedate, skillsvalidated, isvalid, isactive
    )
    VALUES (
        @CertificateId, @CandidateId, @UserCandidate, @AssessmentId,
        N'TTS-1040-YOP-0001', N'1040 Individual Tax - Expert',
        88, 85, N'Expert', CAST(GETUTCDATE() AS DATE),
        N'["Form 1040","Schedule C"]', 1, 1
    );
GO

-- ── Saved candidate (employer shortlist) ─────────────────────────────────────────
DECLARE @EmployerId  UNIQUEIDENTIFIER = 'B2000003-0003-4003-8003-000000000020';
DECLARE @CandidateId UNIQUEIDENTIFIER = 'B2000002-0002-4002-8002-000000000010';
DECLARE @UserEmployer UNIQUEIDENTIFIER = 'B2000001-0001-4001-8001-000000000002';
DECLARE @SavedCandId UNIQUEIDENTIFIER = 'B2000010-0010-4010-8010-000000000100';

IF EXISTS (SELECT 1 FROM dbo.employers WHERE id = @EmployerId)
   AND EXISTS (SELECT 1 FROM dbo.candidates WHERE id = @CandidateId)
   AND NOT EXISTS (SELECT 1 FROM dbo.saved_candidates WHERE employerid = @EmployerId AND candidateid = @CandidateId)
    INSERT INTO dbo.saved_candidates (id, employerid, candidateid, savedby, folder, notes, isactive)
    VALUES (@SavedCandId, @EmployerId, @CandidateId, @UserEmployer, N'Shortlist', N'Yopmail test shortlist', 1);
GO

-- ── Profile views ───────────────────────────────────────────────────────────────
DECLARE @EmployerId   UNIQUEIDENTIFIER = 'B2000003-0003-4003-8003-000000000020';
DECLARE @CandidateId  UNIQUEIDENTIFIER = 'B2000002-0002-4002-8002-000000000010';
DECLARE @UserEmployer UNIQUEIDENTIFIER = 'B2000001-0001-4001-8001-000000000002';

IF EXISTS (SELECT 1 FROM dbo.employers WHERE id = @EmployerId)
   AND EXISTS (SELECT 1 FROM dbo.candidates WHERE id = @CandidateId)
   AND (SELECT COUNT(*) FROM dbo.profile_views WHERE candidateid = @CandidateId) < 3
BEGIN
    INSERT INTO dbo.profile_views (candidateid, employerid, vieweruserid, viewtype, source, viewedat)
    VALUES
        (@CandidateId, @EmployerId, @UserEmployer, N'full', N'talent_search', DATEADD(day, -2, SYSUTCDATETIME())),
        (@CandidateId, @EmployerId, @UserEmployer, N'quick', N'talent_search', DATEADD(day, -1, SYSUTCDATETIME())),
        (@CandidateId, @EmployerId, @UserEmployer, N'full', N'candidate_profile', SYSUTCDATETIME());
END
GO

-- ── Notifications ───────────────────────────────────────────────────────────────
DECLARE @UserEmployer   UNIQUEIDENTIFIER = 'B2000001-0001-4001-8001-000000000002';
DECLARE @UserCandidate  UNIQUEIDENTIFIER = 'B2000001-0001-4001-8001-000000000001';
DECLARE @NotifEmployer  UNIQUEIDENTIFIER = 'B2000012-0012-4012-8012-000000000120';
DECLARE @NotifCandidate UNIQUEIDENTIFIER = 'B2000013-0013-4013-8013-000000000130';

IF NOT EXISTS (SELECT 1 FROM dbo.notifications WHERE id = @NotifEmployer)
    INSERT INTO dbo.notifications (id, userid, type, title, message, link, isread, isactive)
    VALUES (
        @NotifEmployer, @UserEmployer, N'application', N'Application under review',
        N'Fifra Candidate applied for Senior Tax Analyst - 1040 Specialist.', N'/employer/applications', 0, 1
    );

IF NOT EXISTS (SELECT 1 FROM dbo.notifications WHERE id = @NotifCandidate)
    INSERT INTO dbo.notifications (id, userid, type, title, message, link, isread, isactive)
    VALUES (
        @NotifCandidate, @UserCandidate, N'application', N'Application status update',
        N'Your application is under review by Tax Talent Demo Corp.', N'/dashboard/status', 0, 1
    );
GO

-- ── Subscription (candidate) ────────────────────────────────────────────────────
DECLARE @UserCandidate UNIQUEIDENTIFIER = 'B2000001-0001-4001-8001-000000000001';

IF NOT EXISTS (SELECT 1 FROM dbo.user_subscriptions WHERE userid = @UserCandidate)
    INSERT INTO dbo.user_subscriptions (userid, subscriptionplan, billingcycle, status, expiresat)
    VALUES (@UserCandidate, N'free', N'monthly', N'active', DATEADD(year, 1, SYSUTCDATETIME()));
GO

PRINT '=== Yopmail test data ready ===';
PRINT 'Candidate: fifrapeupuwoi-6176@yopmail.com  user id B2000001-0001-4001-8001-000000000001';
PRINT 'Employer:  leihammacetou-3371@yopmail.com   user id B2000001-0001-4001-8001-000000000002';
PRINT 'Admin:     zigocriddoussoi-2038@yopmail.com  user id B2000001-0001-4001-8001-000000000003';
IF EXISTS (SELECT 1 FROM dbo.employers WHERE id = 'B2000003-0003-4003-8003-000000000020')
    PRINT 'Employer company B2000003-...0020 OK — jobs/applications/shortlist seeded.';
ELSE
    PRINT 'ERROR: Employer B2000003-...0020 missing — re-run this script after 011_truncate_all_data.sql';
SELECT id, userid FROM dbo.employers WHERE id = 'B2000003-0003-4003-8003-000000000020';
GO
