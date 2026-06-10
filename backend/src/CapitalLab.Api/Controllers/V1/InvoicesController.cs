using CapitalLab.Application.Features.Billing.Commands;
using CapitalLab.Application.Features.Billing.Queries;
using CapitalLab.Contracts.Billing;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

[Authorize(Roles = "SuperAdmin,Owner,BranchAdmin,Receptionist")]
public class InvoicesController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? branchId,
        [FromQuery] Guid? patientId,
        [FromQuery] InvoiceStatus? status,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetInvoicesQuery(pagination, branchId, patientId, status), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetInvoiceByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInvoiceRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(new CreateInvoiceCommand(
            request.PatientId, request.BranchId, request.TestOrderId, request.Currency,
            request.TaxAmount, request.DiscountAmount, request.DueAt, request.Notes,
            request.Items.Select(i => new CreateInvoiceItemInput(
                i.Description, (InvoiceItemType)i.ItemType, i.ReferenceId, i.Quantity, i.UnitPrice, i.DiscountAmount)).ToList()), ct);
        return CreatedResponse(result.Value, $"api/v1/invoices/{result.Value}");
    }

    [HttpPost("from-order/{testOrderId:guid}")]
    public async Task<IActionResult> CreateFromOrder(Guid testOrderId, CancellationToken ct)
    {
        var result = await Mediator.Send(new CreateInvoiceFromOrderCommand(testOrderId), ct);
        return CreatedResponse(result.Value, $"api/v1/invoices/{result.Value}");
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelInvoiceRequest request, CancellationToken ct)
    {
        await Mediator.Send(new CancelInvoiceCommand(id, request.Reason), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/refund")]
    public async Task<IActionResult> Refund(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new RefundInvoiceCommand(id), ct);
        return NoContentResponse();
    }
}

[Authorize(Roles = "SuperAdmin,Owner,BranchAdmin,Receptionist")]
public class PaymentsController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? branchId,
        [FromQuery] Guid? invoiceId,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetPaymentsQuery(pagination, branchId, invoiceId), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetPaymentByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Record([FromBody] RecordPaymentRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(new RecordPaymentCommand(
            request.InvoiceId, request.Amount, (PaymentMethod)request.Method, request.TransactionReference, request.Notes), ct);
        return CreatedResponse(result.Value, $"api/v1/payments/{result.Value}");
    }

    [HttpPost("{id:guid}/refund")]
    public async Task<IActionResult> Refund(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new RefundPaymentCommand(id), ct);
        return NoContentResponse();
    }

    [HttpGet("~/api/v{version:apiVersion}/patients/{patientId:guid}/payments")]
    public async Task<IActionResult> GetPatientPayments(Guid patientId, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetPatientPaymentsQuery(patientId), ct);
        return OkResponse(result.Value);
    }
}
