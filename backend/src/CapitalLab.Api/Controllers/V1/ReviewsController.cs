using CapitalLab.Application.Features.DoctorReviews.Commands;
using CapitalLab.Application.Features.DoctorReviews.Queries;
using CapitalLab.Contracts.Laboratory;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

[Route("api/v{version:apiVersion}/reviews")]
public class ReviewsController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetDoctorReviewByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("by-sample/{sampleId:guid}")]
    public async Task<IActionResult> GetBySample(Guid sampleId, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetDoctorReviewsBySampleQuery(sampleId), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDoctorReviewRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(new CreateDoctorReviewCommand(request.SampleId, request.DoctorId, request.Notes), ct);
        return CreatedResponse(result.Value, $"api/v1/reviews/{result.Value}");
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ReviewDecisionRequest request, CancellationToken ct)
    {
        await Mediator.Send(new ApproveDoctorReviewCommand(id, request.Notes), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/retest")]
    public async Task<IActionResult> Retest(Guid id, [FromBody] ReviewDecisionRequest request, CancellationToken ct)
    {
        await Mediator.Send(new RequestRetestCommand(id, request.Notes), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] ReviewDecisionRequest request, CancellationToken ct)
    {
        await Mediator.Send(new RejectDoctorReviewCommand(id, request.Notes), ct);
        return NoContentResponse();
    }
}
