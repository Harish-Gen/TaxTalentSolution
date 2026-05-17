-- Portal scenario seed data: admin_users, saved_candidates, profile_views,
-- employer notifications, application history, second candidate/application.
-- Idempotent. Run after 006-009.

DECLARE @UserCandidate   UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000001';
DECLARE @UserEmployer    UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000002';
DECLARE @UserAdmin       UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000003';
DECLARE @CandidateId     UNIQUEIDENTIFIER = 'A1000002-0002-4002-8002-000000000010';
DECLARE @EmployerKpmg    UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000020';
DECLARE @JobSenior1040   UNIQUEIDENTIFIER = 'A1000005-0005-4005-8005-000000000040';
DECLARE @ApplicationId   UNIQUEIDENTIFIER = 'A1000006-0006-4006-8006-000000000050';
DECLARE @RoleCandidate   UNIQUEIDENTIFIER = '8B90FD0B-EB39-482F-82C0-DCF60273D3D4';

DECLARE @AdminUserRowId  UNIQUEIDENTIFIER = 'A1000011-0011-4011-8011-000000000110';
DECLARE @SavedCandId     UNIQUEIDENTIFIER = 'A1000010-0010-4010-8010-000000000100';
DECLARE @NotifRecruiter  UNIQUEIDENTIFIER = 'A1000012-0012-4012-8012-000000000120';
DECLARE @AppShortlistId  UNIQUEIDENTIFIER = 'A1000013-0013-4013-8013-000000000130';
DECLARE @UserCandidate2  UNIQUEIDENTIFIER = 'A1000015-0015-4015-8015-000000000150';
DECLARE @Candidate2Id    UNIQUEIDENTIFIER = 'A1000014-0014-4014-8014-000000000140';
DECLARE @StatusHistId    UNIQUEIDENTIFIER = 'A1000016-0016-4016-8016-000000000160';

-- ── Admin portal: link platform admin user ───────────────────────────────────
IF EXISTS (SELECT 1 FROM dbo.users WHERE id = @UserAdmin)
   AND NOT EXISTS (SELECT 1 FROM dbo.admin_users WHERE userid = @UserAdmin)
BEGIN
    INSERT INTO dbo.admin_users (id, userid, role, status, isactive)
    VALUES (@AdminUserRowId, @UserAdmin, N'super_admin', N'active', 1);
END
ELSE IF EXISTS (SELECT 1 FROM dbo.admin_users WHERE userid = @UserAdmin)
BEGIN
    UPDATE dbo.admin_users SET isactive = 1, status = N'active' WHERE userid = @UserAdmin;
END
GO

-- ── Second approved candidate (richer talent search) ───────────────────────────
DECLARE @UserCandidate2 UNIQUEIDENTIFIER = 'A1000015-0015-4015-8015-000000000150';
DECLARE @Candidate2Id   UNIQUEIDENTIFIER = 'A1000014-0014-4014-8014-000000000140';
DECLARE @RoleCandidate  UNIQUEIDENTIFIER = '8B90FD0B-EB39-482F-82C0-DCF60273D3D4';

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE id = @UserCandidate2)
BEGIN
    INSERT INTO dbo.users (id, name, email, phone, roleid, country, isactive)
    VALUES (
        @UserCandidate2, N'Raj Patel', N'raj.patel@taxtalent.dev', N'+919988776655',
        @RoleCandidate, N'IN', 1
    );
END
GO

DECLARE @UserCandidate2 UNIQUEIDENTIFIER = 'A1000015-0015-4015-8015-000000000150';
DECLARE @Candidate2Id   UNIQUEIDENTIFIER = 'A1000014-0014-4014-8014-000000000140';

IF NOT EXISTS (SELECT 1 FROM dbo.candidates WHERE id = @Candidate2Id)
BEGIN
    INSERT INTO dbo.candidates (
        id, userid, currenttitle, experienceyrs, taxexpertise, hourlyrate,
        availability, workmode, location, status, isactive
    )
    VALUES (
        @Candidate2Id, @UserCandidate2, N'Partnership Tax Specialist', 4,
        N'["1065 Partnership","Form 1120","K-1 Reporting"]',
        2500, N'2_weeks', N'hybrid',
        N'{"city":"Bangalore","state":"Karnataka","country":"IN"}',
        N'approved', 1
    );
END
GO

-- ── Saved candidate (KPMG shortlists Jane) ─────────────────────────────────────
DECLARE @EmployerKpmg UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000020';
DECLARE @CandidateId  UNIQUEIDENTIFIER = 'A1000002-0002-4002-8002-000000000010';
DECLARE @UserEmployer UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000002';
DECLARE @SavedCandId  UNIQUEIDENTIFIER = 'A1000010-0010-4010-8010-000000000100';

IF EXISTS (SELECT 1 FROM dbo.employers WHERE id = @EmployerKpmg)
   AND EXISTS (SELECT 1 FROM dbo.candidates WHERE id = @CandidateId)
   AND NOT EXISTS (
       SELECT 1 FROM dbo.saved_candidates
       WHERE employerid = @EmployerKpmg AND candidateid = @CandidateId
   )
BEGIN
    INSERT INTO dbo.saved_candidates (id, employerid, candidateid, savedby, folder, notes, isactive)
    VALUES (
        @SavedCandId, @EmployerKpmg, @CandidateId, @UserEmployer,
        N'Shortlist', N'Strong 1040 profile — sample shortlist', 1
    );
END
ELSE IF EXISTS (
    SELECT 1 FROM dbo.saved_candidates
    WHERE employerid = @EmployerKpmg AND candidateid = @CandidateId
)
BEGIN
    UPDATE dbo.saved_candidates SET isactive = 1, folder = N'Shortlist'
    WHERE employerid = @EmployerKpmg AND candidateid = @CandidateId;
END
GO

-- ── Profile views (Jane viewed by KPMG recruiters) ─────────────────────────────
DECLARE @EmployerKpmg UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000020';
DECLARE @CandidateId  UNIQUEIDENTIFIER = 'A1000002-0002-4002-8002-000000000010';
DECLARE @UserEmployer UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000002';
DECLARE @Candidate2Id UNIQUEIDENTIFIER = 'A1000014-0014-4014-8014-000000000140';

IF EXISTS (SELECT 1 FROM dbo.candidates WHERE id = @CandidateId)
   AND (SELECT COUNT(*) FROM dbo.profile_views WHERE candidateid = @CandidateId) < 5
BEGIN
    INSERT INTO dbo.profile_views (candidateid, employerid, vieweruserid, viewtype, source, viewedat)
    VALUES
        (@CandidateId, @EmployerKpmg, @UserEmployer, N'full', N'talent_search', DATEADD(day, -6, SYSUTCDATETIME())),
        (@CandidateId, @EmployerKpmg, @UserEmployer, N'quick', N'talent_search', DATEADD(day, -4, SYSUTCDATETIME())),
        (@CandidateId, @EmployerKpmg, @UserEmployer, N'full', N'employer_portal', DATEADD(day, -2, SYSUTCDATETIME())),
        (@CandidateId, @EmployerKpmg, NULL, N'quick', N'talent_search', DATEADD(day, -1, SYSUTCDATETIME())),
        (@CandidateId, @EmployerKpmg, @UserEmployer, N'full', N'candidate_profile', SYSUTCDATETIME());
END

IF EXISTS (SELECT 1 FROM dbo.candidates WHERE id = @Candidate2Id)
   AND NOT EXISTS (SELECT 1 FROM dbo.profile_views WHERE candidateid = @Candidate2Id)
BEGIN
    INSERT INTO dbo.profile_views (candidateid, employerid, vieweruserid, viewtype, source, viewedat)
    VALUES (@Candidate2Id, @EmployerKpmg, @UserEmployer, N'full', N'talent_search', DATEADD(day, -3, SYSUTCDATETIME()));
END
GO

-- ── Employer recruiter notifications ───────────────────────────────────────────
DECLARE @UserEmployer   UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000002';
DECLARE @NotifRecruiter UNIQUEIDENTIFIER = 'A1000012-0012-4012-8012-000000000120';

IF NOT EXISTS (SELECT 1 FROM dbo.notifications WHERE id = @NotifRecruiter)
BEGIN
    INSERT INTO dbo.notifications (id, userid, type, title, message, link, isread, isactive)
    VALUES (
        @NotifRecruiter, @UserEmployer, N'application',
        N'New application received',
        N'Jane Doe applied for Senior Tax Analyst - 1040 Specialist.',
        N'/employer/applications', 0, 1
    );
END
GO

-- ── Application status history ─────────────────────────────────────────────────
DECLARE @ApplicationId UNIQUEIDENTIFIER = 'A1000006-0006-4006-8006-000000000050';
DECLARE @UserEmployer  UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000002';
DECLARE @StatusHistId  UNIQUEIDENTIFIER = 'A1000016-0016-4016-8016-000000000160';

IF EXISTS (SELECT 1 FROM dbo.job_applications WHERE id = @ApplicationId)
   AND NOT EXISTS (SELECT 1 FROM dbo.application_status_history WHERE id = @StatusHistId)
BEGIN
    INSERT INTO dbo.application_status_history (id, applicationid, status, action, performedby, notes)
    VALUES
        (@StatusHistId, @ApplicationId, N'submitted', N'Application submitted', @UserEmployer, N'Sample history'),
        (NEWID(), @ApplicationId, N'under_review', N'Moved to under review', @UserEmployer, N'Recruiter review started');
END
GO

-- ── Second application (shortlisted — dashboard interview count) ───────────────
DECLARE @JobSenior1040  UNIQUEIDENTIFIER = 'A1000005-0005-4005-8005-000000000040';
DECLARE @Candidate2Id   UNIQUEIDENTIFIER = 'A1000014-0014-4014-8014-000000000140';
DECLARE @UserCandidate2 UNIQUEIDENTIFIER = 'A1000015-0015-4015-8015-000000000150';
DECLARE @EmployerKpmg   UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000020';
DECLARE @AppShortlistId UNIQUEIDENTIFIER = 'A1000013-0013-4013-8013-000000000130';

IF EXISTS (SELECT 1 FROM dbo.jobpostings WHERE id = @JobSenior1040)
   AND EXISTS (SELECT 1 FROM dbo.candidates WHERE id = @Candidate2Id)
   AND NOT EXISTS (SELECT 1 FROM dbo.job_applications WHERE id = @AppShortlistId)
BEGIN
    INSERT INTO dbo.job_applications (
        id, jobpostingid, candidateid, userid, employerid,
        status, stage, progress, appliedat, isactive
    )
    VALUES (
        @AppShortlistId, @JobSenior1040, @Candidate2Id, @UserCandidate2, @EmployerKpmg,
        N'shortlisted', 3, 60, DATEADD(day, -2, SYSUTCDATETIME()), 1
    );
END
GO

PRINT 'Migration 010_portal_scenarios completed.';
PRINT 'Admin: admin@taxtalent.dev linked in admin_users.';
PRINT 'Employer: recruiter@kpmg.demo — saved candidate, profile views, notifications.';
PRINT 'Extra candidate: raj.patel@taxtalent.dev (approved).';
GO
