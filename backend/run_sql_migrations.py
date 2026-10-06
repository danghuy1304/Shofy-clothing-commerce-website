import argparse
import os
import re
from pathlib import Path

from dotenv import load_dotenv

try:
    import psycopg
except ImportError:  # pragma: no cover
    psycopg = None


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_SQL_DIR = BASE_DIR / "database_sql"
DEFAULT_SEED_FILE_NAMES = {
    "02_supabase_seed.sql",
    "06_seeding_fashion_vn.sql",
    "09_seeding_reviews.sql",
}


def migration_sort_key(path: Path):
    match = re.match(r"^(\d+)_", path.name)
    if match:
        return (int(match.group(1)), path.name.lower())
    return (999999, path.name.lower())


def list_sql_files(sql_dir: Path, include_seed: bool) -> list[Path]:
    files = [p for p in sql_dir.glob("*.sql") if p.is_file()]
    files.sort(key=migration_sort_key)
    if include_seed:
        return files
    return [p for p in files if p.name not in DEFAULT_SEED_FILE_NAMES]


def run_file(conn, file_path: Path) -> None:
    sql = file_path.read_text(encoding="utf-8").strip()
    if not sql:
        print(f"  - SKIP empty: {file_path.name}")
        return

    with conn.cursor() as cur:
        cur.execute(sql)
    conn.commit()
    print(f"  - OK: {file_path.name}")


def connect_db(db_url: str):
    if psycopg is None:
        raise RuntimeError("Missing dependency: psycopg")
    return psycopg.connect(db_url)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run SQL migration files in order against Supabase Postgres."
    )
    parser.add_argument(
        "--sql-dir",
        type=Path,
        default=DEFAULT_SQL_DIR,
        help="Directory containing SQL files (default: backend/database_sql)",
    )
    parser.add_argument(
        "--include-seed",
        action="store_true",
        help="Include seed SQL files (02/06/09) when running migrations.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only print execution plan, do not execute SQL.",
    )
    parser.add_argument(
        "--db-url",
        default=None,
        help="Postgres connection URL. If omitted, load SUPABASE_DB_URL or DATABASE_URL from .env.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    load_dotenv(BASE_DIR / ".env")

    sql_dir = args.sql_dir
    if not sql_dir.is_absolute():
        sql_dir = (BASE_DIR / sql_dir).resolve()

    if not sql_dir.exists() or not sql_dir.is_dir():
        print(f"SQL directory not found: {sql_dir}")
        return 1

    sql_files = list_sql_files(sql_dir, include_seed=args.include_seed)
    if not sql_files:
        print(f"No SQL files found in: {sql_dir}")
        return 1

    print("Execution plan:")
    for path in sql_files:
        print(f"  - {path.name}")

    if args.dry_run:
        print("\nDry run completed. No SQL executed.")
        return 0

    if psycopg is None:
        print("Missing dependency: psycopg")
        print("Install with: pip install psycopg[binary]")
        return 1

    db_url = args.db_url or os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
    if not db_url:
        print("Missing database URL.")
        print("Set SUPABASE_DB_URL (recommended) or DATABASE_URL in backend/.env")
        return 1

    try:
        with connect_db(db_url) as conn:
            for file_path in sql_files:
                run_file(conn, file_path)
    except Exception as exc:
        print(f"\nMigration failed: {exc}")
        return 1

    print("\nAll SQL migrations executed successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

