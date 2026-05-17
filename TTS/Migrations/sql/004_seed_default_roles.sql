-- Seed roles referenced by TTS/appsettings.json AppConfig.
-- Safe to re-run (skips existing rows).

IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE id = '8B90FD0B-EB39-482F-82C0-DCF60273D3D4')
BEGIN
    INSERT INTO dbo.roles (id, name, description, isactive)
    VALUES (
        '8B90FD0B-EB39-482F-82C0-DCF60273D3D4',
        N'candidate',
        N'Default candidate role',
        1
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE id = 'E390AD62-F385-4ACD-92A3-8F8607B0B908')
BEGIN
    INSERT INTO dbo.roles (id, name, description, isactive)
    VALUES (
        'E390AD62-F385-4ACD-92A3-8F8607B0B908',
        N'employer',
        N'Default employer role',
        1
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE LOWER(name) = N'admin')
BEGIN
    INSERT INTO dbo.roles (id, name, description, isactive)
    VALUES (
        NEWID(),
        N'admin',
        N'Platform administrator',
        1
    );
END
GO

PRINT 'Migration 004_seed_default_roles completed.';
GO
