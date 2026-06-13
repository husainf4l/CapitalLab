using CapitalLab.Application.Features.Content.Commands;
using CapitalLab.Application.Features.Content.Queries;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Content;
using CapitalLab.Contracts.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

/// <summary>
/// Admin CMS endpoints — full CRUD for posts, categories, authors, tags, events.
/// Requires SuperAdmin or Owner role.
/// </summary>
[Authorize(Roles = "SuperAdmin,Owner,BranchAdmin")]
[Route("api/v{version:apiVersion}/content/admin")]
public class ContentAdminController(IMediator mediator) : BaseController(mediator)
{
    // ══════════════════════════════════════════════════════════════ POSTS ══════

    [HttpGet("posts")]
    public async Task<IActionResult> GetAllPosts(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] ContentPostType? type,
        [FromQuery] Guid? categoryId,
        [FromQuery] bool? published,
        [FromQuery] bool? featured,
        CancellationToken ct)
    {
        var result = await Mediator.Send(
            new GetContentPostsQuery(pagination, type, categoryId, featured, PublishedOnly: published ?? false), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("posts/{slug}")]
    public async Task<IActionResult> GetPostBySlug(string slug, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetContentPostBySlugQuery(slug, AdminView: true), ct);
        if (!result.IsSuccess) return NotFound();
        return OkResponse(result.Value);
    }

    [HttpPost("posts")]
    public async Task<IActionResult> CreatePost([FromBody] CreateContentPostRequest req, CancellationToken ct)
    {
        var command = new CreateContentPostCommand(
            req.Type, req.CategoryId, req.AuthorId,
            req.TitleEn, req.TitleAr, req.SummaryEn, req.SummaryAr,
            req.ContentEn, req.ContentAr, req.Slug,
            req.FeaturedImageUrl, req.ThumbnailUrl,
            req.MetaTitle, req.MetaDescription, req.Keywords,
            req.ExpiryDate, req.PublishAt, req.TagIds);

        var result = await Mediator.Send(command, ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return CreatedResponse(result.Value, $"api/v1/content/admin/posts/{result.Value}");
    }

    [HttpPut("posts/{id:guid}")]
    public async Task<IActionResult> UpdatePost(Guid id, [FromBody] UpdateContentPostRequest req, CancellationToken ct)
    {
        var command = new UpdateContentPostCommand(
            id, req.Type, req.CategoryId, req.AuthorId,
            req.TitleEn, req.TitleAr, req.SummaryEn, req.SummaryAr,
            req.ContentEn, req.ContentAr, req.Slug,
            req.FeaturedImageUrl, req.ThumbnailUrl,
            req.MetaTitle, req.MetaDescription, req.Keywords,
            req.ExpiryDate, req.PublishAt, req.TagIds);

        var result = await Mediator.Send(command, ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    [HttpDelete("posts/{id:guid}")]
    public async Task<IActionResult> DeletePost(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new DeleteContentPostCommand(id), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    [HttpPatch("posts/{id:guid}/publish")]
    public async Task<IActionResult> PublishPost(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new PublishContentPostCommand(id, Publish: true), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    [HttpPatch("posts/{id:guid}/unpublish")]
    public async Task<IActionResult> UnpublishPost(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new PublishContentPostCommand(id, Publish: false), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    [HttpPatch("posts/{id:guid}/feature")]
    public async Task<IActionResult> FeaturePost(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new FeatureContentPostCommand(id, Feature: true), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    [HttpPatch("posts/{id:guid}/unfeature")]
    public async Task<IActionResult> UnfeaturePost(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new FeatureContentPostCommand(id, Feature: false), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    // ══════════════════════════════════════════════════════════ CATEGORIES ══════

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetContentCategoriesQuery(ActiveOnly: false), ct);
        return OkResponse(result.Value);
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateContentCategoryRequest req, CancellationToken ct)
    {
        var result = await Mediator.Send(new CreateContentCategoryCommand(
            req.NameEn, req.NameAr, req.Slug, req.Description, req.SortOrder), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return CreatedResponse(result.Value);
    }

    [HttpPut("categories/{id:guid}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateContentCategoryRequest req, CancellationToken ct)
    {
        var result = await Mediator.Send(new UpdateContentCategoryCommand(
            id, req.NameEn, req.NameAr, req.Slug, req.Description, req.SortOrder), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    [HttpDelete("categories/{id:guid}")]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new DeleteContentCategoryCommand(id), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    // ══════════════════════════════════════════════════════════════ AUTHORS ══════

    [HttpGet("authors")]
    public async Task<IActionResult> GetAuthors(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetContentAuthorsQuery(ActiveOnly: false), ct);
        return OkResponse(result.Value);
    }

    [HttpPost("authors")]
    public async Task<IActionResult> CreateAuthor([FromBody] CreateContentAuthorRequest req, CancellationToken ct)
    {
        var result = await Mediator.Send(new CreateContentAuthorCommand(
            req.FullName, req.Slug, req.JobTitle, req.Credentials, req.Bio, req.ImageUrl), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return CreatedResponse(result.Value);
    }

    [HttpPut("authors/{id:guid}")]
    public async Task<IActionResult> UpdateAuthor(Guid id, [FromBody] UpdateContentAuthorRequest req, CancellationToken ct)
    {
        var result = await Mediator.Send(new UpdateContentAuthorCommand(
            id, req.FullName, req.Slug, req.JobTitle, req.Credentials, req.Bio, req.ImageUrl), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    [HttpDelete("authors/{id:guid}")]
    public async Task<IActionResult> DeleteAuthor(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new DeleteContentAuthorCommand(id), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    // ══════════════════════════════════════════════════════════════════ TAGS ════

    [HttpGet("tags")]
    public async Task<IActionResult> GetTags(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetContentTagsQuery(), ct);
        return OkResponse(result.Value);
    }

    [HttpPost("tags")]
    public async Task<IActionResult> CreateTag([FromBody] CreateContentTagRequest req, CancellationToken ct)
    {
        var result = await Mediator.Send(new CreateContentTagCommand(req.Name, req.Slug), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return CreatedResponse(result.Value);
    }

    [HttpDelete("tags/{id:guid}")]
    public async Task<IActionResult> DeleteTag(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new DeleteContentTagCommand(id), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    // ══════════════════════════════════════════════════════════════ EVENTS ══════

    [HttpGet("events")]
    public async Task<IActionResult> GetEvents(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] bool? upcoming,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetContentEventsQuery(pagination, upcoming, PublishedOnly: false), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("events/{slug}")]
    public async Task<IActionResult> GetEventBySlug(string slug, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetContentEventBySlugQuery(slug, AdminView: true), ct);
        if (!result.IsSuccess) return NotFound();
        return OkResponse(result.Value);
    }

    [HttpPost("events")]
    public async Task<IActionResult> CreateEvent([FromBody] CreateContentEventRequest req, CancellationToken ct)
    {
        var result = await Mediator.Send(new CreateContentEventCommand(
            req.TitleEn, req.TitleAr, req.DescriptionEn, req.DescriptionAr,
            req.Slug, req.EventDate, req.EndDate, req.Location,
            req.CoverImageUrl, req.RegistrationUrl, req.MetaTitle, req.MetaDescription), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return CreatedResponse(result.Value);
    }

    [HttpPut("events/{id:guid}")]
    public async Task<IActionResult> UpdateEvent(Guid id, [FromBody] UpdateContentEventRequest req, CancellationToken ct)
    {
        var result = await Mediator.Send(new UpdateContentEventCommand(
            id, req.TitleEn, req.TitleAr, req.DescriptionEn, req.DescriptionAr,
            req.Slug, req.EventDate, req.EndDate, req.Location,
            req.CoverImageUrl, req.RegistrationUrl, req.MetaTitle, req.MetaDescription), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    [HttpDelete("events/{id:guid}")]
    public async Task<IActionResult> DeleteEvent(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new DeleteContentEventCommand(id), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    [HttpPatch("events/{id:guid}/publish")]
    public async Task<IActionResult> PublishEvent(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new PublishContentEventCommand(id, Publish: true), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    [HttpPatch("events/{id:guid}/unpublish")]
    public async Task<IActionResult> UnpublishEvent(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new PublishContentEventCommand(id, Publish: false), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    // ══════════════════════════════════════════════════════════ ANALYTICS ══════

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetContentAnalyticsQuery(), ct);
        return OkResponse(result.Value);
    }

    // ══════════════════════════════════════════════════════════ NEWSLETTER ══════

    [HttpGet("newsletter")]
    public async Task<IActionResult> GetSubscribers(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] bool? unsubscribed,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetNewsletterSubscribersQuery(pagination, unsubscribed), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("newsletter/export")]
    public async Task<IActionResult> ExportSubscribersCsv(CancellationToken ct)
    {
        var result = await Mediator.Send(new ExportNewsletterCsvQuery(), ct);
        return File(System.Text.Encoding.UTF8.GetBytes(result.Value!), "text/csv", "newsletter-subscribers.csv");
    }

    [HttpDelete("newsletter/{id:guid}")]
    public async Task<IActionResult> DeleteSubscriber(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new DeleteNewsletterSubscriberCommand(id), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    // ══════════════════════════════════════════════════════════════ FAQ ══════

    [HttpGet("faq")]
    public async Task<IActionResult> GetFaqItems(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetFaqItemsQuery(ActiveOnly: false), ct);
        return OkResponse(result.Value);
    }

    [HttpPost("faq")]
    public async Task<IActionResult> CreateFaqItem([FromBody] CreateFaqItemRequest req, CancellationToken ct)
    {
        var result = await Mediator.Send(new CreateFaqItemCommand(
            req.QuestionEn, req.QuestionAr, req.AnswerEn, req.AnswerAr, req.Category, req.SortOrder), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return CreatedResponse(result.Value);
    }

    [HttpPut("faq/{id:guid}")]
    public async Task<IActionResult> UpdateFaqItem(Guid id, [FromBody] UpdateFaqItemRequest req, CancellationToken ct)
    {
        var result = await Mediator.Send(new UpdateFaqItemCommand(
            id, req.QuestionEn, req.QuestionAr, req.AnswerEn, req.AnswerAr, req.Category, req.SortOrder), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    [HttpDelete("faq/{id:guid}")]
    public async Task<IActionResult> DeleteFaqItem(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new DeleteFaqItemCommand(id), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }

    [HttpPatch("faq/{id:guid}/toggle")]
    public async Task<IActionResult> ToggleFaqItem(Guid id, [FromQuery] bool active, CancellationToken ct)
    {
        var result = await Mediator.Send(new ToggleFaqItemCommand(id, active), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return NoContentResponse();
    }
}
