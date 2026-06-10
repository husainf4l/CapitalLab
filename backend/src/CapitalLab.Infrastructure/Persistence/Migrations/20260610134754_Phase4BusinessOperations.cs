using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CapitalLab.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase4BusinessOperations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "insurance");

            migrationBuilder.EnsureSchema(
                name: "inventory");

            migrationBuilder.EnsureSchema(
                name: "billing");

            migrationBuilder.CreateTable(
                name: "insurance_claims",
                schema: "insurance",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    claim_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    invoice_id = table.Column<Guid>(type: "uuid", nullable: false),
                    provider_id = table.Column<Guid>(type: "uuid", nullable: false),
                    claim_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    approved_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    rejected_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    submitted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    rejected_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    paid_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    rejection_reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true)
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
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    contact_person = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true)
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
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    current_stock = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    minimum_stock = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    maximum_stock = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    cost_price = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    supplier_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    expiry_date = table.Column<DateOnly>(type: "date", nullable: true),
                    batch_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true)
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
                    inventory_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    transaction_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    unit_cost = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    total_cost = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    reference_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true)
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
                    invoice_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_order_id = table.Column<Guid>(type: "uuid", nullable: true),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subtotal_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    tax_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    paid_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    balance_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    issued_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    due_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true)
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
                    invoice_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    method = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    transaction_reference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    paid_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true)
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
                    supplier_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    order_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ordered_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    received_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_purchase_orders", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "invoice_items",
                schema: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    invoice_id = table.Column<Guid>(type: "uuid", nullable: false),
                    description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    item_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    reference_id = table.Column<Guid>(type: "uuid", nullable: true),
                    quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    total_price = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true)
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
                    inventory_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    unit_cost = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    total_cost = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true)
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
                name: "invoices",
                schema: "billing");

            migrationBuilder.DropTable(
                name: "purchase_orders",
                schema: "inventory");
        }
    }
}
