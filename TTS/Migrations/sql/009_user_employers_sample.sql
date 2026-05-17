-- Link sample recruiter users to employers via user_employers (idempotent).

DECLARE @UserEmployer UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000002';
DECLARE @UserDeloitte UNIQUEIDENTIFIER = 'A1000001-0001-4001-8001-000000000004';
DECLARE @EmployerKpmg UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000020';
DECLARE @EmployerDeloitte UNIQUEIDENTIFIER = 'A1000003-0003-4003-8003-000000000021';

IF NOT EXISTS (
    SELECT 1 FROM dbo.user_employers
    WHERE userid = @UserEmployer AND employerid = @EmployerKpmg
)
BEGIN
    INSERT INTO dbo.user_employers (userid, employerid, isactive)
    VALUES (@UserEmployer, @EmployerKpmg, 1);
END
ELSE
BEGIN
    UPDATE dbo.user_employers SET isactive = 1
    WHERE userid = @UserEmployer AND employerid = @EmployerKpmg;
END

IF NOT EXISTS (
    SELECT 1 FROM dbo.user_employers
    WHERE userid = @UserDeloitte AND employerid = @EmployerDeloitte
)
BEGIN
    INSERT INTO dbo.user_employers (userid, employerid, isactive)
    VALUES (@UserDeloitte, @EmployerDeloitte, 1);
END
ELSE
BEGIN
    UPDATE dbo.user_employers SET isactive = 1
    WHERE userid = @UserDeloitte AND employerid = @EmployerDeloitte;
END

PRINT 'Migration 009_user_employers_sample completed.';
