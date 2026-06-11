using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Application.Features.HomeCollections.Commands;
using CapitalLab.Application.Features.HomeCollections.Queries;
using CapitalLab.Application.Features.Patients.Queries;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.HomeCollections;
using DomainHomeCollectionStatus = CapitalLab.Domain.Enums.HomeCollectionStatus;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

[Route("api/v{version:apiVersion}/home-collections")]
public class HomeCollectionsController(IMediator mediator, ICurrentUserService currentUser) : BaseController(mediator)
{
    [HttpGet("my")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GetMyHomeCollections([FromQuery] PaginationRequest pagination, CancellationToken ct)
    {
        var patientIdResult = await Mediator.Send(new GetPatientByEmailQuery(currentUser.Email!), ct);
        if (patientIdResult.Value is null) return OkPaged(PagedResult<HomeCollectionResponse>.Empty(pagination.Page, pagination.PageSize));
        var result = await Mediator.Send(new GetHomeCollectionRequestsQuery(pagination, PatientId: patientIdResult.Value.Value), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] DomainHomeCollectionStatus? status,
        [FromQuery] Guid? assignedStaffId,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetHomeCollectionRequestsQuery(pagination, status, assignedStaffId), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetHomeCollectionByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateHomeCollectionRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(new CreateHomeCollectionRequestCommand(
            request.AppointmentId,
            request.Address,
            request.City,
            request.Area,
            request.Latitude,
            request.Longitude,
            request.PreferredDate,
            request.PreferredTimeFrom,
            request.PreferredTimeTo,
            request.CollectionNotes), ct);
        return CreatedResponse(result.Value, $"api/v1/home-collections/{result.Value}");
    }

    [HttpPost("{id:guid}/assign")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignHomeCollectionStaffRequest request, CancellationToken ct)
    {
        await Mediator.Send(new AssignHomeCollectionStaffCommand(id, request.StaffProfileId), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateHomeCollectionStatusRequest request, CancellationToken ct)
    {
        await Mediator.Send(new UpdateHomeCollectionStatusCommand(id, (DomainHomeCollectionStatus)request.Status), ct);
        return NoContentResponse();
    }
}
