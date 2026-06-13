using CapitalLab.Application.Features.Notifications.Commands;
using CapitalLab.Application.Features.Notifications.Queries;
using CapitalLab.Contracts.Notifications;
using CapitalLab.Infrastructure.BackgroundJobs.Jobs;
using Hangfire;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using DomainChannel = CapitalLab.Domain.Enums.NotificationChannel;

namespace CapitalLab.Api.Controllers.V1;

public class NotificationsController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetNotificationsQuery(page, pageSize, false), ct);
        return result.IsSuccess ? OkResponse(result.Value) : FailResponse(result.ErrorMessage!);
    }

    [HttpGet("unread")]
    public async Task<IActionResult> GetUnread([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetNotificationsQuery(page, pageSize, true), ct);
        return result.IsSuccess ? OkResponse(result.Value) : FailResponse(result.ErrorMessage!);
    }

    [HttpGet("unread/count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetUnreadCountQuery(), ct);
        return result.IsSuccess ? OkResponse(result.Value) : FailResponse(result.ErrorMessage!);
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new MarkNotificationReadCommand(id), ct);
        return result.IsSuccess ? NoContentResponse() : FailResponse(result.ErrorMessage!);
    }

    [HttpPost("retry-failed")]
    public IActionResult RetryFailed()
    {
        BackgroundJob.Enqueue<NotificationRetryJob>(job => job.ExecuteAsync(CancellationToken.None));
        return OkResponse("Retry job queued");
    }

    [HttpPost("send-test")]
    public async Task<IActionResult> SendTest([FromBody] SendTestNotificationRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(new SendNotificationCommand(
            request.UserId, "Test",
            (DomainChannel)(int)request.Channel,
            request.Title, request.Message), ct);
        return result.IsSuccess ? NoContentResponse() : FailResponse(result.ErrorMessage!);
    }
}
