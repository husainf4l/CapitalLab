using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Settings;
using CapitalLab.Domain.Entities.Settings;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Settings.Queries;

public record GetSettingsQuery(string? Category = null, bool PublicOnly = false) : IRequest<Result<List<SystemSettingResponse>>>;

public class GetSettingsQueryHandler(IRepository<SystemSetting> repo)
    : IRequestHandler<GetSettingsQuery, Result<List<SystemSettingResponse>>>
{
    public async Task<Result<List<SystemSettingResponse>>> Handle(GetSettingsQuery request, CancellationToken ct)
    {
        var query = repo.Query();
        if (!string.IsNullOrWhiteSpace(request.Category)) query = query.Where(s => s.Category == request.Category);
        if (request.PublicOnly) query = query.Where(s => s.IsPublic);

        var items = await query
            .OrderBy(s => s.Category).ThenBy(s => s.Key)
            .Select(s => new SystemSettingResponse(s.Id, s.Key, s.Value, s.Category, s.Description, s.IsPublic))
            .ToListAsync(ct);

        return Result<List<SystemSettingResponse>>.Success(items);
    }
}
