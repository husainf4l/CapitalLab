using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Notifications;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Dashboard;

public record SystemHealthDetailResponse(
    string LastMigration,
    int NotificationPending,
    int NotificationFailed,
    int NotificationRetrying);

public record GetSystemHealthDetailQuery : IRequest<Result<SystemHealthDetailResponse>>;

public class GetSystemHealthDetailQueryHandler(
    ISystemInfoService sysInfo,
    IRepository<Notification> notificationRepo)
    : IRequestHandler<GetSystemHealthDetailQuery, Result<SystemHealthDetailResponse>>
{
    public async Task<Result<SystemHealthDetailResponse>> Handle(GetSystemHealthDetailQuery request, CancellationToken ct)
    {
        var lastMigration = await sysInfo.GetLastMigrationAsync(ct);

        var pending  = await notificationRepo.Query().CountAsync(n => n.Status == NotificationStatus.Pending, ct);
        var failed   = await notificationRepo.Query().CountAsync(n => n.Status == NotificationStatus.Failed, ct);
        var retrying = await notificationRepo.Query().CountAsync(n => n.Status == NotificationStatus.Pending && n.RetryCount > 0, ct);

        return Result<SystemHealthDetailResponse>.Success(
            new SystemHealthDetailResponse(lastMigration, pending, failed, retrying));
    }
}
