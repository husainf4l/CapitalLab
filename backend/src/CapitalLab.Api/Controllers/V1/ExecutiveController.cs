using CapitalLab.Application.Features.Dashboard;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

public class ExecutiveController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview([FromQuery] int daysBack = 30, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetOwnerExecutiveQuery(daysBack), ct);
        return result.IsSuccess ? OkResponse(result.Value) : FailResponse(result.ErrorMessage!);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetOwnerExecutiveSummaryQuery(), ct);
        return result.IsSuccess ? OkResponse(result.Value) : FailResponse(result.ErrorMessage!);
    }
}
