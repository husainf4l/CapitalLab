using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CapitalLab.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase2Operations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "operations");

            migrationBuilder.CreateTable(
                name: "appointments",
                schema: "operations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointment_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointment_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    appointment_date = table.Column<DateOnly>(type: "date", nullable: false),
                    start_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    end_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    cancellation_reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    confirmed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cancelled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("pk_appointments", x => x.id);
                    table.ForeignKey(
                        name: "fk_appointments_branches_branch_id",
                        column: x => x.branch_id,
                        principalSchema: "organization",
                        principalTable: "branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_appointments_patients_patient_id",
                        column: x => x.patient_id,
                        principalSchema: "people",
                        principalTable: "patients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "appointment_items",
                schema: "operations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lab_test_id = table.Column<Guid>(type: "uuid", nullable: true),
                    health_package_id = table.Column<Guid>(type: "uuid", nullable: true),
                    item_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    name_snapshot = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    code_snapshot = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    price_snapshot = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    currency_snapshot = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_appointment_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_appointment_items_appointments_appointment_id",
                        column: x => x.appointment_id,
                        principalSchema: "operations",
                        principalTable: "appointments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_appointment_items_health_packages_health_package_id",
                        column: x => x.health_package_id,
                        principalSchema: "catalog",
                        principalTable: "health_packages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_appointment_items_lab_tests_lab_test_id",
                        column: x => x.lab_test_id,
                        principalSchema: "catalog",
                        principalTable: "lab_tests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "appointment_status_history",
                schema: "operations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    old_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    new_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    changed_by = table.Column<Guid>(type: "uuid", nullable: true),
                    changed_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_appointment_status_history", x => x.id);
                    table.ForeignKey(
                        name: "fk_appointment_status_history_appointments_appointment_id",
                        column: x => x.appointment_id,
                        principalSchema: "operations",
                        principalTable: "appointments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "home_collection_requests",
                schema: "operations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    area = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    latitude = table.Column<decimal>(type: "numeric(10,7)", precision: 10, scale: 7, nullable: true),
                    longitude = table.Column<decimal>(type: "numeric(10,7)", precision: 10, scale: 7, nullable: true),
                    preferred_date = table.Column<DateOnly>(type: "date", nullable: false),
                    preferred_time_from = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    preferred_time_to = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    assigned_staff_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    collection_notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    assigned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    collected_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("pk_home_collection_requests", x => x.id);
                    table.ForeignKey(
                        name: "fk_home_collection_requests_appointments_appointment_id",
                        column: x => x.appointment_id,
                        principalSchema: "operations",
                        principalTable: "appointments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_home_collection_requests_patients_patient_id",
                        column: x => x.patient_id,
                        principalSchema: "people",
                        principalTable: "patients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_home_collection_requests_staff_profiles_assigned_staff_id",
                        column: x => x.assigned_staff_id,
                        principalSchema: "people",
                        principalTable: "staff_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "test_orders",
                schema: "operations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    order_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    subtotal_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    currency = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    cancellation_reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("pk_test_orders", x => x.id);
                    table.ForeignKey(
                        name: "fk_test_orders_appointments_appointment_id",
                        column: x => x.appointment_id,
                        principalSchema: "operations",
                        principalTable: "appointments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_test_orders_branches_branch_id",
                        column: x => x.branch_id,
                        principalSchema: "organization",
                        principalTable: "branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_test_orders_patients_patient_id",
                        column: x => x.patient_id,
                        principalSchema: "people",
                        principalTable: "patients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "test_order_items",
                schema: "operations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lab_test_id = table.Column<Guid>(type: "uuid", nullable: true),
                    health_package_id = table.Column<Guid>(type: "uuid", nullable: true),
                    item_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    name_snapshot = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    code_snapshot = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    total_price = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    currency = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_test_order_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_test_order_items_health_packages_health_package_id",
                        column: x => x.health_package_id,
                        principalSchema: "catalog",
                        principalTable: "health_packages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_test_order_items_lab_tests_lab_test_id",
                        column: x => x.lab_test_id,
                        principalSchema: "catalog",
                        principalTable: "lab_tests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_test_order_items_test_orders_test_order_id",
                        column: x => x.test_order_id,
                        principalSchema: "operations",
                        principalTable: "test_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_appointment_items_appointment_id",
                schema: "operations",
                table: "appointment_items",
                column: "appointment_id");

            migrationBuilder.CreateIndex(
                name: "ix_appointment_items_health_package_id",
                schema: "operations",
                table: "appointment_items",
                column: "health_package_id");

            migrationBuilder.CreateIndex(
                name: "ix_appointment_items_lab_test_id",
                schema: "operations",
                table: "appointment_items",
                column: "lab_test_id");

            migrationBuilder.CreateIndex(
                name: "ix_appointment_status_history_appointment_id",
                schema: "operations",
                table: "appointment_status_history",
                column: "appointment_id");

            migrationBuilder.CreateIndex(
                name: "ix_appointments_branch_id",
                schema: "operations",
                table: "appointments",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "ix_appointments_date",
                schema: "operations",
                table: "appointments",
                column: "appointment_date");

            migrationBuilder.CreateIndex(
                name: "ix_appointments_number",
                schema: "operations",
                table: "appointments",
                column: "appointment_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_appointments_patient_id",
                schema: "operations",
                table: "appointments",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "ix_appointments_status",
                schema: "operations",
                table: "appointments",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_home_collection_requests_appointment_id",
                schema: "operations",
                table: "home_collection_requests",
                column: "appointment_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_home_collection_requests_assigned_staff_id",
                schema: "operations",
                table: "home_collection_requests",
                column: "assigned_staff_id");

            migrationBuilder.CreateIndex(
                name: "ix_home_collection_requests_patient_id",
                schema: "operations",
                table: "home_collection_requests",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "ix_home_collection_requests_status",
                schema: "operations",
                table: "home_collection_requests",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_test_order_items_health_package_id",
                schema: "operations",
                table: "test_order_items",
                column: "health_package_id");

            migrationBuilder.CreateIndex(
                name: "ix_test_order_items_lab_test_id",
                schema: "operations",
                table: "test_order_items",
                column: "lab_test_id");

            migrationBuilder.CreateIndex(
                name: "ix_test_order_items_test_order_id",
                schema: "operations",
                table: "test_order_items",
                column: "test_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_test_orders_appointment_id",
                schema: "operations",
                table: "test_orders",
                column: "appointment_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_test_orders_branch_id",
                schema: "operations",
                table: "test_orders",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "ix_test_orders_order_number",
                schema: "operations",
                table: "test_orders",
                column: "order_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_test_orders_patient_id",
                schema: "operations",
                table: "test_orders",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "ix_test_orders_status",
                schema: "operations",
                table: "test_orders",
                column: "status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "appointment_items",
                schema: "operations");

            migrationBuilder.DropTable(
                name: "appointment_status_history",
                schema: "operations");

            migrationBuilder.DropTable(
                name: "home_collection_requests",
                schema: "operations");

            migrationBuilder.DropTable(
                name: "test_order_items",
                schema: "operations");

            migrationBuilder.DropTable(
                name: "test_orders",
                schema: "operations");

            migrationBuilder.DropTable(
                name: "appointments",
                schema: "operations");
        }
    }
}
