using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Settings;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Settings.Commands;

public record UpsertSettingCommand(string Key, string Value, string Category, string? Description = null, bool IsPublic = false) : IRequest<Result<Guid>>;

public class UpsertSettingCommandHandler(
    IRepository<SystemSetting> repo,
    IUnitOfWork uow) : IRequestHandler<UpsertSettingCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(UpsertSettingCommand request, CancellationToken ct)
    {
        var existing = await repo.FirstOrDefaultAsync(s => s.Key == request.Key, ct);
        if (existing is not null)
        {
            existing.Update(request.Value, request.Description);
            repo.Update(existing);
            await uow.CommitAsync(ct);
            return Result<Guid>.Success(existing.Id);
        }

        var setting = SystemSetting.Create(request.Key, request.Value, request.Category, request.Description, request.IsPublic);
        await repo.AddAsync(setting, ct);
        await uow.CommitAsync(ct);
        return Result<Guid>.Success(setting.Id);
    }
}
