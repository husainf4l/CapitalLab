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
/// Public-facing content endpoints. All are anonymous.
/// </summary>
[AllowAnonymous]
public class ContentController(IMediator mediator) : BaseController(mediator)
{
    // ── Posts ─────────────────────────────────────────────────────────────────

    [HttpGet("posts")]
    public async Task<IActionResult> GetPosts(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] ContentPostType? type,
        [FromQuery] Guid? categoryId,
        [FromQuery] bool? featured,
        CancellationToken ct)
    {
        var result = await Mediator.Send(
            new GetContentPostsQuery(pagination, type, categoryId, featured, PublishedOnly: true), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("posts/{slug}")]
    public async Task<IActionResult> GetPostBySlug(string slug, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetContentPostBySlugQuery(slug), ct);
        if (!result.IsSuccess) return NotFound();

        _ = Mediator.Send(new IncrementPostViewCommand(result.Value!.Id), CancellationToken.None);

        return OkResponse(result.Value);
    }

    [HttpGet("posts/popular")]
    public async Task<IActionResult> GetPopularPosts([FromQuery] int limit = 5, [FromQuery] ContentPostType? type = null, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetPopularPostsQuery(limit, type), ct);
        return OkResponse(result.Value);
    }

    // ── Events ────────────────────────────────────────────────────────────────

    [HttpGet("events")]
    public async Task<IActionResult> GetEvents(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] bool? upcoming,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetContentEventsQuery(pagination, upcoming, PublishedOnly: true), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("events/{slug}")]
    public async Task<IActionResult> GetEventBySlug(string slug, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetContentEventBySlugQuery(slug), ct);
        if (!result.IsSuccess) return NotFound();

        _ = Mediator.Send(new IncrementEventViewCommand(result.Value!.Id), CancellationToken.None);

        return OkResponse(result.Value);
    }

    // ── Metadata ──────────────────────────────────────────────────────────────

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetContentCategoriesQuery(ActiveOnly: true), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("categories/{slug}")]
    public async Task<IActionResult> GetCategoryBySlug(string slug, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetCategoryBySlugQuery(slug), ct);
        if (!result.IsSuccess) return NotFound();
        return OkResponse(result.Value);
    }

    [HttpGet("tags")]
    public async Task<IActionResult> GetTags(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetContentTagsQuery(), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("authors/{slug}")]
    public async Task<IActionResult> GetAuthorBySlug(string slug, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetAuthorBySlugQuery(slug), ct);
        if (!result.IsSuccess) return NotFound();
        return OkResponse(result.Value);
    }

    // ── FAQ ───────────────────────────────────────────────────────────────────

    [HttpGet("faq")]
    public async Task<IActionResult> GetFaq([FromQuery] string? category, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetFaqItemsQuery(ActiveOnly: true, category), ct);
        return OkResponse(result.Value);
    }

    // ── Newsletter ────────────────────────────────────────────────────────────

    [HttpPost("newsletter/subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeNewsletterRequest req, CancellationToken ct)
    {
        var result = await Mediator.Send(new SubscribeNewsletterCommand(req.Email, req.Language), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return OkResponse("Subscribed successfully.");
    }

    [HttpGet("newsletter/unsubscribe")]
    public async Task<IActionResult> Unsubscribe([FromQuery] string token, CancellationToken ct)
    {
        var result = await Mediator.Send(new UnsubscribeNewsletterCommand(token), ct);
        if (!result.IsSuccess) return FailResponse(result.ErrorMessage!);
        return OkResponse("Unsubscribed successfully.");
    }

    // ── Search ────────────────────────────────────────────────────────────────

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] int limit = 20, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new SearchContentQuery(q, limit), ct);
        return OkResponse(result.Value);
    }
}
