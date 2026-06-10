namespace CapitalLab.Domain.Enums;

public enum PaymentMethod
{
    Cash = 1,
    Card = 2,
    BankTransfer = 3,
    CliQ = 4,
    Insurance = 5,
    Online = 6
}

public enum InvoiceStatus
{
    Draft = 1,
    Issued = 2,
    PartiallyPaid = 3,
    Paid = 4,
    Overdue = 5,
    Cancelled = 6,
    Refunded = 7
}

public enum HomeCollectionStatus
{
    Requested = 1,
    Assigned = 2,
    OnTheWay = 3,
    Arrived = 4,
    Collected = 5,
    Cancelled = 6,
    Failed = 7
}
