using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CapitalLab.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase2_Marketing_SEO_Newsletter_FAQ : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "publish_at",
                schema: "content",
                table: "posts",
                type: "timestamptz",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "credentials",
                schema: "content",
                table: "authors",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "slug",
                schema: "content",
                table: "authors",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "faq_items",
                schema: "content",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_en = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    question_ar = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    answer_en = table.Column<string>(type: "text", nullable: false),
                    answer_ar = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_faq_items", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "newsletter_subscribers",
                schema: "content",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    language = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false, defaultValue: "en"),
                    is_confirmed = table.Column<bool>(type: "boolean", nullable: false),
                    confirmed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_unsubscribed = table.Column<bool>(type: "boolean", nullable: false),
                    unsubscribed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    unsubscribe_token = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
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
                    table.PrimaryKey("pk_newsletter_subscribers", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_content_posts_publish_at",
                schema: "content",
                table: "posts",
                column: "publish_at");

            migrationBuilder.CreateIndex(
                name: "uq_content_authors_slug",
                schema: "content",
                table: "authors",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_content_faq_active_sort",
                schema: "content",
                table: "faq_items",
                columns: new[] { "is_active", "sort_order" });

            migrationBuilder.CreateIndex(
                name: "ix_content_faq_is_active",
                schema: "content",
                table: "faq_items",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_content_newsletter_token",
                schema: "content",
                table: "newsletter_subscribers",
                column: "unsubscribe_token");

            migrationBuilder.CreateIndex(
                name: "ix_content_newsletter_unsub",
                schema: "content",
                table: "newsletter_subscribers",
                column: "is_unsubscribed");

            migrationBuilder.CreateIndex(
                name: "uq_content_newsletter_email",
                schema: "content",
                table: "newsletter_subscribers",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "faq_items",
                schema: "content");

            migrationBuilder.DropTable(
                name: "newsletter_subscribers",
                schema: "content");

            migrationBuilder.DropIndex(
                name: "ix_content_posts_publish_at",
                schema: "content",
                table: "posts");

            migrationBuilder.DropIndex(
                name: "uq_content_authors_slug",
                schema: "content",
                table: "authors");

            migrationBuilder.DropColumn(
                name: "publish_at",
                schema: "content",
                table: "posts");

            migrationBuilder.DropColumn(
                name: "credentials",
                schema: "content",
                table: "authors");

            migrationBuilder.DropColumn(
                name: "slug",
                schema: "content",
                table: "authors");
        }
    }
}
