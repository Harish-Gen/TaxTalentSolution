-- Backfill assessment status so candidates see catalog items.
IF COL_LENGTH('dbo.assessments', 'status') IS NOT NULL
BEGIN
    UPDATE dbo.assessments
    SET status = N'active'
    WHERE status IS NULL OR LTRIM(RTRIM(status)) = N'';
END
GO
