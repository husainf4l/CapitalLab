using CapitalLab.Application.Features.Samples.Commands;
using CapitalLab.Application.Features.Samples.Queries;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Laboratory;
using CapitalLab.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

public class SamplesController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? patientId,
        [FromQuery] Guid? branchId,
        [FromQuery] Guid? testOrderId,
        [FromQuery] SampleStatus? status,
        [FromQuery] SampleType? sampleType,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetSamplesQuery(pagination, patientId, branchId, testOrderId, status, sampleType), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetSampleByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSampleRequest request, CancellationToken ct)
    {
        var command = new CreateSampleCommand(
            request.TestOrderId, (SampleType)request.SampleType, request.Notes,
            request.Items.Select(i => new CreateSampleItemInput(i.TestOrderItemId, i.LabTestId)).ToList());
        var result = await Mediator.Send(command, ct);
        return CreatedResponse(result.Value, $"api/v1/samples/{result.Value}");
    }

    [HttpPost("{id:guid}/generate-barcode")]
    public async Task<IActionResult> GenerateBarcode(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new GenerateBarcodeCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/collect")]
    public async Task<IActionResult> Collect(Guid id, [FromBody] CollectSampleRequest request, CancellationToken ct)
    {
        await Mediator.Send(new CollectSampleCommand(id, request.CollectedByStaffId, request.CollectionDateTime), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/receive")]
    public async Task<IActionResult> Receive(Guid id, [FromBody] ReceiveSampleRequest request, CancellationToken ct)
    {
        await Mediator.Send(new ReceiveSampleCommand(id, request.ReceivedDateTime), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/processing-start")]
    public async Task<IActionResult> StartProcessing(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new StartProcessingCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/processing-complete")]
    public async Task<IActionResult> CompleteProcessing(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new CompleteProcessingCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/quality-check")]
    public async Task<IActionResult> QualityCheck(Guid id, [FromBody] QualityCheckRequest request, CancellationToken ct)
    {
        await Mediator.Send(new QualityCheckCommand(id, (QualityControlResult)request.Result, request.Notes, request.CheckedBy), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new CompleteSampleCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectSampleRequest request, CancellationToken ct)
    {
        await Mediator.Send(new RejectSampleCommand(id, request.Reason), ct);
        return NoContentResponse();
    }
}
