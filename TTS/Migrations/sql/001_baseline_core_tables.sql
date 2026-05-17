-- Baseline schema for TTS API (SQL Server).
-- Idempotent: safe on empty or partially existing databases.

IF OBJECT_ID(N'dbo.roles', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.roles (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_roles PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(500) NULL,
        isactive BIT NOT NULL CONSTRAINT DF_roles_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_roles_createdon DEFAULT SYSUTCDATETIME(),
        createdby NVARCHAR(255) NULL,
        modifiedon DATETIME2 NULL,
        modifiedby NVARCHAR(255) NULL
    );
END
GO

IF OBJECT_ID(N'dbo.users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.users (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_users PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(255) NULL,
        email NVARCHAR(255) NULL,
        phone NVARCHAR(50) NULL,
        roleid UNIQUEIDENTIFIER NULL,
        isactive BIT NOT NULL CONSTRAINT DF_users_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_users_createdon DEFAULT SYSUTCDATETIME(),
        createdby NVARCHAR(255) NULL,
        modifiedon DATETIME2 NULL,
        modifiedby NVARCHAR(255) NULL,
        CONSTRAINT FK_users_roles FOREIGN KEY (roleid) REFERENCES dbo.roles (id)
    );
    CREATE INDEX IX_users_email ON dbo.users (email);
    CREATE INDEX IX_users_roleid ON dbo.users (roleid);
END
GO

IF OBJECT_ID(N'dbo.employers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.employers (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_employers PRIMARY KEY DEFAULT NEWID(),
        userid UNIQUEIDENTIFIER NULL,
        name NVARCHAR(255) NULL,
        contactperson NVARCHAR(255) NULL,
        email NVARCHAR(255) NULL,
        phone NVARCHAR(50) NULL,
        location NVARCHAR(500) NULL,
        industry NVARCHAR(100) NULL,
        companysize NVARCHAR(50) NULL,
        website NVARCHAR(500) NULL,
        isactive BIT NOT NULL CONSTRAINT DF_employers_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_employers_createdon DEFAULT SYSUTCDATETIME(),
        createdby NVARCHAR(255) NULL,
        modifiedon DATETIME2 NULL,
        modifiedby NVARCHAR(255) NULL,
        CONSTRAINT FK_employers_users FOREIGN KEY (userid) REFERENCES dbo.users (id)
    );
END
GO

IF OBJECT_ID(N'dbo.user_employers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.user_employers (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_user_employers PRIMARY KEY DEFAULT NEWID(),
        userid UNIQUEIDENTIFIER NOT NULL,
        employerid UNIQUEIDENTIFIER NOT NULL,
        isactive BIT NOT NULL CONSTRAINT DF_user_employers_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_user_employers_createdon DEFAULT SYSUTCDATETIME(),
        createdby NVARCHAR(255) NULL,
        modifiedon DATETIME2 NULL,
        modifiedby NVARCHAR(255) NULL,
        CONSTRAINT FK_user_employers_users FOREIGN KEY (userid) REFERENCES dbo.users (id),
        CONSTRAINT FK_user_employers_employers FOREIGN KEY (employerid) REFERENCES dbo.employers (id)
    );
    CREATE INDEX IX_user_employers_userid ON dbo.user_employers (userid);
END
GO

IF OBJECT_ID(N'dbo.candidates', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.candidates (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_candidates PRIMARY KEY DEFAULT NEWID(),
        userid UNIQUEIDENTIFIER NULL,
        location NVARCHAR(MAX) NULL,
        currenttitle NVARCHAR(255) NULL,
        experienceyrs FLOAT NULL,
        noticeperiod INT NULL,
        taxexpertise NVARCHAR(MAX) NULL,
        certifications NVARCHAR(MAX) NULL,
        hourlyrate FLOAT NULL,
        currency NVARCHAR(10) NULL,
        availability NVARCHAR(50) NULL,
        workmode NVARCHAR(50) NULL,
        resumeurl NVARCHAR(1000) NULL,
        status NVARCHAR(50) NULL,
        stage NVARCHAR(50) NULL,
        isactive BIT NOT NULL CONSTRAINT DF_candidates_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_candidates_createdon DEFAULT SYSUTCDATETIME(),
        createdby NVARCHAR(255) NULL,
        modifiedon DATETIME2 NULL,
        modifiedby NVARCHAR(255) NULL,
        CONSTRAINT FK_candidates_users FOREIGN KEY (userid) REFERENCES dbo.users (id)
    );
    CREATE INDEX IX_candidates_userid ON dbo.candidates (userid);
END
GO

IF OBJECT_ID(N'dbo.assessments', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.assessments (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_assessments PRIMARY KEY DEFAULT NEWID(),
        title NVARCHAR(255) NULL,
        category NVARCHAR(100) NULL,
        difficultylevel NVARCHAR(50) NULL,
        numberofquestions INT NULL,
        durationminutes INT NULL,
        passingscore FLOAT NULL,
        pointsperquestion FLOAT NULL,
        description NVARCHAR(MAX) NULL,
        status NVARCHAR(50) NULL,
        isactive BIT NOT NULL CONSTRAINT DF_assessments_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_assessments_createdon DEFAULT SYSUTCDATETIME(),
        createdby NVARCHAR(255) NULL,
        modifiedon DATETIME2 NULL,
        modifiedby NVARCHAR(255) NULL
    );
END
GO

IF OBJECT_ID(N'dbo.questions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.questions (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_questions PRIMARY KEY DEFAULT NEWID(),
        qajson NVARCHAR(MAX) NULL,
        isactive BIT NOT NULL CONSTRAINT DF_questions_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_questions_createdon DEFAULT SYSUTCDATETIME(),
        createdby NVARCHAR(255) NULL,
        modifiedon DATETIME2 NULL,
        modifiedby NVARCHAR(255) NULL
    );
END
GO

IF OBJECT_ID(N'dbo.assessment_questions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.assessment_questions (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_assessment_questions PRIMARY KEY DEFAULT NEWID(),
        questionid UNIQUEIDENTIFIER NOT NULL,
        assessmentid UNIQUEIDENTIFIER NOT NULL,
        isactive BIT NOT NULL CONSTRAINT DF_assessment_questions_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_assessment_questions_createdon DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_assessment_questions_questions FOREIGN KEY (questionid) REFERENCES dbo.questions (id),
        CONSTRAINT FK_assessment_questions_assessments FOREIGN KEY (assessmentid) REFERENCES dbo.assessments (id)
    );
    CREATE INDEX IX_assessment_questions_assessmentid ON dbo.assessment_questions (assessmentid);
END
GO

IF OBJECT_ID(N'dbo.user_assessments', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.user_assessments (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_user_assessments PRIMARY KEY DEFAULT NEWID(),
        userid UNIQUEIDENTIFIER NOT NULL,
        assessmentid UNIQUEIDENTIFIER NOT NULL,
        status NVARCHAR(50) NOT NULL CONSTRAINT DF_user_assessments_status DEFAULT N'pending',
        startedon DATETIME2 NULL,
        completedon DATETIME2 NULL,
        score FLOAT NULL,
        isactive BIT NOT NULL CONSTRAINT DF_user_assessments_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_user_assessments_createdon DEFAULT SYSUTCDATETIME(),
        createdby NVARCHAR(255) NULL,
        modifiedon DATETIME2 NULL,
        modifiedby NVARCHAR(255) NULL,
        CONSTRAINT FK_user_assessments_users FOREIGN KEY (userid) REFERENCES dbo.users (id),
        CONSTRAINT FK_user_assessments_assessments FOREIGN KEY (assessmentid) REFERENCES dbo.assessments (id)
    );
    CREATE INDEX IX_user_assessments_userid ON dbo.user_assessments (userid);
END
GO

IF OBJECT_ID(N'dbo.user_assessment_answers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.user_assessment_answers (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_user_assessment_answers PRIMARY KEY DEFAULT NEWID(),
        userassessmentid UNIQUEIDENTIFIER NOT NULL,
        answersjson NVARCHAR(MAX) NOT NULL,
        isactive BIT NOT NULL CONSTRAINT DF_user_assessment_answers_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_user_assessment_answers_createdon DEFAULT SYSUTCDATETIME(),
        createdby NVARCHAR(255) NULL,
        modifiedon DATETIME2 NULL,
        modifiedby NVARCHAR(255) NULL,
        CONSTRAINT FK_user_assessment_answers_user_assessments FOREIGN KEY (userassessmentid) REFERENCES dbo.user_assessments (id)
    );
END
GO

IF OBJECT_ID(N'dbo.usercompetencies', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.usercompetencies (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_usercompetencies PRIMARY KEY DEFAULT NEWID(),
        userid UNIQUEIDENTIFIER NOT NULL,
        competenciesjson NVARCHAR(MAX) NOT NULL,
        isactive BIT NOT NULL CONSTRAINT DF_usercompetencies_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_usercompetencies_createdon DEFAULT SYSUTCDATETIME(),
        createdby NVARCHAR(255) NULL,
        modifiedon DATETIME2 NULL,
        modifiedby NVARCHAR(255) NULL,
        CONSTRAINT FK_usercompetencies_users FOREIGN KEY (userid) REFERENCES dbo.users (id)
    );
END
GO

IF OBJECT_ID(N'dbo.jobpostings', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.jobpostings (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_jobpostings PRIMARY KEY DEFAULT NEWID(),
        jobtitle NVARCHAR(255) NULL,
        employerid UNIQUEIDENTIFIER NULL,
        location NVARCHAR(500) NULL,
        jobtype NVARCHAR(50) NULL,
        experiencelevel NVARCHAR(50) NULL,
        category NVARCHAR(100) NULL,
        minsalary FLOAT NULL,
        maxsalary FLOAT NULL,
        closingdate DATE NULL,
        jobdescription NVARCHAR(MAX) NULL,
        requirements NVARCHAR(MAX) NULL,
        responsibilities NVARCHAR(MAX) NULL,
        benefits NVARCHAR(MAX) NULL,
        isactive BIT NOT NULL CONSTRAINT DF_jobpostings_isactive DEFAULT 1,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_jobpostings_createdon DEFAULT SYSUTCDATETIME(),
        createdby NVARCHAR(255) NULL,
        modifiedon DATETIME2 NULL,
        modifiedby NVARCHAR(255) NULL,
        CONSTRAINT FK_jobpostings_employers FOREIGN KEY (employerid) REFERENCES dbo.employers (id)
    );
END
GO

PRINT 'Migration 001_baseline_core_tables completed.';
GO
