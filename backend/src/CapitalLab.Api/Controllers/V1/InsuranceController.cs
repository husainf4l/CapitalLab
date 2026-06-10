using CapitalLab.Application.Features.Insurance.Commands;
using CapitalLab.Application.Features.Insurance.Queries;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Insurance;
using CapitalLab.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

[Route("api/v{version:apiVersion}/insurance")]
[Authorize(Roles = "SuperAdmin,Owner,BranchAdmin,Receptionist")]
public class InsuranceController(IMediator mediator) : BaseController(mediator)
{
    // ── Providers ─────────────────────────────────────────────────────────────
    [HttpGet("providers")]
    public async Task<IActionResult> GetProviders([FromQuery] bool? activeOnly, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetProvidersQuery(activeOnly), ct);
        return OkResponse(result.Value);
    }

    [HttpPost("providers")]
    public async Task<IActionResult> CreateProvider([FromBody] CreateInsuranceProviderRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(new CreateProviderCommand(
            request.Name, request.Code, request.Phone, request.Email, request.ContactPerson), ct);
        return CreatedResponse(result.Value, $"api/v1/insurance/providers/{result.Value}");
    }

    [HttpPut("providers/{id:guid}")]
    public async Task<IActionResult> UpdateProvider(Guid id, [FromBody] UpdateInsuranceProviderRequest request, CancellationToken ct)
    {
        await Mediator.Send(new UpdateProviderCommand(id, request.Name, request.Phone, request.Email, request.ContactPerson, request.IsActive), ct);
        return NoContentResponse();
    }

    // ── Claims ────────────────────────────────────────────────────────────────
    [HttpGet("claims")]
    public async Task<IActionResult> GetClaims(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? providerId,
        [FromQuery] Guid? patientId,
        [FromQuery] InsuranceClaimStatus? status,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetClaimsQuery(pagination, providerId, patientId, status), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("claims/{id:guid}")]
    public async Task<IActionResult> GetClaim(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetClaimByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost("claims/from-invoice/{invoiceId:guid}")]
    public async Task<IActionResult> CreateClaim(Guid invoiceId, [FromBody] CreateClaimFromInvoiceRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(new CreateClaimFromInvoiceCommand(invoiceId, request.ProviderId, request.ClaimAmount), ct);
        return CreatedResponse(result.Value, $"api/v1/insurance/claims/{result.Value}");
    }

    [HttpPost("claims/{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new SubmitClaimCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPost("claims/{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveClaimRequest request, CancellationToken ct)
    {
        await Mediator.Send(new ApproveClaimCommand(id, request.ApprovedAmount), ct);
        return NoContentResponse();
    }

    [HttpPost("claims/{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectClaimRequest request, CancellationToken ct)
    {
        await Mediator.Send(new RejectClaimCommand(id, request.Reason), ct);
        return NoContentResponse();
    }

    [HttpPost("claims/{id:guid}/mark-paid")]
    public async Task<IActionResult> MarkPaid(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new MarkClaimPaidCommand(id), ct);
        return NoContentResponse();
    }
}
