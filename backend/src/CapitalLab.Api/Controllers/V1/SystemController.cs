using CapitalLab.Application.Features.Dashboard;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

public class SystemController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet("health-detail")]
    public async Task<IActionResult> GetHealthDetail(CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetSystemHealthDetailQuery(), ct);
        return result.IsSuccess ? OkResponse(result.Value) : FailResponse(result.ErrorMessage!);
    }
}
