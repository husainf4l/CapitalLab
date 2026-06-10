using CapitalLab.Application.Features.Inventory.Commands;
using CapitalLab.Application.Features.Inventory.Queries;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Inventory;
using CapitalLab.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

[Authorize(Roles = "SuperAdmin,Owner,BranchAdmin,LabTechnician")]
public class InventoryController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet("items")]
    public async Task<IActionResult> GetItems(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? branchId,
        [FromQuery] string? category,
        [FromQuery] bool? lowStockOnly,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetInventoryItemsQuery(pagination, branchId, category, lowStockOnly), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("items/{id:guid}")]
    public async Task<IActionResult> GetItem(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetInventoryItemByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost("items")]
    public async Task<IActionResult> CreateItem([FromBody] CreateInventoryItemRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(new CreateInventoryItemCommand(
            request.BranchId, request.Name, request.Code, request.Category, request.Unit,
            request.InitialStock, request.MinimumStock, request.MaximumStock, request.CostPrice,
            request.SupplierName, request.ExpiryDate, request.BatchNumber), ct);
        return CreatedResponse(result.Value, $"api/v1/inventory/items/{result.Value}");
    }

    [HttpPut("items/{id:guid}")]
    public async Task<IActionResult> UpdateItem(Guid id, [FromBody] UpdateInventoryItemRequest request, CancellationToken ct)
    {
        await Mediator.Send(new UpdateInventoryItemCommand(
            id, request.Name, request.Category, request.Unit, request.MinimumStock,
            request.MaximumStock, request.CostPrice, request.SupplierName, request.ExpiryDate, request.BatchNumber), ct);
        return NoContentResponse();
    }

    [HttpPost("items/{id:guid}/stock-in")]
    public async Task<IActionResult> StockIn(Guid id, [FromBody] StockMovementRequest request, CancellationToken ct)
    {
        await Mediator.Send(new StockInCommand(id, request.Quantity, request.UnitCost, request.Reason, request.ReferenceNumber), ct);
        return NoContentResponse();
    }

    [HttpPost("items/{id:guid}/stock-out")]
    public async Task<IActionResult> StockOut(Guid id, [FromBody] StockMovementRequest request, CancellationToken ct)
    {
        await Mediator.Send(new StockOutCommand(id, request.Quantity, request.UnitCost, request.Reason, request.ReferenceNumber), ct);
        return NoContentResponse();
    }

    [HttpPost("items/{id:guid}/adjust")]
    public async Task<IActionResult> Adjust(Guid id, [FromBody] StockAdjustRequest request, CancellationToken ct)
    {
        await Mediator.Send(new AdjustStockCommand(id, request.NewQuantity, request.Reason), ct);
        return NoContentResponse();
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> LowStock([FromQuery] Guid? branchId, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetLowStockQuery(branchId), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("expiring")]
    public async Task<IActionResult> Expiring([FromQuery] int days, [FromQuery] Guid? branchId, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetExpiringQuery(days, branchId), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> Transactions(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? itemId,
        [FromQuery] Guid? branchId,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetInventoryTransactionsQuery(pagination, itemId, branchId), ct);
        return OkPaged(result.Value!);
    }
}

[Route("api/v{version:apiVersion}/purchase-orders")]
[Authorize(Roles = "SuperAdmin,Owner,BranchAdmin")]
public class PurchaseOrdersController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] Guid? branchId,
        [FromQuery] PurchaseOrderStatus? status,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetPurchaseOrdersQuery(pagination, branchId, status), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetPurchaseOrderByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePurchaseOrderRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(new CreatePurchaseOrderCommand(
            request.BranchId, request.SupplierName, request.Currency, request.Notes,
            request.Items.Select(i => new CreatePurchaseOrderItemInput(i.InventoryItemId, i.Quantity, i.UnitCost)).ToList()), ct);
        return CreatedResponse(result.Value, $"api/v1/purchase-orders/{result.Value}");
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new SubmitPurchaseOrderCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ApprovePurchaseOrderCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/receive")]
    public async Task<IActionResult> Receive(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ReceivePurchaseOrderCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new CancelPurchaseOrderCommand(id), ct);
        return NoContentResponse();
    }
}
