using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Content;

// ── Category ──────────────────────────────────────────────────────────────────

public record ContentCategoryResponse(
    Guid Id,
    string NameEn,
    string NameAr,
    string Slug,
    string? Description,
    int SortOrder,
    bool IsActive,
    int PostCount);

public record ContentCategoryDetailResponse(
    Guid Id,
    string NameEn,
    string NameAr,
    string Slug,
    string? Description,
    int SortOrder,
    bool IsActive,
    int PostCount,
    List<ContentPostSummaryResponse> FeaturedPosts,
    List<ContentPostSummaryResponse> RecentPosts);

// ── Author ────────────────────────────────────────────────────────────────────

public record ContentAuthorResponse(
    Guid Id,
    string FullName,
    string Slug,
    string? JobTitle,
    string? Credentials,
    string? Bio,
    string? ImageUrl,
    bool IsActive,
    int PostCount);

public record ContentAuthorDetailResponse(
    Guid Id,
    string FullName,
    string Slug,
    string? JobTitle,
    string? Credentials,
    string? Bio,
    string? ImageUrl,
    bool IsActive,
    int PostCount,
    List<ContentPostSummaryResponse> RecentPosts);

// ── Tag ───────────────────────────────────────────────────────────────────────

public record ContentTagResponse(
    Guid Id,
    string Name,
    string Slug,
    int PostCount);

// ── Post (summary for list views) ────────────────────────────────────────────

public record ContentPostSummaryResponse(
    Guid Id,
    ContentPostType Type,
    string TitleEn,
    string TitleAr,
    string? SummaryEn,
    string? SummaryAr,
    string Slug,
    string? ThumbnailUrl,
    string? FeaturedImageUrl,
    bool IsFeatured,
    bool IsPublished,
    DateTime? PublishedAt,
    int ViewCount,
    int ReadingTimeMinutes,
    string? CategoryNameEn,
    string? CategoryNameAr,
    string? CategorySlug,
    string? AuthorName,
    string? AuthorImageUrl,
    List<string> Tags);

// ── Post (full detail for article page) ──────────────────────────────────────

public record ContentPostDetailResponse(
    Guid Id,
    ContentPostType Type,
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
    bool IsFeatured,
    bool IsPublished,
    DateTime? PublishedAt,
    DateTime? ExpiryDate,
    int ViewCount,
    int ReadingTimeMinutes,
    Guid? CategoryId,
    string? CategoryNameEn,
    string? CategoryNameAr,
    string? CategorySlug,
    Guid? AuthorId,
    string? AuthorName,
    string? AuthorJobTitle,
    string? AuthorBio,
    string? AuthorImageUrl,
    List<ContentTagResponse> Tags,
    List<ContentPostSummaryResponse> RelatedPosts,
    DateTime CreatedAt,
    DateTime UpdatedAt);

// ── Post (admin detail with all editable fields) ─────────────────────────────

public record ContentPostAdminResponse(
    Guid Id,
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
    bool IsFeatured,
    bool IsPublished,
    DateTime? PublishedAt,
    DateTime? ExpiryDate,
    int ViewCount,
    List<Guid> TagIds,
    DateTime CreatedAt,
    DateTime UpdatedAt);

// ── Event (summary) ───────────────────────────────────────────────────────────

public record ContentEventSummaryResponse(
    Guid Id,
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
    bool IsPublished,
    bool IsUpcoming,
    int ViewCount);

// ── Event (full detail) ───────────────────────────────────────────────────────

public record ContentEventDetailResponse(
    Guid Id,
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
    string? MetaDescription,
    bool IsPublished,
    bool IsUpcoming,
    int ViewCount,
    DateTime CreatedAt);

// ── Search result ─────────────────────────────────────────────────────────────

public record ContentSearchResultResponse(
    string Type,
    Guid Id,
    string TitleEn,
    string TitleAr,
    string? SummaryEn,
    string Slug,
    string? ThumbnailUrl,
    DateTime? PublishedAt);

// ── Analytics ─────────────────────────────────────────────────────────────────

public record ContentAnalyticsResponse(
    int TotalPosts,
    int PublishedPosts,
    int DraftPosts,
    int ScheduledPosts,
    int TotalEvents,
    int UpcomingEvents,
    long TotalViews,
    int TotalSubscribers,
    int ActiveSubscribers,
    List<ContentPostSummaryResponse> TopPosts,
    List<ContentCategoryResponse> TopCategories);

// ── Newsletter ─────────────────────────────────────────────────────────────────

public record NewsletterSubscriberResponse(
    Guid Id,
    string Email,
    string Language,
    bool IsConfirmed,
    bool IsUnsubscribed,
    DateTime CreatedAt);

// ── FAQ ───────────────────────────────────────────────────────────────────────

public record ContentFaqItemResponse(
    Guid Id,
    string QuestionEn,
    string QuestionAr,
    string AnswerEn,
    string AnswerAr,
    string? Category,
    int SortOrder,
    bool IsActive);
