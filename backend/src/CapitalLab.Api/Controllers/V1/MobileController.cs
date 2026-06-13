using CapitalLab.Application.Features.Mobile.Commands;
using CapitalLab.Contracts.Mobile;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using DomainPlatform = CapitalLab.Domain.Enums.DevicePlatform;

namespace CapitalLab.Api.Controllers.V1;

public class MobileController(IMediator mediator) : BaseController(mediator)
{
    [HttpPost("device")]
    public async Task<IActionResult> RegisterDevice([FromBody] RegisterDeviceRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(new RegisterDeviceCommand(
            request.DeviceId,
            (DomainPlatform)(int)request.Platform,
            request.PushToken), ct);
        return result.IsSuccess
            ? OkResponse(new DeviceRegistrationResponse(Guid.NewGuid(), result.Value!))
            : FailResponse(result.ErrorMessage!);
    }
}
