using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Mobile;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Mobile.Commands;

public record RegisterDeviceCommand(string DeviceId, DevicePlatform Platform, string PushToken) : IRequest<Result<bool>>;

public class RegisterDeviceCommandHandler(
    IRepository<DeviceToken> repo,
    ICurrentUserService currentUser,
    IUnitOfWork uow) : IRequestHandler<RegisterDeviceCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(RegisterDeviceCommand request, CancellationToken ct)
    {
        if (currentUser.UserId is null)
            return Result<bool>.Failure("UNAUTHORIZED", "Not authenticated.");

        var existing = await repo.FirstOrDefaultAsync(
            d => d.UserId == currentUser.UserId && d.DeviceId == request.DeviceId, ct);

        if (existing is not null)
        {
            existing.UpdateToken(request.PushToken);
            repo.Update(existing);
            await uow.CommitAsync(ct);
            return Result<bool>.Success(false);
        }

        var device = DeviceToken.Register(currentUser.UserId.Value, request.DeviceId, request.Platform, request.PushToken);
        await repo.AddAsync(device, ct);
        await uow.CommitAsync(ct);
        return Result<bool>.Success(true);
    }
}
