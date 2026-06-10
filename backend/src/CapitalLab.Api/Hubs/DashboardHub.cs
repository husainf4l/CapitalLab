using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CapitalLab.Api.Hubs;

/// <summary>
/// SignalR hub for real-time lab dashboard updates (staff only).
///
/// Groups:
///   branch:{branchId}   — all staff in a branch
///
/// Events pushed:
///   sample:received        — new sample arrived at reception
///   result:entered         — technician submitted a result
///   result:pendingReview   — result waiting for doctor review
///   homeCollection:dispatched — phlebotomist en route
///   dashboard:kpiUpdated   — KPI values refreshed
/// </summary>
[Authorize]
public sealed class DashboardHub(ILogger<DashboardHub> logger) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var branchId = Context.User?.FindFirst("branchId")?.Value;

        if (!string.IsNullOrWhiteSpace(branchId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"branch:{branchId}");
            logger.LogDebug("DashboardHub: user {UserId} joined branch:{BranchId}",
                Context.UserIdentifier, branchId);
        }

        await base.OnConnectedAsync();
    }
}
