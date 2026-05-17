from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable

import pyodbc

from tts_migrations.config import load_connection_string

MIGRATION_TABLE = "SchemaMigrations"


@dataclass
class MigrationFile:
    version: str
    name: str
    path: Path


def migrations_sql_dir() -> Path:
    return Path(__file__).resolve().parent.parent / "sql"


def list_migrations() -> list[MigrationFile]:
    sql_dir = migrations_sql_dir()
    if not sql_dir.is_dir():
        return []

    pattern = re.compile(r"^(\d{3})_(.+)\.sql$", re.IGNORECASE)
    files: list[MigrationFile] = []
    for path in sorted(sql_dir.glob("*.sql")):
        match = pattern.match(path.name)
        if not match:
            continue
        files.append(
            MigrationFile(version=match.group(1), name=match.group(2), path=path)
        )
    return files


def split_sql_batches(script: str) -> list[str]:
    """Split on GO lines (SQL Server batch separator)."""
    parts = re.split(r"^\s*GO\s*;?\s*$", script, flags=re.MULTILINE | re.IGNORECASE)
    return [part.strip() for part in parts if part.strip()]


def ensure_migration_table(cursor: pyodbc.Cursor) -> None:
    cursor.execute(
        f"""
        IF OBJECT_ID(N'dbo.{MIGRATION_TABLE}', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.{MIGRATION_TABLE} (
                Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                Version NVARCHAR(10) NOT NULL,
                Name NVARCHAR(200) NOT NULL,
                AppliedOn DATETIME2 NOT NULL CONSTRAINT DF_SchemaMigrations_AppliedOn DEFAULT SYSUTCDATETIME(),
                CONSTRAINT UQ_SchemaMigrations_Version UNIQUE (Version)
            );
        END
        """
    )


def get_applied_versions(cursor: pyodbc.Cursor) -> set[str]:
    cursor.execute(f"SELECT Version FROM dbo.{MIGRATION_TABLE}")
    return {str(row[0]) for row in cursor.fetchall()}


def apply_migration(
    connection: pyodbc.Connection,
    migration: MigrationFile,
    *,
    dry_run: bool = False,
) -> None:
    script = migration.path.read_text(encoding="utf-8")
    batches = split_sql_batches(script)
    if not batches:
        raise ValueError(f"Migration {migration.path.name} is empty")

    if dry_run:
        print(f"[dry-run] Would apply {migration.path.name} ({len(batches)} batch(es))")
        return

    cursor = connection.cursor()
    try:
        for batch in batches:
            cursor.execute(batch)
        cursor.execute(
            f"INSERT INTO dbo.{MIGRATION_TABLE} (Version, Name, AppliedOn) VALUES (?, ?, ?)",
            migration.version,
            migration.name,
            datetime.utcnow(),
        )
        connection.commit()
    except Exception:
        connection.rollback()
        raise


def run_migrations(*, dry_run: bool = False, target: str | None = None) -> int:
    """
    Apply pending migrations in order.
    Returns count of migrations applied.
    """
    all_migrations = list_migrations()
    if not all_migrations:
        print("No migration files found in sql/.")
        return 0

    connection_string = load_connection_string()
    connection = pyodbc.connect(connection_string, autocommit=False)
    cursor = connection.cursor()
    ensure_migration_table(cursor)
    connection.commit()

    applied = get_applied_versions(cursor)
    pending = [m for m in all_migrations if m.version not in applied]

    if target:
        pending = [m for m in pending if m.version == target.zfill(3)]
        if not pending:
            print(f"Migration {target} is already applied or does not exist.")
            return 0

    if not pending:
        print("Database is up to date.")
        return 0

    count = 0
    for migration in pending:
        print(f"Applying {migration.path.name} ...")
        apply_migration(connection, migration, dry_run=dry_run)
        count += 1
        if not dry_run:
            print(f"  OK — recorded version {migration.version}")

    return count


def print_status() -> None:
    connection_string = load_connection_string()
    connection = pyodbc.connect(connection_string)
    cursor = connection.cursor()
    ensure_migration_table(cursor)
    connection.commit()

    applied = get_applied_versions(cursor)
    all_migrations = list_migrations()

    print(f"{'Version':<8} {'Status':<12} Name")
    print("-" * 60)
    for migration in all_migrations:
        status = "applied" if migration.version in applied else "pending"
        print(f"{migration.version:<8} {status:<12} {migration.name}")
