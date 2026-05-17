-- Add columns used by frontend/API that may be missing on existing databases.

-- employers (employer portal / subscription)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.employers') AND name = N'status')
    ALTER TABLE dbo.employers ADD status NVARCHAR(50) NULL CONSTRAINT DF_employers_status DEFAULT N'active';
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.employers') AND name = N'subscriptionplan')
    ALTER TABLE dbo.employers ADD subscriptionplan NVARCHAR(50) NULL CONSTRAINT DF_employers_subscriptionplan DEFAULT N'basic';
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.employers') AND name = N'subscriptionexpiry')
    ALTER TABLE dbo.employers ADD subscriptionexpiry DATE NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.employers') AND name = N'monthlybudget')
    ALTER TABLE dbo.employers ADD monthlybudget FLOAT NULL CONSTRAINT DF_employers_monthlybudget DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.employers') AND name = N'totalhires')
    ALTER TABLE dbo.employers ADD totalhires INT NULL CONSTRAINT DF_employers_totalhires DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.employers') AND name = N'logourl')
    ALTER TABLE dbo.employers ADD logourl NVARCHAR(1000) NULL;
GO

-- candidates (profile richness)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.candidates') AND name = N'headline')
    ALTER TABLE dbo.candidates ADD headline NVARCHAR(255) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.candidates') AND name = N'summary')
    ALTER TABLE dbo.candidates ADD summary NVARCHAR(MAX) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.candidates') AND name = N'linkedinurl')
    ALTER TABLE dbo.candidates ADD linkedinurl NVARCHAR(500) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.candidates') AND name = N'profilecompleteness')
    ALTER TABLE dbo.candidates ADD profilecompleteness INT NULL CONSTRAINT DF_candidates_profilecompleteness DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.candidates') AND name = N'profileviews')
    ALTER TABLE dbo.candidates ADD profileviews INT NULL CONSTRAINT DF_candidates_profileviews DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.candidates') AND name = N'rating')
    ALTER TABLE dbo.candidates ADD rating FLOAT NULL CONSTRAINT DF_candidates_rating DEFAULT 0;
GO

-- jobpostings (job board UI)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.jobpostings') AND name = N'status')
    ALTER TABLE dbo.jobpostings ADD status NVARCHAR(50) NULL CONSTRAINT DF_jobpostings_status DEFAULT N'active';
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.jobpostings') AND name = N'isurgent')
    ALTER TABLE dbo.jobpostings ADD isurgent BIT NOT NULL CONSTRAINT DF_jobpostings_isurgent DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.jobpostings') AND name = N'isfeatured')
    ALTER TABLE dbo.jobpostings ADD isfeatured BIT NOT NULL CONSTRAINT DF_jobpostings_isfeatured DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.jobpostings') AND name = N'applicantcount')
    ALTER TABLE dbo.jobpostings ADD applicantcount INT NOT NULL CONSTRAINT DF_jobpostings_applicantcount DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.jobpostings') AND name = N'viewcount')
    ALTER TABLE dbo.jobpostings ADD viewcount INT NOT NULL CONSTRAINT DF_jobpostings_viewcount DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.jobpostings') AND name = N'posteddate')
    ALTER TABLE dbo.jobpostings ADD posteddate DATETIME2 NULL;
GO

-- assessments (catalog metadata)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.assessments') AND name = N'price')
    ALTER TABLE dbo.assessments ADD price FLOAT NULL CONSTRAINT DF_assessments_price DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.assessments') AND name = N'totalattempts')
    ALTER TABLE dbo.assessments ADD totalattempts INT NULL CONSTRAINT DF_assessments_totalattempts DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.assessments') AND name = N'avgscore')
    ALTER TABLE dbo.assessments ADD avgscore FLOAT NULL CONSTRAINT DF_assessments_avgscore DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.assessments') AND name = N'rating')
    ALTER TABLE dbo.assessments ADD rating FLOAT NULL CONSTRAINT DF_assessments_rating DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.assessments') AND name = N'skillsvalidated')
    ALTER TABLE dbo.assessments ADD skillsvalidated NVARCHAR(MAX) NULL;
GO

-- users (account state)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.users') AND name = N'status')
    ALTER TABLE dbo.users ADD status NVARCHAR(50) NULL CONSTRAINT DF_users_status DEFAULT N'active';
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.users') AND name = N'emailverified')
    ALTER TABLE dbo.users ADD emailverified BIT NOT NULL CONSTRAINT DF_users_emailverified DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.users') AND name = N'phoneverified')
    ALTER TABLE dbo.users ADD phoneverified BIT NOT NULL CONSTRAINT DF_users_phoneverified DEFAULT 0;
GO

PRINT 'Migration 005_align_table_columns completed.';
GO
