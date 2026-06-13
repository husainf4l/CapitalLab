using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Content;
using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Content.Queries;

public record GetAuthorBySlugQuery(string Slug) : IRequest<Result<ContentAuthorDetailResponse>>;

public class GetAuthorBySlugQueryHandler(
    IRepository<ContentAuthor> authors,
    IRepository<ContentPost> posts)
    : IRequestHandler<GetAuthorBySlugQuery, Result<ContentAuthorDetailResponse>>
{
    public async Task<Result<ContentAuthorDetailResponse>> Handle(
        GetAuthorBySlugQuery req, CancellationToken ct)
    {
        var author = await authors.Query()
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Slug == req.Slug.ToLowerInvariant() && a.IsActive, ct);

        if (author is null)
            return Result<ContentAuthorDetailResponse>.Failure("NotFound", "Author not found.");

        var postCount = await posts.Query()
            .CountAsync(p => p.AuthorId == author.Id && p.IsPublished, ct);

        var recentPosts = await posts.Query()
            .Include(p => p.Category)
            .Include(p => p.Author)
            .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
            .Where(p => p.AuthorId == author.Id && p.IsPublished)
            .OrderByDescending(p => p.PublishedAt ?? p.CreatedAt)
            .Take(10)
            .AsNoTracking()
            .ToListAsync(ct);

        return Result<ContentAuthorDetailResponse>.Success(new ContentAuthorDetailResponse(
            author.Id, author.FullName, author.Slug,
            author.JobTitle, author.Credentials, author.Bio, author.ImageUrl,
            author.IsActive, postCount,
            recentPosts.Select(GetContentPostsQueryHandler.ToSummary).ToList()));
    }
}
