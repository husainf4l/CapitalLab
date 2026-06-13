using CapitalLab.Application.Features.Dashboard;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

[Route("api/v{version:apiVersion}/branches/{branchId:guid}/dashboard")]
public class BranchOperationsController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    public async Task<IActionResult> GetDashboard(Guid branchId, [FromQuery] int daysBack = 30, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetBranchDashboardQuery(branchId, daysBack), ct);
        return result.IsSuccess ? OkResponse(result.Value) : FailResponse(result.ErrorMessage!);
    }
}
