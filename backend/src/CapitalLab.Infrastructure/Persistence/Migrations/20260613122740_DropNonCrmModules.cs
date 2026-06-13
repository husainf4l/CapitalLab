using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CapitalLab.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class DropNonCrmModules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_test_results_samples_sample_id",
                schema: "laboratory",
                table: "test_results");

            migrationBuilder.DropTable(
                name: "analyzer_results",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "critical_result_alerts",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "critical_result_rules",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "doctor_reviews",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "insurance_claims",
                schema: "insurance");

            migrationBuilder.DropTable(
                name: "insurance_providers",
                schema: "insurance");

            migrationBuilder.DropTable(
                name: "inventory_items",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "inventory_transactions",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "invoice_items",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "payments",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "purchase_order_items",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "quality_control_records",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "sample_items",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "analyzer_imports",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "invoices",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "purchase_orders",
                schema: "inventory");

            migrationBuilder.DropTable(
                name: "samples",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "analyzers",
                schema: "laboratory");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "insurance");

            migrationBuilder.EnsureSchema(
                name: "inventory");

            migrationBuilder.EnsureSchema(
                name: "billing");

            migrationBuilder.CreateTable(
                name: "analyzers",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    manufacturer = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    model = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    serial_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_analyzers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "critical_result_alerts",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_result_id = table.Column<Guid>(type: "uuid", nullable: false),
                    acknowledged_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    acknowledged_by = table.Column<Guid>(type: "uuid", nullable: true),
                    is_acknowledged = table.Column<bool>(type: "boolean", nullable: false),
                    row_version = table.Column<long>(type: "bigint", nullable: false),
                    trigger_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    triggered_at = table.Column<DateTime>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_critical_result_alerts", x => x.id);
                    table.ForeignKey(
                        name: "fk_critical_result_alerts_test_results_test_result_id",
                        column: x => x.test_result_id,
                        principalSchema: "laboratory",
                        principalTable: "test_results",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "critical_result_rules",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    is_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    lab_test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    max_critical_value = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    min_critical_value = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_critical_result_rules", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "doctor_reviews",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    doctor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    sample_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_doctor_reviews", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "insurance_claims",
                schema: "insurance",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    approved_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    approved_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    claim_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    claim_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    invoice_id = table.Column<Guid>(type: "uuid", nullable: false),
                    paid_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    provider_id = table.Column<Guid>(type: "uuid", nullable: false),
                    rejected_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    rejected_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    rejection_reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    submitted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_insurance_claims", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "insurance_providers",
                schema: "insurance",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    contact_person = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_insurance_providers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "inventory_items",
                schema: "inventory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    batch_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    cost_price = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    current_stock = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    expiry_date = table.Column<DateOnly>(type: "date", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    maximum_stock = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    minimum_stock = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    supplier_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_inventory_items", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "inventory_transactions",
                schema: "inventory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    inventory_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    reference_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    total_cost = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    transaction_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    unit_cost = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_inventory_transactions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "invoices",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    balance_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    discount_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    due_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    invoice_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    issued_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    paid_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    subtotal_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    tax_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    test_order_id = table.Column<Guid>(type: "uuid", nullable: true),
                    total_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_invoices", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "payments",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    invoice_id = table.Column<Guid>(type: "uuid", nullable: false),
                    method = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    paid_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    transaction_reference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_payments", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "purchase_orders",
                schema: "inventory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    order_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ordered_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    received_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    supplier_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_purchase_orders", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "samples",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    barcode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    barcode_image_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    collected_by_staff_id = table.Column<Guid>(type: "uuid", nullable: true),
                    collection_date_time = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    processing_completed_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    processing_started_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    qr_code = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    qr_code_image_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    received_date_time = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    rejection_reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    sample_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    sample_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    test_order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_samples", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "analyzer_imports",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    analyzer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    error_message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    file_name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    import_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    imported_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    processed_rows = table.Column<int>(type: "integer", nullable: false),
                    raw_content = table.Column<string>(type: "text", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    sample_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    total_rows = table.Column<int>(type: "integer", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_analyzer_imports", x => x.id);
                    table.ForeignKey(
                        name: "fk_analyzer_imports_analyzers_analyzer_id",
                        column: x => x.analyzer_id,
                        principalSchema: "laboratory",
                        principalTable: "analyzers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "invoice_items",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    invoice_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    item_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    reference_id = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    total_price = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_invoice_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_invoice_items_invoices_invoice_id",
                        column: x => x.invoice_id,
                        principalSchema: "billing",
                        principalTable: "invoices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "purchase_order_items",
                schema: "inventory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    purchase_order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    inventory_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    total_cost = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    unit_cost = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_purchase_order_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_purchase_order_items_purchase_orders_purchase_order_id",
                        column: x => x.purchase_order_id,
                        principalSchema: "inventory",
                        principalTable: "purchase_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "quality_control_records",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    sample_id = table.Column<Guid>(type: "uuid", nullable: false),
                    checked_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    checked_by = table.Column<Guid>(type: "uuid", nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    result = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    row_version = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_quality_control_records", x => x.id);
                    table.ForeignKey(
                        name: "fk_quality_control_records_samples_sample_id",
                        column: x => x.sample_id,
                        principalSchema: "laboratory",
                        principalTable: "samples",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "sample_items",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    sample_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lab_test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    row_version = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    test_order_item_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sample_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_sample_items_samples_sample_id",
                        column: x => x.sample_id,
                        principalSchema: "laboratory",
                        principalTable: "samples",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "analyzer_results",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    analyzer_import_id = table.Column<Guid>(type: "uuid", nullable: false),
                    imported_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    is_reviewed = table.Column<bool>(type: "boolean", nullable: false),
                    lab_test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    row_version = table.Column<long>(type: "bigint", nullable: false),
                    sample_id = table.Column<Guid>(type: "uuid", nullable: false),
                    unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    value = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_analyzer_results", x => x.id);
                    table.ForeignKey(
                        name: "fk_analyzer_results_analyzer_imports_analyzer_import_id",
                        column: x => x.analyzer_import_id,
                        principalSchema: "laboratory",
                        principalTable: "analyzer_imports",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_analyzer_imports_analyzer_id",
                schema: "laboratory",
                table: "analyzer_imports",
                column: "analyzer_id");

            migrationBuilder.CreateIndex(
                name: "ix_analyzer_imports_sample_id",
                schema: "laboratory",
                table: "analyzer_imports",
                column: "sample_id");

            migrationBuilder.CreateIndex(
                name: "ix_analyzer_results_analyzer_import_id",
                schema: "laboratory",
                table: "analyzer_results",
                column: "analyzer_import_id");

            migrationBuilder.CreateIndex(
                name: "ix_analyzer_results_lab_test_id",
                schema: "laboratory",
                table: "analyzer_results",
                column: "lab_test_id");

            migrationBuilder.CreateIndex(
                name: "ix_analyzer_results_sample_id",
                schema: "laboratory",
                table: "analyzer_results",
                column: "sample_id");

            migrationBuilder.CreateIndex(
                name: "ix_analyzers_branch_id",
                schema: "laboratory",
                table: "analyzers",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "ix_critical_result_alerts_is_acknowledged",
                schema: "laboratory",
                table: "critical_result_alerts",
                column: "is_acknowledged");

            migrationBuilder.CreateIndex(
                name: "ix_critical_result_alerts_test_result_id",
                schema: "laboratory",
                table: "critical_result_alerts",
                column: "test_result_id");

            migrationBuilder.CreateIndex(
                name: "ix_critical_result_rules_lab_test_id",
                schema: "laboratory",
                table: "critical_result_rules",
                column: "lab_test_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_doctor_reviews_doctor_id",
                schema: "laboratory",
                table: "doctor_reviews",
                column: "doctor_id");

            migrationBuilder.CreateIndex(
                name: "ix_doctor_reviews_sample_id",
                schema: "laboratory",
                table: "doctor_reviews",
                column: "sample_id");

            migrationBuilder.CreateIndex(
                name: "ix_doctor_reviews_status",
                schema: "laboratory",
                table: "doctor_reviews",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_insurance_claims_invoice_id",
                schema: "insurance",
                table: "insurance_claims",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "ix_insurance_claims_number",
                schema: "insurance",
                table: "insurance_claims",
                column: "claim_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_insurance_claims_patient_id",
                schema: "insurance",
                table: "insurance_claims",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "ix_insurance_claims_provider_id",
                schema: "insurance",
                table: "insurance_claims",
                column: "provider_id");

            migrationBuilder.CreateIndex(
                name: "ix_insurance_claims_status",
                schema: "insurance",
                table: "insurance_claims",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_insurance_providers_active",
                schema: "insurance",
                table: "insurance_providers",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_insurance_providers_code",
                schema: "insurance",
                table: "insurance_providers",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_inventory_items_branch_code",
                schema: "inventory",
                table: "inventory_items",
                columns: new[] { "branch_id", "code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_inventory_items_branch_id",
                schema: "inventory",
                table: "inventory_items",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "ix_inventory_items_category",
                schema: "inventory",
                table: "inventory_items",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "ix_inventory_items_expiry",
                schema: "inventory",
                table: "inventory_items",
                column: "expiry_date");

            migrationBuilder.CreateIndex(
                name: "ix_inventory_transactions_branch_id",
                schema: "inventory",
                table: "inventory_transactions",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "ix_inventory_transactions_item_id",
                schema: "inventory",
                table: "inventory_transactions",
                column: "inventory_item_id");

            migrationBuilder.CreateIndex(
                name: "ix_inventory_transactions_type",
                schema: "inventory",
                table: "inventory_transactions",
                column: "transaction_type");

            migrationBuilder.CreateIndex(
                name: "ix_invoice_items_invoice_id",
                schema: "billing",
                table: "invoice_items",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "ix_invoices_branch_id",
                schema: "billing",
                table: "invoices",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "ix_invoices_number",
                schema: "billing",
                table: "invoices",
                column: "invoice_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_invoices_patient_id",
                schema: "billing",
                table: "invoices",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "ix_invoices_status",
                schema: "billing",
                table: "invoices",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_invoices_test_order_id",
                schema: "billing",
                table: "invoices",
                column: "test_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_payments_branch_id",
                schema: "billing",
                table: "payments",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "ix_payments_invoice_id",
                schema: "billing",
                table: "payments",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "ix_payments_patient_id",
                schema: "billing",
                table: "payments",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "ix_payments_status",
                schema: "billing",
                table: "payments",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_purchase_order_items_item_id",
                schema: "inventory",
                table: "purchase_order_items",
                column: "inventory_item_id");

            migrationBuilder.CreateIndex(
                name: "ix_purchase_order_items_po_id",
                schema: "inventory",
                table: "purchase_order_items",
                column: "purchase_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_purchase_orders_branch_id",
                schema: "inventory",
                table: "purchase_orders",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "ix_purchase_orders_number",
                schema: "inventory",
                table: "purchase_orders",
                column: "order_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_purchase_orders_status",
                schema: "inventory",
                table: "purchase_orders",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_quality_control_records_sample_id",
                schema: "laboratory",
                table: "quality_control_records",
                column: "sample_id");

            migrationBuilder.CreateIndex(
                name: "ix_sample_items_lab_test_id",
                schema: "laboratory",
                table: "sample_items",
                column: "lab_test_id");

            migrationBuilder.CreateIndex(
                name: "ix_sample_items_sample_id",
                schema: "laboratory",
                table: "sample_items",
                column: "sample_id");

            migrationBuilder.CreateIndex(
                name: "ix_sample_items_test_order_item_id",
                schema: "laboratory",
                table: "sample_items",
                column: "test_order_item_id");

            migrationBuilder.CreateIndex(
                name: "ix_samples_barcode",
                schema: "laboratory",
                table: "samples",
                column: "barcode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_samples_branch_id",
                schema: "laboratory",
                table: "samples",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "ix_samples_patient_id",
                schema: "laboratory",
                table: "samples",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "ix_samples_sample_number",
                schema: "laboratory",
                table: "samples",
                column: "sample_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_samples_status",
                schema: "laboratory",
                table: "samples",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_samples_test_order_id",
                schema: "laboratory",
                table: "samples",
                column: "test_order_id");

            migrationBuilder.AddForeignKey(
                name: "fk_test_results_samples_sample_id",
                schema: "laboratory",
                table: "test_results",
                column: "sample_id",
                principalSchema: "laboratory",
                principalTable: "samples",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
