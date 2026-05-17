#!/usr/bin/env python
"""
Apply SQL Server schema migrations for Tax Talent Solution.

Usage (from repo root or TTS/Migrations):
  python migrate.py status
  python migrate.py up
  python migrate.py up --dry-run
  python migrate.py up --to 002
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Allow running as script without installing package
sys.path.insert(0, str(Path(__file__).resolve().parent))

from tts_migrations.runner import print_status, run_migrations


def main() -> int:
    parser = argparse.ArgumentParser(description="TTS database migrations")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("status", help="List migrations and applied state")

    up = sub.add_parser("up", help="Apply pending migrations")
    up.add_argument("--dry-run", action="store_true", help="Print only, do not execute")
    up.add_argument("--to", metavar="NNN", help="Apply through this version only")

    args = parser.parse_args()

    if args.command == "status":
        print_status()
        return 0

    if args.command == "up":
        count = run_migrations(dry_run=args.dry_run, target=args.to)
        return 0 if count >= 0 else 1

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
