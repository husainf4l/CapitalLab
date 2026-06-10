using CapitalLab.Application.Features.Branches.Commands;
using CapitalLab.Application.Features.Branches.Queries;
using CapitalLab.Contracts.Branches;
using CapitalLab.Contracts.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

public class BranchesController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] bool? isActive,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetBranchesQuery(pagination, isActive), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetBranchByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBranchRequest request, CancellationToken ct)
    {
        var command = new CreateBranchCommand(
            request.Code, request.Name, request.NameAr,
            request.Phone, request.Email,
            request.Address, request.City, request.Area,
            request.Latitude, request.Longitude,
            request.OpeningTime, request.ClosingTime,
            request.IsMainBranch);

        var result = await Mediator.Send(command, ct);
        return CreatedResponse(result.Value, $"api/v1/branches/{result.Value}");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBranchRequest request, CancellationToken ct)
    {
        var command = new UpdateBranchCommand(
            id, request.Name, request.NameAr,
            request.Phone, request.Email,
            request.Address, request.City, request.Area,
            request.Latitude, request.Longitude,
            request.OpeningTime, request.ClosingTime,
            request.IsMainBranch);

        await Mediator.Send(command, ct);
        return NoContentResponse();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new DeleteBranchCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPatch("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ToggleBranchStatusCommand(id, Activate: true), ct);
        return NoContentResponse();
    }

    [HttpPatch("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ToggleBranchStatusCommand(id, Activate: false), ct);
        return NoContentResponse();
    }
}
