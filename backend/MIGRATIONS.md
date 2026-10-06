# SQL Migration Runner

This project stores SQL files in `database_sql/`.

Use `run_sql_migrations.py` to run them in order and avoid manual copy/paste errors.

## 1) Set DB connection

Add one of these variables in `backend/.env`:

- `SUPABASE_DB_URL` (recommended)
- `DATABASE_URL`

Example value:

`postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres`

## 2) Install dependencies

```powershell
pip install -r .\requirements.txt
```

## 3) Preview migration plan

```powershell
python .\run_sql_migrations.py --dry-run
```

## 4) Run schema/permission migrations only (default)

```powershell
python .\run_sql_migrations.py
```

By default, the runner skips seed-heavy files:

- `02_supabase_seed.sql`
- `06_seeding_fashion_vn.sql`
- `09_seeding_reviews.sql`

## 5) Run including seed SQL files

```powershell
python .\run_sql_migrations.py --include-seed
```

## Seed behavior note

`seed.py` now skips overwriting SQL seed files unless enabled.

Enable old behavior explicitly:

```powershell
$env:SEED_WRITE_SQL="true"
python .\seed.py
```

