# Capital Lab — Database Design

## Overview

PostgreSQL 16. All tables use `UUID` primary keys generated server-side. Timestamps use `timestamptz` (UTC). Soft deletes via `deleted_at` nullable column. All sensitive PII columns are AES-256 encrypted.

---

## Schema Groups

1. **identity** — users, roles, permissions, refresh tokens
2. **organization** — labs, branches, staff assignments
3. **patients** — patient profiles, family members, insurance
4. **clinical** — doctors, specializations
5. **catalog** — tests, categories, packages, reference ranges
6. **appointments** — bookings, home collections
7. **samples** — barcodes, tracking, chain of custody
8. **results** — entries, reviews, approvals
9. **reports** — generated reports, signatures
10. **inventory** — reagents, consumables, equipment, orders
11. **billing** — invoices, payments, refunds
12. **notifications** — templates, logs
13. **audit** — audit log (append-only)
14. **analytics** — materialized snapshots (read model)

---

## Complete Table Definitions

### identity schema

```sql
-- Users (extends ASP.NET Identity)
CREATE TABLE identity.users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(256) UNIQUE NOT NULL,
    email_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    phone           VARCHAR(20),
    phone_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    password_hash   TEXT NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    avatar_url      TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    language_pref   VARCHAR(5) NOT NULL DEFAULT 'en',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- Roles
CREATE TABLE identity.roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_system   BOOLEAN NOT NULL DEFAULT FALSE
);

-- User-Role assignments
CREATE TABLE identity.user_roles (
    user_id    UUID NOT NULL REFERENCES identity.users(id),
    role_id    UUID NOT NULL REFERENCES identity.roles(id),
    branch_id  UUID REFERENCES organization.branches(id),  -- NULL = global
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by UUID REFERENCES identity.users(id),
    PRIMARY KEY (user_id, role_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'))
);

-- Permissions
CREATE TABLE identity.permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module      VARCHAR(100) NOT NULL,
    action      VARCHAR(100) NOT NULL,
    description TEXT,
    UNIQUE (module, action)
);

-- Role-Permission assignments
CREATE TABLE identity.role_permissions (
    role_id       UUID NOT NULL REFERENCES identity.roles(id),
    permission_id UUID NOT NULL REFERENCES identity.permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

-- Refresh tokens
CREATE TABLE identity.refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES identity.users(id),
    token_hash  TEXT NOT NULL UNIQUE,
    device_info JSONB,
    ip_address  INET,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_refresh_tokens_user ON identity.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON identity.refresh_tokens(expires_at);
```

### organization schema

```sql
-- Labs (top-level tenant)
CREATE TABLE organization.labs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en     VARCHAR(200) NOT NULL,
    name_ar     VARCHAR(200),
    logo_url    TEXT,
    address     TEXT,
    phone       VARCHAR(20),
    email       VARCHAR(256),
    website     VARCHAR(500),
    license_no  VARCHAR(100),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    settings    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

-- Branches
CREATE TABLE organization.branches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id          UUID NOT NULL REFERENCES organization.labs(id),
    name_en         VARCHAR(200) NOT NULL,
    name_ar         VARCHAR(200),
    code            VARCHAR(20) UNIQUE NOT NULL,
    address         TEXT NOT NULL,
    city            VARCHAR(100),
    country         VARCHAR(100) NOT NULL DEFAULT 'SA',
    phone           VARCHAR(20),
    email           VARCHAR(256),
    lat             DECIMAL(10,8),
    lng             DECIMAL(11,8),
    working_hours   JSONB,            -- { mon: {open: "08:00", close: "22:00"}, ... }
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_home_collection_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);
CREATE INDEX idx_branches_lab ON organization.branches(lab_id);

-- Staff assignments (user <-> branch)
CREATE TABLE organization.staff_assignments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES identity.users(id),
    branch_id   UUID NOT NULL REFERENCES organization.branches(id),
    role_id     UUID NOT NULL REFERENCES identity.roles(id),
    start_date  DATE NOT NULL,
    end_date    DATE,
    is_primary  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, branch_id, role_id)
);
```

### patients schema

```sql
-- Patients
CREATE TABLE patients.patients (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES identity.users(id),  -- NULL if not portal user
    lab_id              UUID NOT NULL REFERENCES organization.labs(id),
    patient_code        VARCHAR(20) UNIQUE NOT NULL,  -- auto-generated P-YYYYNNNNN
    first_name_en       VARCHAR(100) NOT NULL,
    last_name_en        VARCHAR(100) NOT NULL,
    first_name_ar       VARCHAR(100),
    last_name_ar        VARCHAR(100),
    gender              VARCHAR(10) NOT NULL,  -- Male, Female, Other
    date_of_birth       DATE NOT NULL,
    national_id         TEXT,                  -- encrypted
    passport_no         TEXT,                  -- encrypted
    nationality         VARCHAR(100),
    blood_type          VARCHAR(5),
    primary_phone       VARCHAR(20) NOT NULL,
    secondary_phone     VARCHAR(20),
    email               VARCHAR(256),
    address             JSONB,                 -- { street, city, region, postal, country }
    language_pref       VARCHAR(5) NOT NULL DEFAULT 'en',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID REFERENCES identity.users(id),
    deleted_at          TIMESTAMPTZ
);
CREATE INDEX idx_patients_lab ON patients.patients(lab_id);
CREATE INDEX idx_patients_code ON patients.patients(patient_code);
CREATE INDEX idx_patients_phone ON patients.patients(primary_phone);

-- Family members
CREATE TABLE patients.family_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_patient_id UUID NOT NULL REFERENCES patients.patients(id),
    member_patient_id  UUID NOT NULL REFERENCES patients.patients(id),
    relationship    VARCHAR(50) NOT NULL,  -- Spouse, Child, Parent, Sibling
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (primary_patient_id, member_patient_id)
);

-- Emergency contacts
CREATE TABLE patients.emergency_contacts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id   UUID NOT NULL REFERENCES patients.patients(id) ON DELETE CASCADE,
    name         VARCHAR(200) NOT NULL,
    relationship VARCHAR(50),
    phone        VARCHAR(20) NOT NULL,
    email        VARCHAR(256),
    is_primary   BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_emerg_contacts_patient ON patients.emergency_contacts(patient_id);

-- Insurance
CREATE TABLE patients.insurance_info (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id       UUID NOT NULL REFERENCES patients.patients(id) ON DELETE CASCADE,
    provider_name    VARCHAR(200) NOT NULL,
    policy_number    TEXT NOT NULL,            -- encrypted
    member_id        TEXT,                     -- encrypted
    group_number     VARCHAR(100),
    valid_from       DATE NOT NULL,
    valid_to         DATE,
    coverage_details JSONB,
    is_primary       BOOLEAN NOT NULL DEFAULT TRUE,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_insurance_patient ON patients.insurance_info(patient_id);

-- Medical history
CREATE TABLE patients.medical_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id  UUID NOT NULL REFERENCES patients.patients(id) ON DELETE CASCADE,
    condition   VARCHAR(500) NOT NULL,
    diagnosed_at DATE,
    status      VARCHAR(50),    -- Active, Resolved, Chronic
    notes       TEXT,
    recorded_by UUID REFERENCES identity.users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allergies
CREATE TABLE patients.allergies (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id  UUID NOT NULL REFERENCES patients.patients(id) ON DELETE CASCADE,
    allergen    VARCHAR(200) NOT NULL,
    reaction    VARCHAR(500),
    severity    VARCHAR(50),    -- Mild, Moderate, Severe
    recorded_by UUID REFERENCES identity.users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### clinical schema

```sql
-- Doctors
CREATE TABLE clinical.doctors (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES identity.users(id),
    lab_id              UUID NOT NULL REFERENCES organization.labs(id),
    license_number      VARCHAR(100) UNIQUE NOT NULL,
    specialization_id   UUID REFERENCES clinical.specializations(id),
    signature_url       TEXT,
    digital_cert_path   TEXT,
    bio                 TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);
CREATE INDEX idx_doctors_lab ON clinical.doctors(lab_id);

-- Specializations
CREATE TABLE clinical.specializations (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en  VARCHAR(200) NOT NULL,
    name_ar  VARCHAR(200),
    code     VARCHAR(50) UNIQUE
);

-- Doctor-Branch assignments
CREATE TABLE clinical.doctor_branches (
    doctor_id  UUID NOT NULL REFERENCES clinical.doctors(id),
    branch_id  UUID NOT NULL REFERENCES organization.branches(id),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (doctor_id, branch_id)
);
```

### catalog schema

```sql
-- Test categories
CREATE TABLE catalog.test_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en     VARCHAR(200) NOT NULL,
    name_ar     VARCHAR(200),
    code        VARCHAR(50) UNIQUE NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    icon        VARCHAR(100),
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    parent_id   UUID REFERENCES catalog.test_categories(id)
);

-- Tests
CREATE TABLE catalog.tests (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id                  UUID NOT NULL REFERENCES organization.labs(id),
    category_id             UUID NOT NULL REFERENCES catalog.test_categories(id),
    code                    VARCHAR(50) UNIQUE NOT NULL,
    name_en                 VARCHAR(300) NOT NULL,
    name_ar                 VARCHAR(300),
    description_en          TEXT,
    description_ar          TEXT,
    preparation_en          TEXT,      -- patient preparation instructions
    preparation_ar          TEXT,
    sample_type_id          UUID NOT NULL REFERENCES catalog.sample_types(id),
    turnaround_hours        INT NOT NULL DEFAULT 24,
    price                   DECIMAL(10,3) NOT NULL,
    cost                    DECIMAL(10,3),
    loinc_code              VARCHAR(20),    -- standard code
    cpt_code                VARCHAR(20),
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    requires_doctor_approval BOOLEAN NOT NULL DEFAULT FALSE,
    is_critical_value_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ
);
CREATE INDEX idx_tests_lab ON catalog.tests(lab_id);
CREATE INDEX idx_tests_category ON catalog.tests(category_id);
CREATE INDEX idx_tests_code ON catalog.tests(code);

-- Sample types (Blood, Urine, Stool, Swab, etc.)
CREATE TABLE catalog.sample_types (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en     VARCHAR(100) NOT NULL,
    name_ar     VARCHAR(100),
    code        VARCHAR(20) UNIQUE NOT NULL,
    container   VARCHAR(100),   -- EDTA tube, SST tube, urine cup, etc.
    color_code  VARCHAR(10)     -- tube cap color
);

-- Reference ranges
CREATE TABLE catalog.reference_ranges (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id         UUID NOT NULL REFERENCES catalog.tests(id) ON DELETE CASCADE,
    age_min_months  INT,           -- NULL = no lower age bound
    age_max_months  INT,           -- NULL = no upper age bound
    gender          VARCHAR(10),   -- Male, Female, NULL = both
    value_min       DECIMAL(18,6),
    value_max       DECIMAL(18,6),
    unit            VARCHAR(50),
    text_value      VARCHAR(500),  -- for qualitative tests
    critical_low    DECIMAL(18,6),
    critical_high   DECIMAL(18,6),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_ref_ranges_test ON catalog.reference_ranges(test_id);

-- Branch test pricing (overrides global price per branch)
CREATE TABLE catalog.branch_test_prices (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id   UUID NOT NULL REFERENCES organization.branches(id),
    test_id     UUID NOT NULL REFERENCES catalog.tests(id),
    price       DECIMAL(10,3) NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (branch_id, test_id)
);

-- Health packages
CREATE TABLE catalog.packages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id          UUID NOT NULL REFERENCES organization.labs(id),
    code            VARCHAR(50) UNIQUE NOT NULL,
    name_en         VARCHAR(300) NOT NULL,
    name_ar         VARCHAR(300),
    description_en  TEXT,
    description_ar  TEXT,
    price           DECIMAL(10,3) NOT NULL,
    gender          VARCHAR(10),     -- Male, Female, NULL = both
    min_age_years   INT,
    max_age_years   INT,
    validity_days   INT NOT NULL DEFAULT 30,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Package test items
CREATE TABLE catalog.package_tests (
    package_id  UUID NOT NULL REFERENCES catalog.packages(id) ON DELETE CASCADE,
    test_id     UUID NOT NULL REFERENCES catalog.tests(id),
    PRIMARY KEY (package_id, test_id)
);
```

### appointments schema

```sql
-- Appointments
CREATE TABLE appointments.appointments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_no      VARCHAR(20) UNIQUE NOT NULL,  -- APT-YYYYMMDD-NNN
    branch_id           UUID NOT NULL REFERENCES organization.branches(id),
    patient_id          UUID NOT NULL REFERENCES patients.patients(id),
    booked_by           UUID REFERENCES identity.users(id),
    scheduled_at        TIMESTAMPTZ NOT NULL,
    duration_minutes    INT NOT NULL DEFAULT 30,
    type                VARCHAR(50) NOT NULL,    -- WalkIn, Appointment, HomeCollection
    status              VARCHAR(50) NOT NULL DEFAULT 'Pending',
    check_in_at         TIMESTAMPTZ,
    check_out_at        TIMESTAMPTZ,
    notes               TEXT,
    cancellation_reason TEXT,
    cancelled_by        UUID REFERENCES identity.users(id),
    cancelled_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID REFERENCES identity.users(id)
);
CREATE INDEX idx_appt_branch ON appointments.appointments(branch_id);
CREATE INDEX idx_appt_patient ON appointments.appointments(patient_id);
CREATE INDEX idx_appt_scheduled ON appointments.appointments(scheduled_at);
CREATE INDEX idx_appt_status ON appointments.appointments(status);

-- Appointment test items
CREATE TABLE appointments.appointment_tests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id  UUID NOT NULL REFERENCES appointments.appointments(id) ON DELETE CASCADE,
    test_id         UUID REFERENCES catalog.tests(id),
    package_id      UUID REFERENCES catalog.packages(id),
    price           DECIMAL(10,3) NOT NULL,
    discount        DECIMAL(10,3) NOT NULL DEFAULT 0,
    notes           TEXT,
    CHECK (test_id IS NOT NULL OR package_id IS NOT NULL)
);
CREATE INDEX idx_appt_tests_appt ON appointments.appointment_tests(appointment_id);

-- Home collection requests
CREATE TABLE appointments.home_collections (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id      UUID NOT NULL UNIQUE REFERENCES appointments.appointments(id),
    address             JSONB NOT NULL,
    lat                 DECIMAL(10,8),
    lng                 DECIMAL(11,8),
    preferred_time      TIMESTAMPTZ NOT NULL,
    assigned_staff_id   UUID REFERENCES identity.users(id),
    visit_status        VARCHAR(50) NOT NULL DEFAULT 'Pending',
    dispatched_at       TIMESTAMPTZ,
    arrived_at          TIMESTAMPTZ,
    collected_at        TIMESTAMPTZ,
    collection_notes    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### samples schema

```sql
-- Samples
CREATE TABLE samples.samples (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_no       VARCHAR(30) UNIQUE NOT NULL,   -- auto-generated
    barcode         VARCHAR(50) UNIQUE NOT NULL,
    qr_code         VARCHAR(200),
    appointment_id  UUID NOT NULL REFERENCES appointments.appointments(id),
    patient_id      UUID NOT NULL REFERENCES patients.patients(id),
    branch_id       UUID NOT NULL REFERENCES organization.branches(id),
    test_id         UUID NOT NULL REFERENCES catalog.tests(id),
    sample_type_id  UUID NOT NULL REFERENCES catalog.sample_types(id),
    status          VARCHAR(50) NOT NULL DEFAULT 'Registered',
    tube_label      VARCHAR(100),
    volume_ml       DECIMAL(6,2),
    collected_by    UUID REFERENCES identity.users(id),
    collected_at    TIMESTAMPTZ,
    received_by     UUID REFERENCES identity.users(id),
    received_at     TIMESTAMPTZ,
    rejected_reason TEXT,
    rejected_at     TIMESTAMPTZ,
    rejected_by     UUID REFERENCES identity.users(id),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_samples_barcode ON samples.samples(barcode);
CREATE INDEX idx_samples_patient ON samples.samples(patient_id);
CREATE INDEX idx_samples_branch ON samples.samples(branch_id);
CREATE INDEX idx_samples_status ON samples.samples(status);

-- Sample tracking events (chain of custody)
CREATE TABLE samples.sample_tracking (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_id   UUID NOT NULL REFERENCES samples.samples(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status   VARCHAR(50) NOT NULL,
    performed_by UUID NOT NULL REFERENCES identity.users(id),
    location    VARCHAR(200),
    notes       TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sample_tracking_sample ON samples.sample_tracking(sample_id);
```

### results schema

```sql
-- Test results
CREATE TABLE results.test_results (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_no           VARCHAR(30) UNIQUE NOT NULL,
    sample_id           UUID NOT NULL UNIQUE REFERENCES samples.samples(id),
    patient_id          UUID NOT NULL REFERENCES patients.patients(id),
    test_id             UUID NOT NULL REFERENCES catalog.tests(id),
    branch_id           UUID NOT NULL REFERENCES organization.branches(id),
    status              VARCHAR(50) NOT NULL DEFAULT 'Draft',
    numeric_value       DECIMAL(18,6),
    text_value          TEXT,
    unit                VARCHAR(50),
    is_abnormal         BOOLEAN NOT NULL DEFAULT FALSE,
    is_critical         BOOLEAN NOT NULL DEFAULT FALSE,
    result_interpretation VARCHAR(50),  -- Normal, Low, High, CriticalLow, CriticalHigh
    reference_range_id  UUID REFERENCES catalog.reference_ranges(id),
    entered_by          UUID NOT NULL REFERENCES identity.users(id),
    entered_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by         UUID REFERENCES identity.users(id),
    reviewed_at         TIMESTAMPTZ,
    approved_by         UUID REFERENCES identity.users(id),
    approved_at         TIMESTAMPTZ,
    released_by         UUID REFERENCES identity.users(id),
    released_at         TIMESTAMPTZ,
    raw_data            JSONB,          -- imported analyzer data
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_results_patient ON results.test_results(patient_id);
CREATE INDEX idx_results_branch ON results.test_results(branch_id);
CREATE INDEX idx_results_status ON results.test_results(status);

-- Result comments / notes
CREATE TABLE results.result_notes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id   UUID NOT NULL REFERENCES results.test_results(id) ON DELETE CASCADE,
    note        TEXT NOT NULL,
    note_type   VARCHAR(50) NOT NULL DEFAULT 'General',  -- General, TechNote, DoctorNote, Critical
    is_visible_to_patient BOOLEAN NOT NULL DEFAULT FALSE,
    created_by  UUID NOT NULL REFERENCES identity.users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Retest requests
CREATE TABLE results.retest_requests (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id   UUID NOT NULL REFERENCES results.test_results(id),
    requested_by UUID NOT NULL REFERENCES identity.users(id),
    reason      TEXT NOT NULL,
    status      VARCHAR(50) NOT NULL DEFAULT 'Pending',  -- Pending, Approved, Rejected, Completed
    resolved_by UUID REFERENCES identity.users(id),
    resolved_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### reports schema

```sql
-- Lab reports (aggregate of results for a visit)
CREATE TABLE reports.lab_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_no           VARCHAR(30) UNIQUE NOT NULL,  -- RPT-YYYYMMDD-NNN
    appointment_id      UUID NOT NULL REFERENCES appointments.appointments(id),
    patient_id          UUID NOT NULL REFERENCES patients.patients(id),
    branch_id           UUID NOT NULL REFERENCES organization.branches(id),
    doctor_id           UUID REFERENCES clinical.doctors(id),
    status              VARCHAR(50) NOT NULL DEFAULT 'Draft',
    generated_at        TIMESTAMPTZ,
    signed_by           UUID REFERENCES clinical.doctors(id),
    signed_at           TIMESTAMPTZ,
    digital_signature   TEXT,
    qr_verification     VARCHAR(500),
    pdf_path            TEXT,
    language            VARCHAR(5) NOT NULL DEFAULT 'en',
    is_released         BOOLEAN NOT NULL DEFAULT FALSE,
    released_at         TIMESTAMPTZ,
    released_by         UUID REFERENCES identity.users(id),
    download_count      INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reports_patient ON reports.lab_reports(patient_id);
CREATE INDEX idx_reports_appointment ON reports.lab_reports(appointment_id);
CREATE INDEX idx_reports_no ON reports.lab_reports(report_no);

-- Report result items
CREATE TABLE reports.report_results (
    report_id   UUID NOT NULL REFERENCES reports.lab_reports(id) ON DELETE CASCADE,
    result_id   UUID NOT NULL REFERENCES results.test_results(id),
    sort_order  INT NOT NULL DEFAULT 0,
    PRIMARY KEY (report_id, result_id)
);

-- Report shares
CREATE TABLE reports.report_shares (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id   UUID NOT NULL REFERENCES reports.lab_reports(id),
    share_token VARCHAR(200) UNIQUE NOT NULL,
    shared_with VARCHAR(256),  -- email
    expires_at  TIMESTAMPTZ NOT NULL,
    accessed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### inventory schema

```sql
-- Inventory items
CREATE TABLE inventory.items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id          UUID NOT NULL REFERENCES organization.labs(id),
    category        VARCHAR(100) NOT NULL,  -- Reagent, Consumable, Equipment, TestKit
    code            VARCHAR(50) UNIQUE NOT NULL,
    name_en         VARCHAR(300) NOT NULL,
    name_ar         VARCHAR(300),
    description     TEXT,
    unit            VARCHAR(50) NOT NULL,
    reorder_level   DECIMAL(10,3) NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Branch inventory stock
CREATE TABLE inventory.stock (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID NOT NULL REFERENCES inventory.items(id),
    branch_id       UUID NOT NULL REFERENCES organization.branches(id),
    batch_no        VARCHAR(100),
    lot_no          VARCHAR(100),
    quantity        DECIMAL(10,3) NOT NULL DEFAULT 0,
    unit_cost       DECIMAL(10,3),
    manufactured_at DATE,
    expires_at      DATE,
    received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    received_by     UUID REFERENCES identity.users(id),
    supplier        VARCHAR(200),
    notes           TEXT,
    UNIQUE (item_id, branch_id, batch_no)
);
CREATE INDEX idx_stock_item ON inventory.stock(item_id);
CREATE INDEX idx_stock_branch ON inventory.stock(branch_id);
CREATE INDEX idx_stock_expiry ON inventory.stock(expires_at);

-- Stock transactions
CREATE TABLE inventory.stock_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id        UUID NOT NULL REFERENCES inventory.stock(id),
    branch_id       UUID NOT NULL REFERENCES organization.branches(id),
    type            VARCHAR(50) NOT NULL,  -- Receipt, Issue, Adjustment, Return, Waste
    quantity        DECIMAL(10,3) NOT NULL,
    reference_id    UUID,       -- sample_id or order_id
    reference_type  VARCHAR(50),
    performed_by    UUID NOT NULL REFERENCES identity.users(id),
    notes           TEXT,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purchase orders
CREATE TABLE inventory.purchase_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id       UUID NOT NULL REFERENCES organization.branches(id),
    order_no        VARCHAR(30) UNIQUE NOT NULL,
    supplier        VARCHAR(200) NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'Draft',
    ordered_at      TIMESTAMPTZ,
    expected_at     DATE,
    received_at     TIMESTAMPTZ,
    total_amount    DECIMAL(12,3),
    notes           TEXT,
    created_by      UUID NOT NULL REFERENCES identity.users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purchase order items
CREATE TABLE inventory.purchase_order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES inventory.purchase_orders(id) ON DELETE CASCADE,
    item_id         UUID NOT NULL REFERENCES inventory.items(id),
    quantity        DECIMAL(10,3) NOT NULL,
    unit_price      DECIMAL(10,3),
    received_qty    DECIMAL(10,3) NOT NULL DEFAULT 0
);
```

### billing schema

```sql
-- Invoices
CREATE TABLE billing.invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no      VARCHAR(30) UNIQUE NOT NULL,
    appointment_id  UUID NOT NULL REFERENCES appointments.appointments(id),
    patient_id      UUID NOT NULL REFERENCES patients.patients(id),
    branch_id       UUID NOT NULL REFERENCES organization.branches(id),
    subtotal        DECIMAL(12,3) NOT NULL,
    discount        DECIMAL(12,3) NOT NULL DEFAULT 0,
    tax             DECIMAL(12,3) NOT NULL DEFAULT 0,
    total           DECIMAL(12,3) NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'Draft',  -- Draft, Issued, Partial, Paid, Void
    insurance_id    UUID REFERENCES patients.insurance_info(id),
    insurance_amount DECIMAL(12,3),
    patient_amount  DECIMAL(12,3),
    due_date        DATE,
    notes           TEXT,
    created_by      UUID NOT NULL REFERENCES identity.users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_invoices_patient ON billing.invoices(patient_id);
CREATE INDEX idx_invoices_branch ON billing.invoices(branch_id);
CREATE INDEX idx_invoices_status ON billing.invoices(status);

-- Invoice line items
CREATE TABLE billing.invoice_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id      UUID NOT NULL REFERENCES billing.invoices(id) ON DELETE CASCADE,
    appointment_test_id UUID REFERENCES appointments.appointment_tests(id),
    description     VARCHAR(500) NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    unit_price      DECIMAL(10,3) NOT NULL,
    discount        DECIMAL(10,3) NOT NULL DEFAULT 0,
    total           DECIMAL(10,3) NOT NULL
);

-- Payments
CREATE TABLE billing.payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_no      VARCHAR(30) UNIQUE NOT NULL,
    invoice_id      UUID NOT NULL REFERENCES billing.invoices(id),
    amount          DECIMAL(12,3) NOT NULL,
    method          VARCHAR(50) NOT NULL,  -- Cash, Card, Insurance, BankTransfer, Online
    reference_no    VARCHAR(100),
    status          VARCHAR(50) NOT NULL DEFAULT 'Completed',
    processed_by    UUID NOT NULL REFERENCES identity.users(id),
    processed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes           TEXT
);
CREATE INDEX idx_payments_invoice ON billing.payments(invoice_id);

-- Refunds
CREATE TABLE billing.refunds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id      UUID NOT NULL REFERENCES billing.payments(id),
    amount          DECIMAL(12,3) NOT NULL,
    reason          TEXT NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'Pending',
    approved_by     UUID REFERENCES identity.users(id),
    approved_at     TIMESTAMPTZ,
    processed_at    TIMESTAMPTZ,
    created_by      UUID NOT NULL REFERENCES identity.users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### notifications schema

```sql
-- Notification templates
CREATE TABLE notifications.templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(100) UNIQUE NOT NULL,  -- e.g. APPOINTMENT_CONFIRMED
    name        VARCHAR(200) NOT NULL,
    channel     VARCHAR(50) NOT NULL,  -- Email, SMS, WhatsApp, Push
    subject_en  VARCHAR(500),
    subject_ar  VARCHAR(500),
    body_en     TEXT NOT NULL,
    body_ar     TEXT,
    variables   JSONB,            -- list of placeholder vars
    is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- Notification log
CREATE TABLE notifications.notification_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id     UUID REFERENCES notifications.templates(id),
    user_id         UUID REFERENCES identity.users(id),
    patient_id      UUID REFERENCES patients.patients(id),
    channel         VARCHAR(50) NOT NULL,
    recipient       VARCHAR(256) NOT NULL,
    subject         VARCHAR(500),
    body            TEXT NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'Pending',
    sent_at         TIMESTAMPTZ,
    failed_at       TIMESTAMPTZ,
    error_message   TEXT,
    reference_id    UUID,
    reference_type  VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notif_log_patient ON notifications.notification_log(patient_id);
CREATE INDEX idx_notif_log_status ON notifications.notification_log(status);
```

### audit schema

```sql
-- Audit log (append-only — never update or delete rows)
CREATE TABLE audit.audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    entity_type     VARCHAR(200) NOT NULL,
    entity_id       UUID NOT NULL,
    action          VARCHAR(50) NOT NULL,  -- Create, Update, Delete, Read, Login, Logout
    user_id         UUID REFERENCES identity.users(id),
    branch_id       UUID REFERENCES organization.branches(id),
    ip_address      INET,
    user_agent      TEXT,
    old_values      JSONB,
    new_values      JSONB,
    additional_data JSONB,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_entity ON audit.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit.audit_logs(user_id);
CREATE INDEX idx_audit_occurred ON audit.audit_logs(occurred_at);
```

---

## Key Indexes Summary

| Table | Index | Reason |
|-------|-------|--------|
| patients.patients | phone, code | Lookup by phone at reception |
| samples.samples | barcode | Barcode scanner lookup |
| appointments | scheduled_at, status | Calendar queries |
| results.test_results | patient_id, status | Patient history, worklist |
| billing.invoices | patient_id, status | Billing queries |
| audit.audit_logs | occurred_at | Time-range audit queries |

---

## Enumeration Values

| Enum | Values |
|------|--------|
| AppointmentStatus | Pending, Confirmed, CheckedIn, InProgress, Completed, Cancelled, NoShow |
| AppointmentType | WalkIn, Scheduled, HomeCollection |
| SampleStatus | Registered, Collected, InTransit, Received, Processing, QualityControl, Rejected, Stored |
| ResultStatus | Draft, TechReview, SeniorReview, DoctorReview, Approved, Released, Amended |
| InvoiceStatus | Draft, Issued, PartiallyPaid, Paid, Void, Refunded |
| PaymentMethod | Cash, CreditCard, DebitCard, Insurance, BankTransfer, OnlinePayment |
| HomeCollectionStatus | Pending, Assigned, Dispatched, Arrived, Collected, Cancelled |
| InventoryCategory | Reagent, Consumable, Equipment, TestKit, Safety |
| StockTransactionType | Receipt, Issue, Adjustment, Return, Waste, Transfer |
| NotificationChannel | Email, SMS, WhatsApp, Push |
| UserRole | SuperAdmin, Owner, BranchManager, Doctor, LabTechnician, Receptionist, Phlebotomist, Patient |
