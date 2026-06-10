using CapitalLab.Application.Features.Staff.Commands;
using CapitalLab.Application.Features.Staff.Queries;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Staff;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

public class StaffController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? branchId,
        [FromQuery] bool? isActive,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetStaffListQuery(pagination, branchId, isActive), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetStaffByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStaffRequest request, CancellationToken ct)
    {
        var command = new CreateStaffCommand(
            request.BranchId, request.EmployeeCode, request.FullName,
            request.JobTitle, request.Department,
            request.Phone, request.Email, request.HireDate, request.UserId);

        var result = await Mediator.Send(command, ct);
        return CreatedResponse(result.Value, $"api/v1/staff/{result.Value}");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStaffRequest request, CancellationToken ct)
    {
        await Mediator.Send(new UpdateStaffCommand(
            id, request.FullName, request.JobTitle, request.Department,
            request.Phone, request.Email, request.HireDate, request.UserId), ct);
        return NoContentResponse();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new DeleteStaffCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPatch("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ToggleStaffStatusCommand(id, Activate: true), ct);
        return NoContentResponse();
    }

    [HttpPatch("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ToggleStaffStatusCommand(id, Activate: false), ct);
        return NoContentResponse();
    }
}
