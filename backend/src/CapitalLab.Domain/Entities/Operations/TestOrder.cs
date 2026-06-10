using CapitalLab.Domain.Common;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Events;

namespace CapitalLab.Domain.Entities.Operations;

public class TestOrder : AggregateRoot
{
    public string OrderNumber { get; private set; } = string.Empty;
    public Guid PatientId { get; private set; }
    public Guid? AppointmentId { get; private set; }
    public Guid BranchId { get; private set; }
    public TestOrderStatus Status { get; private set; } = TestOrderStatus.Draft;
    public decimal SubtotalAmount { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string Currency { get; private set; } = "SAR";
    public string? Notes { get; private set; }
    public string? CancellationReason { get; private set; }

    public Patient Patient { get; private set; } = null!;
    public Appointment? Appointment { get; private set; }
    public Branch Branch { get; private set; } = null!;
    public ICollection<TestOrderItem> Items { get; private set; } = [];

    private TestOrder() { }

    public static TestOrder Create(
        string orderNumber,
        Guid patientId,
        Guid? appointmentId,
        Guid branchId,
        decimal subtotalAmount,
        decimal discountAmount,
        decimal totalAmount,
        string currency,
        string? notes)
    {
        if (subtotalAmount < 0 || discountAmount < 0 || totalAmount < 0)
            throw new ArgumentOutOfRangeException(nameof(totalAmount));

        var order = new TestOrder
        {
            Id = Guid.NewGuid(),
            OrderNumber = orderNumber,
            PatientId = patientId,
            AppointmentId = appointmentId,
            BranchId = branchId,
            Status = TestOrderStatus.Confirmed,
            SubtotalAmount = Math.Round(subtotalAmount, 3),
            DiscountAmount = Math.Round(discountAmount, 3),
            TotalAmount = Math.Round(totalAmount, 3),
            Currency = currency.Trim().ToUpperInvariant(),
            Notes = notes?.Trim()
        };

        order.RaiseDomainEvent(new TestOrderCreatedEvent(order.Id, patientId));
        return order;
    }

    public void Cancel(string? reason)
    {
        if (Status == TestOrderStatus.Completed)
            throw new InvalidOperationException("Cannot cancel a completed order.");
        if (Status == TestOrderStatus.Cancelled)
            return;

        Status = TestOrderStatus.Cancelled;
        CancellationReason = reason?.Trim();
        RaiseDomainEvent(new TestOrderCancelledEvent(Id, PatientId, CancellationReason));
    }
}
