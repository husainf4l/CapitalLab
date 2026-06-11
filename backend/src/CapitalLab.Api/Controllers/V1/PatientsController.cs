using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Application.Features.Patients.Commands;
using CapitalLab.Application.Features.Patients.Queries;
using CapitalLab.Application.Features.PatientHistory.Queries;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Patients;
using CapitalLab.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

public class PatientsController(IMediator mediator, ICurrentUserService currentUser) : BaseController(mediator)
{
    // ── Patient self-service (JWT-scoped) ────────────────────────────────────

    [HttpGet("profile")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GetMyProfile(CancellationToken ct)
    {
        var patientIdResult = await Mediator.Send(new GetPatientByEmailQuery(currentUser.Email!), ct);
        if (patientIdResult.Value is null) return NotFound();
        var result = await Mediator.Send(new GetPatientByIdQuery(patientIdResult.Value.Value), ct);
        return OkResponse(result.Value);
    }

    [HttpPut("profile")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdatePatientRequest request, CancellationToken ct)
    {
        var patientIdResult = await Mediator.Send(new GetPatientByEmailQuery(currentUser.Email!), ct);
        if (patientIdResult.Value is null) return NotFound();
        await Mediator.Send(new UpdatePatientCommand(
            patientIdResult.Value.Value,
            request.FirstName, request.LastName, request.NameAr,
            (Gender)request.Gender, request.DateOfBirth,
            request.NationalId, request.PassportNumber,
            request.Phone, request.Email,
            request.Address, request.City, request.Area,
            request.EmergencyContactName, request.EmergencyContactPhone,
            request.InsuranceProvider, request.InsuranceNumber,
            request.MedicalHistory, request.Allergies), ct);
        return NoContentResponse();
    }

    [HttpGet("family-members")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GetMyFamilyMembers(CancellationToken ct)
    {
        var patientIdResult = await Mediator.Send(new GetPatientByEmailQuery(currentUser.Email!), ct);
        if (patientIdResult.Value is null) return OkResponse(Array.Empty<object>());
        var result = await Mediator.Send(new GetPatientFamilyMembersQuery(patientIdResult.Value.Value), ct);
        return OkResponse(result.Value);
    }

    // ── Admin / staff ─────────────────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] bool? isActive,
        [FromQuery] Gender? gender,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetPatientsQuery(pagination, isActive, gender), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetPatientByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePatientRequest request, CancellationToken ct)
    {
        var command = new CreatePatientCommand(
            request.FirstName, request.LastName, request.NameAr,
            (Gender)request.Gender, request.DateOfBirth,
            request.NationalId, request.PassportNumber,
            request.Phone, request.Email,
            request.Address, request.City, request.Area,
            request.EmergencyContactName, request.EmergencyContactPhone,
            request.InsuranceProvider, request.InsuranceNumber,
            request.MedicalHistory, request.Allergies);

        var result = await Mediator.Send(command, ct);
        return CreatedResponse(result.Value, $"api/v1/patients/{result.Value}");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePatientRequest request, CancellationToken ct)
    {
        await Mediator.Send(new UpdatePatientCommand(
            id,
            request.FirstName, request.LastName, request.NameAr,
            (Gender)request.Gender, request.DateOfBirth,
            request.NationalId, request.PassportNumber,
            request.Phone, request.Email,
            request.Address, request.City, request.Area,
            request.EmergencyContactName, request.EmergencyContactPhone,
            request.InsuranceProvider, request.InsuranceNumber,
            request.MedicalHistory, request.Allergies), ct);
        return NoContentResponse();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new DeletePatientCommand(id), ct);
        return NoContentResponse();
    }

    [HttpGet("{id:guid}/family-members")]
    public async Task<IActionResult> GetFamilyMembers(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetPatientFamilyMembersQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost("{id:guid}/family-members")]
    public async Task<IActionResult> AddFamilyMember(
        Guid id, [FromBody] AddFamilyMemberRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(
            new AddFamilyMemberCommand(id, request.FamilyPatientId, (FamilyRelationship)request.Relationship), ct);
        return CreatedResponse(result.Value);
    }

    [HttpDelete("family-members/{linkId:guid}")]
    public async Task<IActionResult> RemoveFamilyMember(Guid linkId, CancellationToken ct)
    {
        await Mediator.Send(new RemoveFamilyMemberCommand(linkId), ct);
        return NoContentResponse();
    }

    // ── Personal Health Tracker ──────────────────────────────────────────────
    [HttpGet("{patientId:guid}/result-history")]
    public async Task<IActionResult> GetResultHistory(Guid patientId, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetPatientResultHistoryQuery(patientId), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("{patientId:guid}/trends/{labTestId:guid}")]
    public async Task<IActionResult> GetResultTrend(Guid patientId, Guid labTestId, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetPatientResultTrendQuery(patientId, labTestId), ct);
        return OkResponse(result.Value);
    }
}
