using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CapitalLab.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationRetryFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "failure_reason",
                schema: "notifications",
                table: "notifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_attempt_at",
                schema: "notifications",
                table: "notifications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "next_attempt_at",
                schema: "notifications",
                table: "notifications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "retry_count",
                schema: "notifications",
                table: "notifications",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "failure_reason",
                schema: "notifications",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "last_attempt_at",
                schema: "notifications",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "next_attempt_at",
                schema: "notifications",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "retry_count",
                schema: "notifications",
                table: "notifications");
        }
    }
}
