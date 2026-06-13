using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Content;

// ── Categories ────────────────────────────────────────────────────────────────

public record CreateContentCategoryRequest(
    string NameEn,
    string NameAr,
    string Slug,
    string? Description,
    int SortOrder);

public record UpdateContentCategoryRequest(
    string NameEn,
    string NameAr,
    string Slug,
    string? Description,
    int SortOrder);

// ── Authors ───────────────────────────────────────────────────────────────────

public record CreateContentAuthorRequest(
    string FullName,
    string Slug,
    string? JobTitle,
    string? Credentials,
    string? Bio,
    string? ImageUrl);

public record UpdateContentAuthorRequest(
    string FullName,
    string Slug,
    string? JobTitle,
    string? Credentials,
    string? Bio,
    string? ImageUrl);

// ── Tags ──────────────────────────────────────────────────────────────────────

public record CreateContentTagRequest(
    string Name,
    string Slug);

// ── Posts ─────────────────────────────────────────────────────────────────────

public record CreateContentPostRequest(
    ContentPostType Type,
    Guid? CategoryId,
    Guid? AuthorId,
    string TitleEn,
    string TitleAr,
    string? SummaryEn,
    string? SummaryAr,
    string ContentEn,
    string ContentAr,
    string Slug,
    string? FeaturedImageUrl,
    string? ThumbnailUrl,
    string? MetaTitle,
    string? MetaDescription,
    string? Keywords,
    DateTime? ExpiryDate,
    DateTime? PublishAt,
    List<Guid>? TagIds);

public record UpdateContentPostRequest(
    ContentPostType Type,
    Guid? CategoryId,
    Guid? AuthorId,
    string TitleEn,
    string TitleAr,
    string? SummaryEn,
    string? SummaryAr,
    string ContentEn,
    string ContentAr,
    string Slug,
    string? FeaturedImageUrl,
    string? ThumbnailUrl,
    string? MetaTitle,
    string? MetaDescription,
    string? Keywords,
    DateTime? ExpiryDate,
    DateTime? PublishAt,
    List<Guid>? TagIds);

// ── Events ────────────────────────────────────────────────────────────────────

public record CreateContentEventRequest(
    string TitleEn,
    string TitleAr,
    string? DescriptionEn,
    string? DescriptionAr,
    string Slug,
    DateTime EventDate,
    DateTime? EndDate,
    string? Location,
    string? CoverImageUrl,
    string? RegistrationUrl,
    string? MetaTitle,
    string? MetaDescription);

public record UpdateContentEventRequest(
    string TitleEn,
    string TitleAr,
    string? DescriptionEn,
    string? DescriptionAr,
    string Slug,
    DateTime EventDate,
    DateTime? EndDate,
    string? Location,
    string? CoverImageUrl,
    string? RegistrationUrl,
    string? MetaTitle,
    string? MetaDescription);

// ── Newsletter ─────────────────────────────────────────────────────────────────

public record SubscribeNewsletterRequest(string Email, string Language = "en");

// ── FAQ ───────────────────────────────────────────────────────────────────────

public record CreateFaqItemRequest(
    string QuestionEn,
    string QuestionAr,
    string AnswerEn,
    string AnswerAr,
    string? Category,
    int SortOrder);

public record UpdateFaqItemRequest(
    string QuestionEn,
    string QuestionAr,
    string AnswerEn,
    string AnswerAr,
    string? Category,
    int SortOrder);
