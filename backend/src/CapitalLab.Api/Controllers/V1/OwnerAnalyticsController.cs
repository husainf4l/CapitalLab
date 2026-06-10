using CapitalLab.Application.Features.Analytics.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

[Route("api/v{version:apiVersion}/analytics/owner")]
[Authorize(Roles = "SuperAdmin,Owner,BranchAdmin")]
public class OwnerAnalyticsController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet("overview")]
    public async Task<IActionResult> Overview(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetOwnerOverviewQuery(), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("revenue")]
    public async Task<IActionResult> Revenue([FromQuery] int days, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetRevenueAnalyticsQuery(days <= 0 ? 30 : days), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("branches")]
    public async Task<IActionResult> Branches(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetBranchAnalyticsQuery(), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("tests")]
    public async Task<IActionResult> Tests(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetTestAnalyticsQuery(), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("patients")]
    public async Task<IActionResult> Patients(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetPatientAnalyticsQuery(), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("inventory")]
    public async Task<IActionResult> Inventory(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetInventoryAnalyticsQuery(), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("insurance")]
    public async Task<IActionResult> Insurance(CancellationToken ct)
    {
        var result = await Mediator.Send(new GetInsuranceAnalyticsQuery(), ct);
        return OkResponse(result.Value);
    }
}
