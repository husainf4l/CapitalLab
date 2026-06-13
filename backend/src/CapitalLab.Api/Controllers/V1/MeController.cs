using CapitalLab.Application.Features.Mobile.Commands;
using CapitalLab.Application.Features.Mobile.Queries;
using CapitalLab.Application.Features.Notifications.Queries;
using CapitalLab.Contracts.Mobile;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

[Route("api/v{version:apiVersion}/me")]
public class MeController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    public async Task<IActionResult> GetProfile(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetMeQuery(), ct);
        return result.IsSuccess ? OkResponse(result.Value) : FailResponse(result.ErrorMessage!);
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetNotificationsQuery(page, 20, false), ct);
        return result.IsSuccess ? OkResponse(result.Value) : FailResponse(result.ErrorMessage!);
    }
}
