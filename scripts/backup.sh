#!/usr/bin/env bash
# scripts/backup.sh
# Snapshot the production Supabase Postgres database via pg_dump.
#
# Usage:
#   SUPABASE_DB_URL="postgresql://postgres:<pwd>@db.<ref>.supabase.co:5432/postgres" \
#     ./scripts/backup.sh [output_dir]
#
# Optional env:
#   BACKUP_KEEP_DAYS   delete dumps older than this many days (default 14)
#   BACKUP_GZIP        set to "0" to skip gzip (default: gzip on)
#
# Exit codes:
#   0  success
#   1  missing dependency
#   2  missing SUPABASE_DB_URL
#   3  pg_dump failed

set -euo pipefail

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "[backup] pg_dump not found. Install postgresql-client first." >&2
  exit 1
fi

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "[backup] SUPABASE_DB_URL is not set." >&2
  echo "         Find it under Supabase dashboard → Project settings → Database → Connection string." >&2
  exit 2
fi

OUTPUT_DIR="${1:-./backups}"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
GZIP_ENABLED="${BACKUP_GZIP:-1}"

mkdir -p "$OUTPUT_DIR"

TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
DUMP_FILE="${OUTPUT_DIR}/whv-${TIMESTAMP}.sql"

echo "[backup] Dumping schema + data to ${DUMP_FILE}"
# --no-owner / --no-privileges keeps the dump portable across environments.
# --schema=public is safe; Supabase keeps user data here. Add more schemas if needed.
pg_dump \
  --no-owner \
  --no-privileges \
  --schema=public \
  --format=plain \
  --file="${DUMP_FILE}" \
  "${SUPABASE_DB_URL}"

if [ "$GZIP_ENABLED" = "1" ]; then
  gzip -9 "${DUMP_FILE}"
  DUMP_FILE="${DUMP_FILE}.gz"
fi

SIZE="$(du -h "${DUMP_FILE}" | awk '{print $1}')"
echo "[backup] Wrote ${DUMP_FILE} (${SIZE})"

if [ "${KEEP_DAYS}" -gt 0 ]; then
  echo "[backup] Pruning dumps older than ${KEEP_DAYS} days in ${OUTPUT_DIR}"
  find "${OUTPUT_DIR}" -maxdepth 1 -type f -name "whv-*.sql*" -mtime +"${KEEP_DAYS}" -print -delete || true
fi

echo "[backup] Done."
