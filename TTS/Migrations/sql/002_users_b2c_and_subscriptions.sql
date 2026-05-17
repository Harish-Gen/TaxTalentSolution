-- Extend users for Azure AD B2C and add subscription tracking.
-- Column adds are idempotent (skip if column already exists).

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.users') AND name = N'b2c_object_id'
)
BEGIN
    ALTER TABLE dbo.users ADD b2c_object_id NVARCHAR(255) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.users') AND name = N'IX_users_b2c_object_id'
)
BEGIN
    CREATE UNIQUE INDEX IX_users_b2c_object_id ON dbo.users (b2c_object_id)
    WHERE b2c_object_id IS NOT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.users') AND name = N'country'
)
BEGIN
    ALTER TABLE dbo.users ADD country NVARCHAR(10) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.users') AND name = N'oauth_provider'
)
BEGIN
    ALTER TABLE dbo.users ADD oauth_provider NVARCHAR(50) NULL
        CONSTRAINT DF_users_oauth_provider DEFAULT N'azure_b2c';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.users') AND name = N'avatarurl'
)
BEGIN
    ALTER TABLE dbo.users ADD avatarurl NVARCHAR(1000) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.users') AND name = N'lastlogin'
)
BEGIN
    ALTER TABLE dbo.users ADD lastlogin DATETIME2 NULL;
END
GO

IF OBJECT_ID(N'dbo.user_subscriptions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.user_subscriptions (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_user_subscriptions PRIMARY KEY DEFAULT NEWID(),
        userid UNIQUEIDENTIFIER NOT NULL,
        subscriptionplan NVARCHAR(50) NOT NULL CONSTRAINT DF_user_subscriptions_subscriptionplan DEFAULT N'free',
        billingcycle NVARCHAR(50) NOT NULL CONSTRAINT DF_user_subscriptions_billingcycle DEFAULT N'monthly',
        status NVARCHAR(50) NOT NULL CONSTRAINT DF_user_subscriptions_status DEFAULT N'active',
        startdate DATETIME2 NOT NULL CONSTRAINT DF_user_subscriptions_startdate DEFAULT SYSUTCDATETIME(),
        expiresat DATETIME2 NOT NULL,
        createdon DATETIME2 NOT NULL CONSTRAINT DF_user_subscriptions_createdon DEFAULT SYSUTCDATETIME(),
        modifiedon DATETIME2 NULL,
        CONSTRAINT FK_user_subscriptions_users FOREIGN KEY (userid) REFERENCES dbo.users (id),
        CONSTRAINT UQ_user_subscriptions_userid UNIQUE (userid)
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.user_assessments') AND name = N'score'
)
BEGIN
    ALTER TABLE dbo.user_assessments ADD score FLOAT NULL;
END
GO

PRINT 'Migration 002_users_b2c_and_subscriptions completed.';
GO
