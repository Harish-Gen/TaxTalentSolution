-- Extended platform tables (frontend schema; API repos to be added later).
-- Uses TTS API naming (lowercase columns). References jobpostings (not jobs).

IF OBJECT_ID(N'dbo.candidate_skills', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.candidate_skills (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_candidate_skills PRIMARY KEY DEFAULT NEWID(),
        candidateid UNIQUEIDENTIFIER NOT NULL,
        skillname NVARCHAR(255) NOT NULL,
        proficiency NVARCHAR(50) NULL CONSTRAINT DF_candidate_skills_proficiency DEFAULT N'intermediate',
        isverified BIT NOT NULL CONSTRAINT DF_candidate_skills_isverified DEFAULT 0,
        yearsexperience INT NULL CONSTRAINT DF_candidate_skills_yearsexperience DEFAULT 0,
        verifieddate DATETIME2 NULL,
        isactive BIT NOT NULL CONSTRAINT DF_candidate_skills_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_candidate_skills_createdon DEFAULT SYSUTCDATETIME(),
        createdby NVARCHAR(255) NULL,
        modifiedon DATETIME2 NULL,
        modifiedby NVARCHAR(255) NULL,
        CONSTRAINT FK_candidate_skills_candidates FOREIGN KEY (candidateid) REFERENCES dbo.candidates (id)
    );
    CREATE INDEX IX_candidate_skills_candidateid ON dbo.candidate_skills (candidateid);
END
GO

IF OBJECT_ID(N'dbo.candidate_experience', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.candidate_experience (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_candidate_experience PRIMARY KEY DEFAULT NEWID(),
        candidateid UNIQUEIDENTIFIER NOT NULL,
        companyname NVARCHAR(255) NOT NULL,
        position NVARCHAR(255) NOT NULL,
        location NVARCHAR(255) NULL,
        startdate DATE NOT NULL,
        enddate DATE NULL,
        iscurrent BIT NOT NULL CONSTRAINT DF_candidate_experience_iscurrent DEFAULT 0,
        description NVARCHAR(MAX) NULL,
        achievements NVARCHAR(MAX) NULL,
        displayorder INT NOT NULL CONSTRAINT DF_candidate_experience_displayorder DEFAULT 0,
        isactive BIT NOT NULL CONSTRAINT DF_candidate_experience_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_candidate_experience_createdon DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_candidate_experience_candidates FOREIGN KEY (candidateid) REFERENCES dbo.candidates (id)
    );
END
GO

IF OBJECT_ID(N'dbo.candidate_education', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.candidate_education (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_candidate_education PRIMARY KEY DEFAULT NEWID(),
        candidateid UNIQUEIDENTIFIER NOT NULL,
        institution NVARCHAR(255) NOT NULL,
        degree NVARCHAR(255) NOT NULL,
        fieldofstudy NVARCHAR(255) NULL,
        startdate DATE NULL,
        enddate DATE NULL,
        description NVARCHAR(MAX) NULL,
        displayorder INT NOT NULL CONSTRAINT DF_candidate_education_displayorder DEFAULT 0,
        isactive BIT NOT NULL CONSTRAINT DF_candidate_education_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_candidate_education_createdon DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_candidate_education_candidates FOREIGN KEY (candidateid) REFERENCES dbo.candidates (id)
    );
END
GO

IF OBJECT_ID(N'dbo.candidate_competencies', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.candidate_competencies (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_candidate_competencies PRIMARY KEY DEFAULT NEWID(),
        candidateid UNIQUEIDENTIFIER NOT NULL,
        formtype NVARCHAR(100) NOT NULL,
        proficiencylevel NVARCHAR(50) NULL,
        isactive BIT NOT NULL CONSTRAINT DF_candidate_competencies_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_candidate_competencies_createdon DEFAULT SYSUTCDATETIME(),
        modifiedon DATETIME2 NULL,
        CONSTRAINT FK_candidate_competencies_candidates FOREIGN KEY (candidateid) REFERENCES dbo.candidates (id),
        CONSTRAINT UQ_candidate_competencies_candidate_form UNIQUE (candidateid, formtype)
    );
END
GO

IF OBJECT_ID(N'dbo.candidate_responsibilities', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.candidate_responsibilities (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_candidate_responsibilities PRIMARY KEY DEFAULT NEWID(),
        candidateid UNIQUEIDENTIFIER NOT NULL,
        responsibilitytype NVARCHAR(255) NOT NULL,
        percentage INT NULL,
        description NVARCHAR(MAX) NULL,
        isactive BIT NOT NULL CONSTRAINT DF_candidate_responsibilities_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_candidate_responsibilities_createdon DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_candidate_responsibilities_candidates FOREIGN KEY (candidateid) REFERENCES dbo.candidates (id)
    );
END
GO

IF OBJECT_ID(N'dbo.job_applications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.job_applications (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_job_applications PRIMARY KEY DEFAULT NEWID(),
        jobpostingid UNIQUEIDENTIFIER NOT NULL,
        candidateid UNIQUEIDENTIFIER NOT NULL,
        userid UNIQUEIDENTIFIER NULL,
        employerid UNIQUEIDENTIFIER NOT NULL,
        coverletter NVARCHAR(MAX) NULL,
        resumeurl NVARCHAR(1000) NULL,
        currentcompensation FLOAT NULL,
        expectedcompensation FLOAT NULL,
        status NVARCHAR(50) NOT NULL CONSTRAINT DF_job_applications_status DEFAULT N'submitted',
        stage INT NOT NULL CONSTRAINT DF_job_applications_stage DEFAULT 1,
        progress INT NOT NULL CONSTRAINT DF_job_applications_progress DEFAULT 20,
        appliedat DATETIME2 NOT NULL CONSTRAINT DF_job_applications_appliedat DEFAULT SYSUTCDATETIME(),
        reviewedat DATETIME2 NULL,
        reviewedby UNIQUEIDENTIFIER NULL,
        rejectionreason NVARCHAR(MAX) NULL,
        notes NVARCHAR(MAX) NULL,
        isactive BIT NOT NULL CONSTRAINT DF_job_applications_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_job_applications_createdon DEFAULT SYSUTCDATETIME(),
        createdby NVARCHAR(255) NULL,
        modifiedon DATETIME2 NULL,
        modifiedby NVARCHAR(255) NULL,
        CONSTRAINT FK_job_applications_jobpostings FOREIGN KEY (jobpostingid) REFERENCES dbo.jobpostings (id),
        CONSTRAINT FK_job_applications_candidates FOREIGN KEY (candidateid) REFERENCES dbo.candidates (id),
        CONSTRAINT FK_job_applications_employers FOREIGN KEY (employerid) REFERENCES dbo.employers (id),
        CONSTRAINT FK_job_applications_users FOREIGN KEY (userid) REFERENCES dbo.users (id),
        CONSTRAINT UQ_job_applications_job_candidate UNIQUE (jobpostingid, candidateid)
    );
    CREATE INDEX IX_job_applications_candidateid ON dbo.job_applications (candidateid);
    CREATE INDEX IX_job_applications_jobpostingid ON dbo.job_applications (jobpostingid);
    CREATE INDEX IX_job_applications_status ON dbo.job_applications (status);
END
GO

IF OBJECT_ID(N'dbo.application_status_history', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.application_status_history (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_application_status_history PRIMARY KEY DEFAULT NEWID(),
        applicationid UNIQUEIDENTIFIER NOT NULL,
        status NVARCHAR(100) NOT NULL,
        action NVARCHAR(255) NOT NULL,
        performedby UNIQUEIDENTIFIER NULL,
        notes NVARCHAR(MAX) NULL,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_application_status_history_createdon DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_application_status_history_applications FOREIGN KEY (applicationid) REFERENCES dbo.job_applications (id)
    );
END
GO

IF OBJECT_ID(N'dbo.certificates', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.certificates (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_certificates PRIMARY KEY DEFAULT NEWID(),
        candidateid UNIQUEIDENTIFIER NOT NULL,
        userid UNIQUEIDENTIFIER NULL,
        assessmentid UNIQUEIDENTIFIER NULL,
        credentialid NVARCHAR(100) NOT NULL,
        title NVARCHAR(255) NOT NULL,
        score INT NULL,
        percentile INT NULL,
        level NVARCHAR(50) NULL,
        issuedate DATE NOT NULL,
        expirydate DATE NULL,
        skillsvalidated NVARCHAR(MAX) NULL,
        isvalid BIT NOT NULL CONSTRAINT DF_certificates_isvalid DEFAULT 1,
        pdfurl NVARCHAR(1000) NULL,
        isactive BIT NOT NULL CONSTRAINT DF_certificates_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_certificates_createdon DEFAULT SYSUTCDATETIME(),
        createdby NVARCHAR(255) NULL,
        modifiedon DATETIME2 NULL,
        modifiedby NVARCHAR(255) NULL,
        CONSTRAINT FK_certificates_candidates FOREIGN KEY (candidateid) REFERENCES dbo.candidates (id),
        CONSTRAINT FK_certificates_assessments FOREIGN KEY (assessmentid) REFERENCES dbo.assessments (id),
        CONSTRAINT UQ_certificates_credentialid UNIQUE (credentialid)
    );
    CREATE INDEX IX_certificates_candidateid ON dbo.certificates (candidateid);
    CREATE INDEX IX_certificates_userid ON dbo.certificates (userid);
END
GO

IF OBJECT_ID(N'dbo.interviews', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.interviews (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_interviews PRIMARY KEY DEFAULT NEWID(),
        applicationid UNIQUEIDENTIFIER NOT NULL,
        candidateid UNIQUEIDENTIFIER NOT NULL,
        employerid UNIQUEIDENTIFIER NOT NULL,
        interviewerid UNIQUEIDENTIFIER NULL,
        interviewtype NVARCHAR(50) NULL,
        scheduleddate DATETIME2 NOT NULL,
        durationminutes INT NOT NULL CONSTRAINT DF_interviews_durationminutes DEFAULT 60,
        meetinglink NVARCHAR(500) NULL,
        status NVARCHAR(50) NOT NULL CONSTRAINT DF_interviews_status DEFAULT N'scheduled',
        notes NVARCHAR(MAX) NULL,
        isactive BIT NOT NULL CONSTRAINT DF_interviews_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_interviews_createdon DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_interviews_applications FOREIGN KEY (applicationid) REFERENCES dbo.job_applications (id),
        CONSTRAINT FK_interviews_candidates FOREIGN KEY (candidateid) REFERENCES dbo.candidates (id),
        CONSTRAINT FK_interviews_employers FOREIGN KEY (employerid) REFERENCES dbo.employers (id)
    );
END
GO

IF OBJECT_ID(N'dbo.interview_feedback', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.interview_feedback (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_interview_feedback PRIMARY KEY DEFAULT NEWID(),
        interviewid UNIQUEIDENTIFIER NOT NULL,
        interviewername NVARCHAR(255) NULL,
        interviewerrole NVARCHAR(255) NULL,
        overallrating FLOAT NULL,
        technicalskillsrating FLOAT NULL,
        communicationrating FLOAT NULL,
        problemsolvingrating FLOAT NULL,
        taxknowledgerating FLOAT NULL,
        strengths NVARCHAR(MAX) NULL,
        improvements NVARCHAR(MAX) NULL,
        detailedfeedback NVARCHAR(MAX) NULL,
        recommendation NVARCHAR(50) NULL,
        isactive BIT NOT NULL CONSTRAINT DF_interview_feedback_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_interview_feedback_createdon DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_interview_feedback_interviews FOREIGN KEY (interviewid) REFERENCES dbo.interviews (id)
    );
END
GO

IF OBJECT_ID(N'dbo.profile_views', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.profile_views (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_profile_views PRIMARY KEY DEFAULT NEWID(),
        candidateid UNIQUEIDENTIFIER NOT NULL,
        employerid UNIQUEIDENTIFIER NULL,
        vieweruserid UNIQUEIDENTIFIER NULL,
        viewtype NVARCHAR(50) NULL,
        source NVARCHAR(100) NULL,
        viewedat DATETIME2 NOT NULL CONSTRAINT DF_profile_views_viewedat DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_profile_views_candidates FOREIGN KEY (candidateid) REFERENCES dbo.candidates (id),
        CONSTRAINT FK_profile_views_employers FOREIGN KEY (employerid) REFERENCES dbo.employers (id)
    );
    CREATE INDEX IX_profile_views_candidateid ON dbo.profile_views (candidateid);
END
GO

IF OBJECT_ID(N'dbo.saved_candidates', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.saved_candidates (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_saved_candidates PRIMARY KEY DEFAULT NEWID(),
        employerid UNIQUEIDENTIFIER NOT NULL,
        candidateid UNIQUEIDENTIFIER NOT NULL,
        savedby UNIQUEIDENTIFIER NULL,
        folder NVARCHAR(100) NULL,
        notes NVARCHAR(MAX) NULL,
        savedat DATETIME2 NOT NULL CONSTRAINT DF_saved_candidates_savedat DEFAULT SYSUTCDATETIME(),
        isactive BIT NOT NULL CONSTRAINT DF_saved_candidates_isactive DEFAULT 1,
        CONSTRAINT FK_saved_candidates_employers FOREIGN KEY (employerid) REFERENCES dbo.employers (id),
        CONSTRAINT FK_saved_candidates_candidates FOREIGN KEY (candidateid) REFERENCES dbo.candidates (id),
        CONSTRAINT UQ_saved_candidates_employer_candidate UNIQUE (employerid, candidateid)
    );
END
GO

IF OBJECT_ID(N'dbo.saved_jobs', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.saved_jobs (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_saved_jobs PRIMARY KEY DEFAULT NEWID(),
        candidateid UNIQUEIDENTIFIER NOT NULL,
        jobpostingid UNIQUEIDENTIFIER NOT NULL,
        savedat DATETIME2 NOT NULL CONSTRAINT DF_saved_jobs_savedat DEFAULT SYSUTCDATETIME(),
        isactive BIT NOT NULL CONSTRAINT DF_saved_jobs_isactive DEFAULT 1,
        CONSTRAINT FK_saved_jobs_candidates FOREIGN KEY (candidateid) REFERENCES dbo.candidates (id),
        CONSTRAINT FK_saved_jobs_jobpostings FOREIGN KEY (jobpostingid) REFERENCES dbo.jobpostings (id),
        CONSTRAINT UQ_saved_jobs_candidate_job UNIQUE (candidateid, jobpostingid)
    );
END
GO

IF OBJECT_ID(N'dbo.admin_users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.admin_users (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_admin_users PRIMARY KEY DEFAULT NEWID(),
        userid UNIQUEIDENTIFIER NOT NULL,
        role NVARCHAR(50) NOT NULL CONSTRAINT DF_admin_users_role DEFAULT N'admin',
        permissions NVARCHAR(MAX) NULL,
        assignedemployers NVARCHAR(MAX) NULL,
        status NVARCHAR(50) NOT NULL CONSTRAINT DF_admin_users_status DEFAULT N'active',
        lastlogin DATETIME2 NULL,
        isactive BIT NOT NULL CONSTRAINT DF_admin_users_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_admin_users_createdon DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_admin_users_users FOREIGN KEY (userid) REFERENCES dbo.users (id),
        CONSTRAINT UQ_admin_users_userid UNIQUE (userid)
    );
END
GO

IF OBJECT_ID(N'dbo.notifications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.notifications (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_notifications PRIMARY KEY DEFAULT NEWID(),
        userid UNIQUEIDENTIFIER NOT NULL,
        type NVARCHAR(100) NOT NULL,
        title NVARCHAR(255) NOT NULL,
        message NVARCHAR(MAX) NULL,
        link NVARCHAR(500) NULL,
        isread BIT NOT NULL CONSTRAINT DF_notifications_isread DEFAULT 0,
        isactive BIT NOT NULL CONSTRAINT DF_notifications_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_notifications_createdon DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_notifications_users FOREIGN KEY (userid) REFERENCES dbo.users (id)
    );
    CREATE INDEX IX_notifications_userid_isread ON dbo.notifications (userid, isread);
END
GO

IF OBJECT_ID(N'dbo.skills_master', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.skills_master (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_skills_master PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(255) NOT NULL,
        category NVARCHAR(100) NULL,
        ispredefined BIT NOT NULL CONSTRAINT DF_skills_master_ispredefined DEFAULT 1,
        usagecount INT NOT NULL CONSTRAINT DF_skills_master_usagecount DEFAULT 0,
        isactive BIT NOT NULL CONSTRAINT DF_skills_master_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_skills_master_createdon DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_skills_master_name UNIQUE (name)
    );
END
GO

PRINT 'Migration 003_platform_extended_tables completed.';
GO
