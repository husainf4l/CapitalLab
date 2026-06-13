#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DB_NAME="${DB_NAME:-capitallab_migration_validation}"
DB_USER="${DB_USER:-capitallab}"
DB_PASSWORD="${DB_PASSWORD:-capitallab_dev}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

export PGPASSWORD="$DB_PASSWORD"

echo "Recreating validation database $DB_NAME..."
dropdb --if-exists -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"

CONNECTION="Host=$DB_HOST;Port=$DB_PORT;Database=$DB_NAME;Username=$DB_USER;Password=$DB_PASSWORD;Pooling=true;"

cd "$ROOT_DIR/backend"
ConnectionStrings__DefaultConnection="$CONNECTION" dotnet ef database update --project src/CapitalLab.Infrastructure --startup-project src/CapitalLab.Api
dotnet build CapitalLab.sln --no-restore -v:minimal /m:1 /nr:false /p:UseSharedCompilation=false

DEMO_BRANCH_COUNT=1 \
DEMO_DOCTOR_COUNT=1 \
DEMO_STAFF_COUNT=2 \
DEMO_PATIENT_COUNT=10 \
DEMO_APPOINTMENT_COUNT=10 \
DEMO_ORDER_COUNT=10 \
DEMO_SAMPLE_COUNT=10 \
DEMO_INVOICE_COUNT=10 \
DEMO_PAYMENT_COUNT=10 \
ASPNETCORE_ENVIRONMENT=Development \
ConnectionStrings__DefaultConnection="$CONNECTION" \
dotnet src/CapitalLab.Api/bin/Debug/net10.0/CapitalLab.Api.dll --seed-demo-data

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 <<SQL
SELECT to_regclass('organization.branches') AS branches_table,
       to_regclass('people.patients') AS patients_table,
       to_regclass('operations.appointments') AS appointments_table,
       to_regclass('billing.invoices') AS invoices_table;
SELECT COUNT(*) AS branches FROM organization.branches;
SELECT COUNT(*) AS patients FROM people.patients;
SELECT COUNT(*) AS invoices FROM billing.invoices;
SQL

echo "Migration validation completed for $DB_NAME."
