using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CapitalLab.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddContentCMS : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "content");

            migrationBuilder.CreateTable(
                name: "authors",
                schema: "content",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    job_title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    bio = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    image_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("pk_authors", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "categories",
                schema: "content",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name_en = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    name_ar = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    slug = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("pk_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "events",
                schema: "content",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    title_en = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    title_ar = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    description_en = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    description_ar = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    slug = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    event_date = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    location = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    cover_image_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    registration_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_published = table.Column<bool>(type: "boolean", nullable: false),
                    view_count = table.Column<int>(type: "integer", nullable: false),
                    meta_title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    meta_description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("pk_events", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tags",
                schema: "content",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
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
                    table.PrimaryKey("pk_tags", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "posts",
                schema: "content",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    category_id = table.Column<Guid>(type: "uuid", nullable: true),
                    author_id = table.Column<Guid>(type: "uuid", nullable: true),
                    title_en = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    title_ar = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    summary_en = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    summary_ar = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    content_en = table.Column<string>(type: "text", nullable: false),
                    content_ar = table.Column<string>(type: "text", nullable: false),
                    slug = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    featured_image_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    thumbnail_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    meta_title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    meta_description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    keywords = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    published_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    expiry_date = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    is_featured = table.Column<bool>(type: "boolean", nullable: false),
                    is_published = table.Column<bool>(type: "boolean", nullable: false),
                    view_count = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_posts", x => x.id);
                    table.ForeignKey(
                        name: "fk_posts_authors_author_id",
                        column: x => x.author_id,
                        principalSchema: "content",
                        principalTable: "authors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_posts_categories_category_id",
                        column: x => x.category_id,
                        principalSchema: "content",
                        principalTable: "categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "post_tags",
                schema: "content",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tag_id = table.Column<Guid>(type: "uuid", nullable: false),
                    row_version = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_post_tags", x => x.id);
                    table.ForeignKey(
                        name: "fk_post_tags_content_tags_tag_id",
                        column: x => x.tag_id,
                        principalSchema: "content",
                        principalTable: "tags",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_post_tags_posts_post_id",
                        column: x => x.post_id,
                        principalSchema: "content",
                        principalTable: "posts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_content_authors_is_active",
                schema: "content",
                table: "authors",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_content_categories_is_active",
                schema: "content",
                table: "categories",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_content_categories_slug",
                schema: "content",
                table: "categories",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_content_events_date_published",
                schema: "content",
                table: "events",
                columns: new[] { "event_date", "is_published" });

            migrationBuilder.CreateIndex(
                name: "ix_content_events_slug",
                schema: "content",
                table: "events",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_content_post_tags_post_tag",
                schema: "content",
                table: "post_tags",
                columns: new[] { "post_id", "tag_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_post_tags_tag_id",
                schema: "content",
                table: "post_tags",
                column: "tag_id");

            migrationBuilder.CreateIndex(
                name: "ix_content_posts_featured_published",
                schema: "content",
                table: "posts",
                columns: new[] { "is_featured", "is_published" });

            migrationBuilder.CreateIndex(
                name: "ix_content_posts_published_at",
                schema: "content",
                table: "posts",
                column: "published_at");

            migrationBuilder.CreateIndex(
                name: "ix_content_posts_slug",
                schema: "content",
                table: "posts",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_content_posts_type_published",
                schema: "content",
                table: "posts",
                columns: new[] { "type", "is_published" });

            migrationBuilder.CreateIndex(
                name: "ix_posts_author_id",
                schema: "content",
                table: "posts",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "ix_posts_category_id",
                schema: "content",
                table: "posts",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_content_tags_slug",
                schema: "content",
                table: "tags",
                column: "slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "events",
                schema: "content");

            migrationBuilder.DropTable(
                name: "post_tags",
                schema: "content");

            migrationBuilder.DropTable(
                name: "tags",
                schema: "content");

            migrationBuilder.DropTable(
                name: "posts",
                schema: "content");

            migrationBuilder.DropTable(
                name: "authors",
                schema: "content");

            migrationBuilder.DropTable(
                name: "categories",
                schema: "content");
        }
    }
}
