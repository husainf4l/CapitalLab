using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Application.Features.Patients.Queries;
using CapitalLab.Application.Features.Reports.Commands;
using CapitalLab.Application.Features.Reports.Commands.Pdf;
using CapitalLab.Application.Features.Reports.Queries;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Laboratory;
using CapitalLab.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

public class ReportsController(IMediator mediator, ICurrentUserService currentUser) : BaseController(mediator)
{
    [HttpGet("my")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GetMyReports([FromQuery] PaginationRequest pagination, CancellationToken ct)
    {
        var patientIdResult = await Mediator.Send(new GetPatientByEmailQuery(currentUser.Email!), ct);
        if (patientIdResult.Value is null) return OkPaged(PagedResult<ReportSummaryResponse>.Empty(pagination.Page, pagination.PageSize));
        var result = await Mediator.Send(new GetReportsQuery(pagination, patientIdResult.Value.Value, null, null), ct);
        return OkPaged(result.Value!);
    }

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

    [HttpPost("{id:guid}/generate-pdf")]
    public async Task<IActionResult> GeneratePdf(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GenerateReportPdfCommand(id), ct);
        return result.IsSuccess ? OkResponse(new { path = result.Value }) : FailResponse(result.ErrorMessage!);
    }

    [HttpGet("{id:guid}/pdf")]
    public async Task<IActionResult> GetPdf(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetReportPdfQuery(id), ct);
        if (!result.IsSuccess) return NotFound();
        return File(result.Value!, "application/pdf", $"report-{id}.pdf");
    }
}
