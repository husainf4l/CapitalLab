using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CapitalLab.Api.Hubs;

/// <summary>
/// SignalR hub for real-time user-facing notifications.
///
/// Groups:
///   user:{userId}         — personal notifications
///   branch:{branchId}     — all staff in a branch
///   patient:{patientId}   — patient-specific updates
///
/// Events pushed to clients:
///   notification:new          — general notification bell update
///   appointment:statusChanged — appointment status update
///   sample:statusChanged      — sample tracking update
///   result:released           — result ready for patient
///   result:critical           — critical value alert
///   inventory:lowStock        — stock alert for branch staff
/// </summary>
[Authorize]
public sealed class NotificationHub(ILogger<NotificationHub> logger) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (userId is null)
        {
            logger.LogWarning("NotificationHub: anonymous connection rejected");
            Context.Abort();
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");

        var branchId = Context.User?.FindFirst("branchId")?.Value;
        if (!string.IsNullOrWhiteSpace(branchId))
            await Groups.AddToGroupAsync(Context.ConnectionId, $"branch:{branchId}");

        var patientId = Context.User?.FindFirst("patientId")?.Value;
        if (!string.IsNullOrWhiteSpace(patientId))
            await Groups.AddToGroupAsync(Context.ConnectionId, $"patient:{patientId}");

        logger.LogDebug("NotificationHub: user {UserId} connected [{ConnectionId}]",
            userId, Context.ConnectionId);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        logger.LogDebug("NotificationHub: user {UserId} disconnected [{ConnectionId}]",
            Context.UserIdentifier, Context.ConnectionId);

        await base.OnDisconnectedAsync(exception);
    }
}
