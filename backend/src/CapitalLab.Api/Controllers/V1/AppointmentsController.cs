using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Application.Features.Appointments.Commands;
using CapitalLab.Application.Features.Appointments.Queries;
using CapitalLab.Application.Features.Patients.Queries;
using CapitalLab.Contracts.Appointments;
using CapitalLab.Contracts.Common;
using DomainAppointmentStatus = CapitalLab.Domain.Enums.AppointmentStatus;
using DomainAppointmentType = CapitalLab.Domain.Enums.AppointmentType;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

public class AppointmentsController(IMediator mediator, ICurrentUserService currentUser) : BaseController(mediator)
{
    [HttpGet("my")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GetMyAppointments([FromQuery] PaginationRequest pagination, CancellationToken ct)
    {
        var patientIdResult = await Mediator.Send(new GetPatientByEmailQuery(currentUser.Email!), ct);
        if (patientIdResult.Value is null) return OkPaged(PagedResult<AppointmentSummaryResponse>.Empty(pagination.Page, pagination.PageSize));
        var result = await Mediator.Send(new GetAppointmentsQuery(pagination, patientIdResult.Value.Value, null, null, null, null, null), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? patientId,
        [FromQuery] Guid? branchId,
        [FromQuery] DomainAppointmentStatus? status,
        [FromQuery] DomainAppointmentType? appointmentType,
        [FromQuery] DateOnly? dateFrom,
        [FromQuery] DateOnly? dateTo,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetAppointmentsQuery(pagination, patientId, branchId, status, appointmentType, dateFrom, dateTo), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetAppointmentByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("today")]
    public async Task<IActionResult> GetToday([FromQuery] PaginationRequest pagination, [FromQuery] Guid? branchId, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetTodayAppointmentsQuery(pagination, branchId), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("/api/v{version:apiVersion}/patients/{patientId:guid}/appointments")]
    public async Task<IActionResult> GetByPatient(Guid patientId, [FromQuery] PaginationRequest pagination, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetAppointmentsByPatientQuery(patientId, pagination), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("/api/v{version:apiVersion}/branches/{branchId:guid}/appointments")]
    public async Task<IActionResult> GetByBranch(Guid branchId, [FromQuery] PaginationRequest pagination, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetAppointmentsByBranchQuery(branchId, pagination), ct);
        return OkPaged(result.Value!);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest request, CancellationToken ct)
    {
        var command = new CreateAppointmentCommand(
            request.PatientId,
            request.BranchId,
            (DomainAppointmentType)request.AppointmentType,
            request.AppointmentDate,
            request.StartTime,
            request.EndTime,
            request.Notes,
            request.Items.Select(i => new CreateAppointmentItem(i.LabTestId, i.HealthPackageId)).ToList(),
            request.HomeCollection is null
                ? null
                : new CreateAppointmentHomeCollection(
                    request.HomeCollection.Address,
                    request.HomeCollection.City,
                    request.HomeCollection.Area,
                    request.HomeCollection.Latitude,
                    request.HomeCollection.Longitude,
                    request.HomeCollection.PreferredDate,
                    request.HomeCollection.PreferredTimeFrom,
                    request.HomeCollection.PreferredTimeTo,
                    request.HomeCollection.CollectionNotes));

        var result = await Mediator.Send(command, ct);
        return CreatedResponse(result.Value, $"api/v1/appointments/{result.Value}");
    }

    [HttpPost("{id:guid}/confirm")]
    public async Task<IActionResult> Confirm(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ConfirmAppointmentCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/reschedule")]
    public async Task<IActionResult> Reschedule(Guid id, [FromBody] RescheduleAppointmentRequest request, CancellationToken ct)
    {
        await Mediator.Send(new RescheduleAppointmentCommand(id, request.AppointmentDate, request.StartTime, request.EndTime, request.Notes), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelAppointmentRequest request, CancellationToken ct)
    {
        await Mediator.Send(new CancelAppointmentCommand(id, request.Reason), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/start")]
    public async Task<IActionResult> Start(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new MarkAppointmentInProgressCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new CompleteAppointmentCommand(id), ct);
        return NoContentResponse();
    }
}
