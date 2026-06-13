using CapitalLab.Contracts.Audit;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Audit;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Audit.Queries;

public record GetAuditLogsQuery(
    int PageNumber = 1,
    int PageSize = 50,
    Guid? UserId = null,
    string? EntityType = null,
    string? Action = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null) : IRequest<Result<PagedResult<AuditLogResponse>>>;

public class GetAuditLogsQueryHandler(IRepository<AuditLog> repo)
    : IRequestHandler<GetAuditLogsQuery, Result<PagedResult<AuditLogResponse>>>
{
    public async Task<Result<PagedResult<AuditLogResponse>>> Handle(GetAuditLogsQuery request, CancellationToken ct)
    {
        var query = repo.Query();
        if (request.UserId.HasValue) query = query.Where(a => a.UserId == request.UserId);
        if (!string.IsNullOrWhiteSpace(request.EntityType)) query = query.Where(a => a.EntityType == request.EntityType);
        if (!string.IsNullOrWhiteSpace(request.Action)) query = query.Where(a => a.Action == request.Action);
        if (request.FromDate.HasValue) query = query.Where(a => a.OccurredAt >= request.FromDate);
        if (request.ToDate.HasValue) query = query.Where(a => a.OccurredAt <= request.ToDate);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(a => a.OccurredAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new AuditLogResponse(
                a.Id, a.EntityType, a.EntityId, a.Action,
                a.UserId, a.UserEmail, a.IpAddress,
                a.OldValues, a.NewValues, a.OccurredAt))
            .ToListAsync(ct);

        return Result<PagedResult<AuditLogResponse>>.Success(
            PagedResult<AuditLogResponse>.Create(items, total, request.PageNumber, request.PageSize));
    }
}
