using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Application.Features.Patients.Queries;
using CapitalLab.Application.Features.TestOrders.Commands;
using CapitalLab.Application.Features.TestOrders.Queries;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.TestOrders;
using DomainTestOrderStatus = CapitalLab.Domain.Enums.TestOrderStatus;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

[Route("api/v{version:apiVersion}/test-orders")]
public class TestOrdersController(IMediator mediator, ICurrentUserService currentUser) : BaseController(mediator)
{
    [HttpGet("my")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GetMyTestOrders([FromQuery] PaginationRequest pagination, CancellationToken ct)
    {
        var patientIdResult = await Mediator.Send(new GetPatientByEmailQuery(currentUser.Email!), ct);
        if (patientIdResult.Value is null) return OkPaged(PagedResult<TestOrderSummaryResponse>.Empty(pagination.Page, pagination.PageSize));
        var result = await Mediator.Send(new GetTestOrdersQuery(pagination, patientIdResult.Value.Value), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? patientId,
        [FromQuery] Guid? branchId,
        [FromQuery] DomainTestOrderStatus? status,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetTestOrdersQuery(pagination, patientId, branchId, status), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetTestOrderByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("/api/v{version:apiVersion}/patients/{patientId:guid}/test-orders")]
    public async Task<IActionResult> GetByPatient(Guid patientId, [FromQuery] PaginationRequest pagination, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetTestOrdersByPatientQuery(patientId, pagination), ct);
        return OkPaged(result.Value!);
    }

    [HttpPost("from-appointment/{appointmentId:guid}")]
    public async Task<IActionResult> CreateFromAppointment(Guid appointmentId, CancellationToken ct)
    {
        var result = await Mediator.Send(new CreateTestOrderFromAppointmentCommand(appointmentId), ct);
        return CreatedResponse(result.Value, $"api/v1/test-orders/{result.Value}");
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelTestOrderRequest request, CancellationToken ct)
    {
        await Mediator.Send(new CancelTestOrderCommand(id, request.Reason), ct);
        return NoContentResponse();
    }
}
