using CapitalLab.Application.Features.LabTests.Commands;
using CapitalLab.Application.Features.LabTests.Queries;
using CapitalLab.Contracts.Catalog;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

public class LabTestsController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? categoryId,
        [FromQuery] SampleType? sampleType,
        [FromQuery] bool? isActive,
        [FromQuery] bool? isFastingRequired,
        [FromQuery] bool? isHomeCollectionAvailable,
        CancellationToken ct)
    {
        var result = await Mediator.Send(
            new GetLabTestsQuery(pagination, categoryId, sampleType, isActive, isFastingRequired, isHomeCollectionAvailable), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetLabTestByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLabTestRequest request, CancellationToken ct)
    {
        var command = new CreateLabTestCommand(
            request.CategoryId, request.Code, request.Name, request.NameAr,
            request.Description, (SampleType)request.SampleType,
            request.PreparationInstructions, request.TurnaroundTimeHours,
            request.Price, request.Currency,
            request.ReferenceRange, request.Unit,
            request.IsFastingRequired, request.IsHomeCollectionAvailable);

        var result = await Mediator.Send(command, ct);
        return CreatedResponse(result.Value, $"api/v1/lab-tests/{result.Value}");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLabTestRequest request, CancellationToken ct)
    {
        await Mediator.Send(new UpdateLabTestCommand(
            id, request.CategoryId, request.Name, request.NameAr,
            request.Description, (SampleType)request.SampleType,
            request.PreparationInstructions, request.TurnaroundTimeHours,
            request.Price, request.Currency,
            request.ReferenceRange, request.Unit,
            request.IsFastingRequired, request.IsHomeCollectionAvailable), ct);
        return NoContentResponse();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new DeleteLabTestCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPatch("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ToggleLabTestStatusCommand(id, Activate: true), ct);
        return NoContentResponse();
    }

    [HttpPatch("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ToggleLabTestStatusCommand(id, Activate: false), ct);
        return NoContentResponse();
    }
}
