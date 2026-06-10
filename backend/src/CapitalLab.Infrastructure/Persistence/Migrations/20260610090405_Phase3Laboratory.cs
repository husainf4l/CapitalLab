using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CapitalLab.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase3Laboratory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "laboratory");

            migrationBuilder.CreateTable(
                name: "critical_result_rules",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    lab_test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    min_critical_value = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    max_critical_value = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    is_enabled = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("pk_critical_result_rules", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "doctor_reviews",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    sample_id = table.Column<Guid>(type: "uuid", nullable: false),
                    doctor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    reviewed_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
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
                    table.PrimaryKey("pk_doctor_reviews", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "reports",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    report_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sample_id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    doctor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    generated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    released_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    pdf_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    qr_code = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
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
                    table.PrimaryKey("pk_reports", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "samples",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    sample_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    test_order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    collected_by_staff_id = table.Column<Guid>(type: "uuid", nullable: true),
                    sample_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    barcode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    barcode_image_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    qr_code = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    qr_code_image_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    collection_date_time = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    received_date_time = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    processing_started_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    processing_completed_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("pk_samples", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "report_items",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    report_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lab_test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    result_value = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    reference_range = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    interpretation = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    row_version = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_report_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_report_items_reports_report_id",
                        column: x => x.report_id,
                        principalSchema: "laboratory",
                        principalTable: "reports",
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
                    checked_by = table.Column<Guid>(type: "uuid", nullable: true),
                    checked_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    result = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    test_order_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lab_test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    row_version = table.Column<long>(type: "bigint", nullable: false)
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
                name: "test_results",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    sample_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lab_test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    result_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    result_value = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    result_text = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    reference_range = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    interpretation = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    entered_by = table.Column<Guid>(type: "uuid", nullable: true),
                    entered_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    approved_by = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    is_critical = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("pk_test_results", x => x.id);
                    table.ForeignKey(
                        name: "fk_test_results_samples_sample_id",
                        column: x => x.sample_id,
                        principalSchema: "laboratory",
                        principalTable: "samples",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "critical_result_alerts",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_result_id = table.Column<Guid>(type: "uuid", nullable: false),
                    triggered_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    trigger_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    is_acknowledged = table.Column<bool>(type: "boolean", nullable: false),
                    acknowledged_by = table.Column<Guid>(type: "uuid", nullable: true),
                    acknowledged_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    row_version = table.Column<long>(type: "bigint", nullable: false)
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
                name: "test_result_history",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_result_id = table.Column<Guid>(type: "uuid", nullable: false),
                    old_value = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    new_value = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    changed_by = table.Column<Guid>(type: "uuid", nullable: true),
                    changed_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    row_version = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_test_result_history", x => x.id);
                    table.ForeignKey(
                        name: "fk_test_result_history_test_results_test_result_id",
                        column: x => x.test_result_id,
                        principalSchema: "laboratory",
                        principalTable: "test_results",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

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
                name: "ix_quality_control_records_sample_id",
                schema: "laboratory",
                table: "quality_control_records",
                column: "sample_id");

            migrationBuilder.CreateIndex(
                name: "ix_report_items_lab_test_id",
                schema: "laboratory",
                table: "report_items",
                column: "lab_test_id");

            migrationBuilder.CreateIndex(
                name: "ix_report_items_report_id",
                schema: "laboratory",
                table: "report_items",
                column: "report_id");

            migrationBuilder.CreateIndex(
                name: "ix_reports_patient_id",
                schema: "laboratory",
                table: "reports",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "ix_reports_report_number",
                schema: "laboratory",
                table: "reports",
                column: "report_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_reports_sample_id",
                schema: "laboratory",
                table: "reports",
                column: "sample_id");

            migrationBuilder.CreateIndex(
                name: "ix_reports_status",
                schema: "laboratory",
                table: "reports",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_reports_test_order_id",
                schema: "laboratory",
                table: "reports",
                column: "test_order_id");

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

            migrationBuilder.CreateIndex(
                name: "ix_test_result_history_test_result_id",
                schema: "laboratory",
                table: "test_result_history",
                column: "test_result_id");

            migrationBuilder.CreateIndex(
                name: "ix_test_results_lab_test_id",
                schema: "laboratory",
                table: "test_results",
                column: "lab_test_id");

            migrationBuilder.CreateIndex(
                name: "ix_test_results_patient_id",
                schema: "laboratory",
                table: "test_results",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "ix_test_results_patient_lab_test",
                schema: "laboratory",
                table: "test_results",
                columns: new[] { "patient_id", "lab_test_id" });

            migrationBuilder.CreateIndex(
                name: "ix_test_results_sample_id",
                schema: "laboratory",
                table: "test_results",
                column: "sample_id");

            migrationBuilder.CreateIndex(
                name: "ix_test_results_status",
                schema: "laboratory",
                table: "test_results",
                column: "status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
                name: "quality_control_records",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "report_items",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "sample_items",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "test_result_history",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "reports",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "test_results",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "samples",
                schema: "laboratory");
        }
    }
}
