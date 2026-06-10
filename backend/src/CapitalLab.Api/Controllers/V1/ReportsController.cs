using CapitalLab.Application.Features.Reports.Commands;
using CapitalLab.Application.Features.Reports.Queries;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Laboratory;
using CapitalLab.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

public class ReportsController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? patientId,
        [FromQuery] Guid? sampleId,
        [FromQuery] ReportStatus? status,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetReportsQuery(pagination, patientId, sampleId, status), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetReportByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost("generate/{sampleId:guid}")]
    public async Task<IActionResult> Generate(Guid sampleId, [FromBody] GenerateReportRequest? request, CancellationToken ct)
    {
        var result = await Mediator.Send(new GenerateReportCommand(sampleId, request?.DoctorId), ct);
        return CreatedResponse(result.Value, $"api/v1/reports/{result.Value}");
    }

    [HttpPost("{id:guid}/release")]
    public async Task<IActionResult> Release(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ReleaseReportCommand(id), ct);
        return NoContentResponse();
    }
}
