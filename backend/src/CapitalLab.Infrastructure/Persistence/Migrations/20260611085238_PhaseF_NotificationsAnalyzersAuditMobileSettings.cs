using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CapitalLab.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PhaseF_NotificationsAnalyzersAuditMobileSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "audit");

            migrationBuilder.EnsureSchema(
                name: "notifications");

            migrationBuilder.EnsureSchema(
                name: "settings");

            migrationBuilder.CreateTable(
                name: "analyzers",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    manufacturer = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    model = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    serial_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    branch_id = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("pk_analyzers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "audit_logs",
                schema: "audit",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    entity_type = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    user_email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    old_values = table.Column<string>(type: "jsonb", nullable: true),
                    new_values = table.Column<string>(type: "jsonb", nullable: true),
                    additional_data = table.Column<string>(type: "jsonb", nullable: true),
                    occurred_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    row_version = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_audit_logs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "device_tokens",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    device_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    platform = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    push_token = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    last_active_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
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
                    table.PrimaryKey("pk_device_tokens", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "notification_templates",
                schema: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    subject = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    body = table.Column<string>(type: "text", nullable: false),
                    body_ar = table.Column<string>(type: "text", nullable: true),
                    channel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
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
                    table.PrimaryKey("pk_notification_templates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                schema: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    channel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    payload_json = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    scheduled_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    sent_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    read_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
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
                    table.PrimaryKey("pk_notifications", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "system_settings",
                schema: "settings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    key = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    value = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_public = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("pk_system_settings", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "analyzer_imports",
                schema: "laboratory",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    analyzer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sample_id = table.Column<Guid>(type: "uuid", nullable: true),
                    import_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    file_name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    raw_content = table.Column<string>(type: "text", nullable: true),
                    error_message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    total_rows = table.Column<int>(type: "integer", nullable: false),
                    processed_rows = table.Column<int>(type: "integer", nullable: false),
                    imported_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
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
                name: "notification_logs",
                schema: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    notification_id = table.Column<Guid>(type: "uuid", nullable: false),
                    provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    response = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    sent_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    row_version = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notification_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_notification_logs_notifications_notification_id",
                        column: x => x.notification_id,
                        principalSchema: "notifications",
                        principalTable: "notifications",
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
                    sample_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lab_test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    value = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    is_reviewed = table.Column<bool>(type: "boolean", nullable: false),
                    imported_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    row_version = table.Column<long>(type: "bigint", nullable: false)
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
                name: "ix_audit_logs_entity_type",
                schema: "audit",
                table: "audit_logs",
                column: "entity_type");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_occurred_at",
                schema: "audit",
                table: "audit_logs",
                column: "occurred_at");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_user_id",
                schema: "audit",
                table: "audit_logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_device_tokens_user_id",
                schema: "identity",
                table: "device_tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_device_tokens_user_id_device_id",
                schema: "identity",
                table: "device_tokens",
                columns: new[] { "user_id", "device_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_notification_logs_notification_id",
                schema: "notifications",
                table: "notification_logs",
                column: "notification_id");

            migrationBuilder.CreateIndex(
                name: "ix_notification_templates_code",
                schema: "notifications",
                table: "notification_templates",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_notifications_user_id",
                schema: "notifications",
                table: "notifications",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_user_id_status",
                schema: "notifications",
                table: "notifications",
                columns: new[] { "user_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_system_settings_category",
                schema: "settings",
                table: "system_settings",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "ix_system_settings_key",
                schema: "settings",
                table: "system_settings",
                column: "key",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "analyzer_results",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "audit_logs",
                schema: "audit");

            migrationBuilder.DropTable(
                name: "device_tokens",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "notification_logs",
                schema: "notifications");

            migrationBuilder.DropTable(
                name: "notification_templates",
                schema: "notifications");

            migrationBuilder.DropTable(
                name: "system_settings",
                schema: "settings");

            migrationBuilder.DropTable(
                name: "analyzer_imports",
                schema: "laboratory");

            migrationBuilder.DropTable(
                name: "notifications",
                schema: "notifications");

            migrationBuilder.DropTable(
                name: "analyzers",
                schema: "laboratory");
        }
    }
}
