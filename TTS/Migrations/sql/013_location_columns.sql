-- City / state / country columns (idempotent). Keeps legacy JSON/text location for backward compatibility.

-- candidates
IF COL_LENGTH('dbo.candidates', 'locationcity') IS NULL
    ALTER TABLE dbo.candidates ADD locationcity NVARCHAR(255) NULL;
GO
IF COL_LENGTH('dbo.candidates', 'locationstate') IS NULL
    ALTER TABLE dbo.candidates ADD locationstate NVARCHAR(255) NULL;
GO
IF COL_LENGTH('dbo.candidates', 'locationcountry') IS NULL
    ALTER TABLE dbo.candidates ADD locationcountry NVARCHAR(100) NULL CONSTRAINT DF_candidates_locationcountry DEFAULT N'IN';
GO

-- employers (headquarters)
IF COL_LENGTH('dbo.employers', 'headquarterscity') IS NULL
    ALTER TABLE dbo.employers ADD headquarterscity NVARCHAR(255) NULL;
GO
IF COL_LENGTH('dbo.employers', 'headquartersstate') IS NULL
    ALTER TABLE dbo.employers ADD headquartersstate NVARCHAR(255) NULL;
GO
IF COL_LENGTH('dbo.employers', 'headquarterscountry') IS NULL
    ALTER TABLE dbo.employers ADD headquarterscountry NVARCHAR(100) NULL CONSTRAINT DF_employers_headquarterscountry DEFAULT N'IN';
GO

-- job postings
IF COL_LENGTH('dbo.jobpostings', 'locationcity') IS NULL
    ALTER TABLE dbo.jobpostings ADD locationcity NVARCHAR(255) NULL;
GO
IF COL_LENGTH('dbo.jobpostings', 'locationstate') IS NULL
    ALTER TABLE dbo.jobpostings ADD locationstate NVARCHAR(255) NULL;
GO
IF COL_LENGTH('dbo.jobpostings', 'locationcountry') IS NULL
    ALTER TABLE dbo.jobpostings ADD locationcountry NVARCHAR(100) NULL CONSTRAINT DF_jobpostings_locationcountry DEFAULT N'IN';
GO

-- Backfill from JSON location on candidates
IF COL_LENGTH('dbo.candidates', 'location') IS NOT NULL
BEGIN
    UPDATE dbo.candidates
    SET locationcity = COALESCE(locationcity, JSON_VALUE(location, '$.city')),
        locationstate = COALESCE(locationstate, JSON_VALUE(location, '$.state')),
        locationcountry = COALESCE(locationcountry, JSON_VALUE(location, '$.country'), N'IN')
    WHERE location IS NOT NULL
      AND ISJSON(location) = 1;
END
GO

-- Backfill employers from location text "City, State"
IF COL_LENGTH('dbo.employers', 'location') IS NOT NULL
BEGIN
    UPDATE dbo.employers
    SET headquarterscity = COALESCE(headquarterscity, LTRIM(RTRIM(LEFT(location, NULLIF(CHARINDEX(',', location), 0) - 1)))),
        headquartersstate = COALESCE(headquartersstate, LTRIM(RTRIM(SUBSTRING(location, CHARINDEX(',', location) + 1, 500)))),
        headquarterscountry = COALESCE(headquarterscountry, N'IN')
    WHERE location IS NOT NULL
      AND CHARINDEX(',', location) > 0
      AND headquarterscity IS NULL;
END
GO

PRINT 'Migration 013_location_columns completed.';
GO
