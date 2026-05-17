-- Insert sample employers using dynamic SQL (works on legacy employers schemas).
-- SQL Server validates static INSERT columns at compile time; IF/COL_LENGTH branches still fail.
-- Safe to re-run. Run after 006/007 or instead of re-running 007.

DECLARE @EmployerKpmg UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000020';
DECLARE @EmployerDeloitte UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000021';
DECLARE @UserEmployer UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000002';
DECLARE @UserDeloitte UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000004';
DECLARE @RoleEmployer UNIQUEIDENTIFIER = 'E390AD62-F385-4ACD-92A3-8F8607B0B908';

DECLARE @JobSenior1040 UNIQUEIDENTIFIER = 'A1000005-0005-4005-8005-000000000040';
DECLARE @JobTaxAssoc UNIQUEIDENTIFIER = 'A1000005-0005-4005-8005-000000000041';
DECLARE @CandidateId UNIQUEIDENTIFIER = 'A1000002-0002-4002-8002-000000000010';
DECLARE @UserCandidate UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000001';
DECLARE @ApplicationId UNIQUEIDENTIFIER = 'A1000006-0006-4006-8006-000000000050';

-- Users (company display names)
UPDATE dbo.users SET name = N'KPMG India' WHERE id = @UserEmployer;

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE id = @UserDeloitte)
BEGIN
    INSERT INTO dbo.users (id, name, email, phone, roleid, country, isactive)
    VALUES (
        @UserDeloitte, N'Deloitte USI', N'talent@deloitte.demo', N'+918765432100',
        @RoleEmployer, N'IN', 1
    );
END

-- ── Helper: dynamic INSERT into dbo.employers ───────────────────────────────
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
        RETURN;

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

DECLARE @EmployerKpmg UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000020';
DECLARE @EmployerDeloitte UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000021';
DECLARE @UserEmployer UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000002';
DECLARE @UserDeloitte UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000004';

EXEC #InsertEmployer
    @EmployerId = @EmployerKpmg,
    @UserId = @UserEmployer,
    @CompanyLabel = N'KPMG India',
    @ContactPerson = N'Priya Sharma',
    @Location = N'Mumbai, Maharashtra',
    @Industry = N'Professional Services',
    @CompanySize = N'1000+',
    @Website = N'https://kpmg.com/in';

EXEC #InsertEmployer
    @EmployerId = @EmployerDeloitte,
    @UserId = @UserDeloitte,
    @CompanyLabel = N'Deloitte USI',
    @ContactPerson = N'Michael Chen',
    @Location = N'Hyderabad, Telangana',
    @Industry = N'Professional Services',
    @CompanySize = N'1000+',
    @Website = N'https://deloitte.com';

DROP PROCEDURE #InsertEmployer;
GO

-- Jobs (only after employers exist)
DECLARE @EmployerKpmg UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000020';
DECLARE @EmployerDeloitte UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000021';
DECLARE @JobSenior1040 UNIQUEIDENTIFIER = 'A1000005-0005-4005-8005-000000000040';
DECLARE @JobTaxAssoc UNIQUEIDENTIFIER = 'A1000005-0005-4005-8005-000000000041';

IF EXISTS (SELECT 1 FROM dbo.employers WHERE id = @EmployerKpmg)
   AND NOT EXISTS (SELECT 1 FROM dbo.jobpostings WHERE id = @JobSenior1040)
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

IF EXISTS (SELECT 1 FROM dbo.employers WHERE id = @EmployerDeloitte)
   AND NOT EXISTS (SELECT 1 FROM dbo.jobpostings WHERE id = @JobTaxAssoc)
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

DECLARE @JobSenior1040 UNIQUEIDENTIFIER = 'A1000005-0005-4005-8005-000000000040';
DECLARE @CandidateId UNIQUEIDENTIFIER = 'A1000002-0002-4002-8002-000000000010';
DECLARE @UserCandidate UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000001';
DECLARE @EmployerKpmg UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000020';
DECLARE @ApplicationId UNIQUEIDENTIFIER = 'A1000006-0006-4006-8006-000000000050';

IF EXISTS (SELECT 1 FROM dbo.jobpostings WHERE id = @JobSenior1040)
   AND NOT EXISTS (SELECT 1 FROM dbo.job_applications WHERE id = @ApplicationId)
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

PRINT 'Migration 008_employers_sample_dynamic completed.';
PRINT 'Employers:';
SELECT id, userid FROM dbo.employers
WHERE id IN (
    'A1000003-0003-4003-8003-000000000020',
    'A1000003-0003-4003-8003-000000000021'
);
GO
