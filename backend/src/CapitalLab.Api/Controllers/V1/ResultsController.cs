using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Application.Features.Patients.Queries;
using CapitalLab.Application.Features.Results.Commands;
using CapitalLab.Application.Features.Results.Queries;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Laboratory;
using CapitalLab.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

[Route("api/v{version:apiVersion}/results")]
public class ResultsController(IMediator mediator, ICurrentUserService currentUser) : BaseController(mediator)
{
    [HttpGet("my")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GetMyResults([FromQuery] PaginationRequest pagination, CancellationToken ct)
    {
        var patientIdResult = await Mediator.Send(new GetPatientByEmailQuery(currentUser.Email!), ct);
        if (patientIdResult.Value is null) return OkPaged(PagedResult<ResultSummaryResponse>.Empty(pagination.Page, pagination.PageSize));
        var result = await Mediator.Send(new GetResultsQuery(pagination, null, patientIdResult.Value.Value, null, null, null), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? sampleId,
        [FromQuery] Guid? patientId,
        [FromQuery] Guid? labTestId,
        [FromQuery] ResultStatus? status,
        [FromQuery] bool? criticalOnly,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetResultsQuery(pagination, sampleId, patientId, labTestId, status, criticalOnly), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetResultByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("{id:guid}/history")]
    public async Task<IActionResult> GetHistory(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetResultHistoryQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateResultRequest request, CancellationToken ct)
    {
        var command = new CreateResultCommand(
            request.SampleId, request.PatientId, request.LabTestId, (ResultType)request.ResultType,
            request.ResultValue, request.ResultText, request.Unit, request.ReferenceRange,
            (ResultInterpretation?)request.Interpretation);
        var result = await Mediator.Send(command, ct);
        return CreatedResponse(result.Value, $"api/v1/results/{result.Value}");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateResultRequest request, CancellationToken ct)
    {
        await Mediator.Send(new UpdateResultCommand(
            id, request.ResultValue, request.ResultText, request.Unit, request.ReferenceRange,
            (ResultInterpretation?)request.Interpretation), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/submit-review")]
    public async Task<IActionResult> SubmitReview(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new SubmitResultForReviewCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ApproveResultCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/release")]
    public async Task<IActionResult> Release(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ReleaseResultCommand(id), ct);
        return NoContentResponse();
    }
}
