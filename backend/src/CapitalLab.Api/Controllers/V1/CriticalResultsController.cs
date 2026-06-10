using CapitalLab.Application.Features.CriticalResults.Commands;
using CapitalLab.Application.Features.CriticalResults.Queries;
using CapitalLab.Application.Features.Results.Commands;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Laboratory;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

[Route("api/v{version:apiVersion}/critical-results")]
public class CriticalResultsController(IMediator mediator) : BaseController(mediator)
{
    /// <summary>Critical alerts dashboard for doctors and managers.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? patientId,
        [FromQuery] Guid? labTestId,
        [FromQuery] bool? acknowledgedOnly,
        [FromQuery] bool? unacknowledgedOnly,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken ct)
    {
        var result = await Mediator.Send(
            new GetCriticalResultsQuery(pagination, patientId, labTestId, acknowledgedOnly, unacknowledgedOnly, fromDate, toDate), ct);
        return OkPaged(result.Value!);
    }

    [HttpPost("alerts/{alertId:guid}/acknowledge")]
    public async Task<IActionResult> Acknowledge(Guid alertId, [FromBody] AcknowledgeAlertRequest? request, CancellationToken ct)
    {
        await Mediator.Send(new AcknowledgeCriticalAlertCommand(alertId, request?.AcknowledgedBy), ct);
        return NoContentResponse();
    }

    // ── Critical-result rules management ──────────────────────────────────────
    [HttpGet("rules")]
    public async Task<IActionResult> GetRules(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? labTestId,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetCriticalRulesQuery(pagination, labTestId), ct);
        return OkPaged(result.Value!);
    }

    [HttpPost("rules")]
    public async Task<IActionResult> CreateRule([FromBody] CreateCriticalResultRuleRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(new CreateCriticalResultRuleCommand(
            request.LabTestId, request.MinCriticalValue, request.MaxCriticalValue, request.IsEnabled), ct);
        return CreatedResponse(result.Value, $"api/v1/critical-results/rules/{result.Value}");
    }

    [HttpPut("rules/{id:guid}")]
    public async Task<IActionResult> UpdateRule(Guid id, [FromBody] UpdateCriticalResultRuleRequest request, CancellationToken ct)
    {
        await Mediator.Send(new UpdateCriticalResultRuleCommand(
            id, request.MinCriticalValue, request.MaxCriticalValue, request.IsEnabled), ct);
        return NoContentResponse();
    }
}
