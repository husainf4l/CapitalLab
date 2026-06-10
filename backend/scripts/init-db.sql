-- Capital Lab database initialization
-- Creates schemas required by EF Core migrations

CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS organization;
CREATE SCHEMA IF NOT EXISTS people;
CREATE SCHEMA IF NOT EXISTS patients;
CREATE SCHEMA IF NOT EXISTS clinical;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS appointments;
CREATE SCHEMA IF NOT EXISTS operations;
CREATE SCHEMA IF NOT EXISTS laboratory;
CREATE SCHEMA IF NOT EXISTS samples;
CREATE SCHEMA IF NOT EXISTS results;
CREATE SCHEMA IF NOT EXISTS reports;
CREATE SCHEMA IF NOT EXISTS inventory;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Enable pg_trgm extension for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for server-side encryption support
CREATE EXTENSION IF NOT EXISTS pgcrypto;

COMMENT ON SCHEMA identity IS 'Users, roles, permissions, refresh tokens';
COMMENT ON SCHEMA organization IS 'Labs, branches, staff assignments';
COMMENT ON SCHEMA patients IS 'Patient profiles, family members, insurance';
COMMENT ON SCHEMA clinical IS 'Doctors, specializations';
COMMENT ON SCHEMA catalog IS 'Tests, categories, packages, reference ranges';
COMMENT ON SCHEMA appointments IS 'Bookings, home collections';
COMMENT ON SCHEMA samples IS 'Barcodes, tracking, chain of custody';
COMMENT ON SCHEMA results IS 'Test results, reviews, approvals';
COMMENT ON SCHEMA reports IS 'Generated reports, signatures, shares';
COMMENT ON SCHEMA inventory IS 'Reagents, consumables, purchase orders';
COMMENT ON SCHEMA billing IS 'Invoices, payments, refunds';
COMMENT ON SCHEMA notifications IS 'Templates, notification log';
COMMENT ON SCHEMA audit IS 'Append-only audit trail';
COMMENT ON SCHEMA analytics IS 'Materialized KPI snapshots';
