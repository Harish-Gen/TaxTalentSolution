#!/usr/bin/env python
"""
Create a new numbered SQL migration file.

Usage:
  python new_migration.py add_resume_url_to_candidates
  python new_migration.py "add user subscription table"
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Scaffold a new SQL migration")
    parser.add_argument("name", help="Short description (snake_case or words)")
    args = parser.parse_args()

    slug = re.sub(r"[^a-z0-9]+", "_", args.name.lower()).strip("_")
    if not slug:
        print("Invalid migration name.")
        return 1

    sql_dir = Path(__file__).resolve().parent / "sql"
    sql_dir.mkdir(parents=True, exist_ok=True)

    existing = sorted(sql_dir.glob("*.sql"))
    next_num = 1
    if existing:
        last = existing[-1].stem.split("_", 1)[0]
        if last.isdigit():
            next_num = int(last) + 1

    version = f"{next_num:03d}"
    filename = f"{version}_{slug}.sql"
    path = sql_dir / filename

    if path.exists():
        print(f"File already exists: {path}")
        return 1

    template = f"""-- Migration: {version}_{slug}
-- Description: {args.name}
-- Safe to re-run: use IF NOT EXISTS checks for tables/columns.

-- Example: add a column
-- IF NOT EXISTS (
--     SELECT 1 FROM sys.columns
--     WHERE object_id = OBJECT_ID(N'dbo.candidates') AND name = N'your_column'
-- )
-- BEGIN
--     ALTER TABLE dbo.candidates ADD your_column NVARCHAR(500) NULL;
-- END
-- GO

-- Example: create a table
-- IF OBJECT_ID(N'dbo.your_table', N'U') IS NULL
-- BEGIN
--     CREATE TABLE dbo.your_table (
--         Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_your_table PRIMARY KEY DEFAULT NEWID(),
--         CreatedOn DATETIME2 NOT NULL CONSTRAINT DF_your_table_CreatedOn DEFAULT SYSUTCDATETIME(),
--         IsActive BIT NOT NULL CONSTRAINT DF_your_table_IsActive DEFAULT 1
--     );
-- END
-- GO

PRINT 'Migration {version}_{slug} applied.';
GO
"""
    path.write_text(template, encoding="utf-8")
    print(f"Created {path}")
    print(f"Edit the file, then run: python migrate.py up")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
