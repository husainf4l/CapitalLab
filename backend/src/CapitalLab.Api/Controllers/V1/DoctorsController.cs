using CapitalLab.Application.Features.Doctors.Commands;
using CapitalLab.Application.Features.Doctors.Queries;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Doctors;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

public class DoctorsController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? branchId,
        [FromQuery] bool? isActive,
        [FromQuery] bool? isReviewer,
        [FromQuery] bool? isApprover,
        CancellationToken ct)
    {
        var result = await Mediator.Send(
            new GetDoctorsQuery(pagination, branchId, isActive, isReviewer, isApprover), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetDoctorByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDoctorRequest request, CancellationToken ct)
    {
        var command = new CreateDoctorCommand(
            request.BranchId, request.FullName, request.Specialization,
            request.LicenseNumber, request.Phone, request.Email,
            request.IsReviewer, request.IsApprover, request.UserId);

        var result = await Mediator.Send(command, ct);
        return CreatedResponse(result.Value, $"api/v1/doctors/{result.Value}");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDoctorRequest request, CancellationToken ct)
    {
        await Mediator.Send(new UpdateDoctorCommand(
            id, request.FullName, request.Specialization,
            request.Phone, request.Email,
            request.IsReviewer, request.IsApprover, request.UserId), ct);
        return NoContentResponse();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new DeleteDoctorCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPatch("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ToggleDoctorStatusCommand(id, Activate: true), ct);
        return NoContentResponse();
    }

    [HttpPatch("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ToggleDoctorStatusCommand(id, Activate: false), ct);
        return NoContentResponse();
    }
}
