using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.TestOrders;

public record TestOrderItemResponse(
    Guid Id,
    Guid? LabTestId,
    Guid? HealthPackageId,
    OrderItemType ItemType,
    string NameSnapshot,
    string CodeSnapshot,
    int Quantity,
    decimal UnitPrice,
    decimal DiscountAmount,
    decimal TotalPrice,
    string Currency);

public record TestOrderResponse(
    Guid Id,
    string OrderNumber,
    Guid PatientId,
    Guid? AppointmentId,
    Guid BranchId,
    TestOrderStatus Status,
    decimal SubtotalAmount,
    decimal DiscountAmount,
    decimal TotalAmount,
    string Currency,
    string? Notes,
    List<TestOrderItemResponse> Items);

public record TestOrderSummaryResponse(
    Guid Id,
    string OrderNumber,
    Guid PatientId,
    Guid? AppointmentId,
    Guid BranchId,
    TestOrderStatus Status,
    decimal TotalAmount,
    string Currency,
    int ItemCount);
